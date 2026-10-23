/**
 * 토큰 검사 - 원본은 `tokens.json` 이다.
 *
 * SCSS(`<폴더>/_tokens.scss`) · TS(`<폴더>/index.ts`) · 테마 CSS 변수(`_theme-tokens.scss`)는 `scripts/build-tokens.mjs`
 * 가 만든다. 여기서는 (1) 커밋된 생성 파일이 원본과 같은지, (2) 손으로 쓴 `cssVars` 와 생성 결과가
 * 맞물리는지, (3) 생성기의 cssMode 규칙이 컴파일된 SCSS 에서 의도대로 나오는지를 본다.
 */
import { readFileSync } from "node:fs";
import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";
import { stale } from "../../scripts/build-tokens.mjs";
import { colors } from "./colors";
import { cssVars } from "./css-vars";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { baseTypography } from "./typography";

// ── SCSS 컴파일 ────────────────────────────────────────────────────────────

const compile = (source: string) =>
	compileString(source, { loadPaths: [process.cwd()], url: new URL(`file://${process.cwd()}/`) })
		.css;

/** `@use` 한 모듈의 변수 전부 → { 이름: 값 } */
const moduleVariables = (path: string): Record<string, string> => {
	const css = compile(`
		@use "sass:meta";
		@use "${path}" as m;
		@each $name, $value in meta.module-variables("m") {
			.v { --#{$name}: #{meta.inspect($value)}; }
		}
	`);
	return Object.fromEntries(
		// Sass 는 `_` 와 `-` 를 같은 이름으로 보고 `-` 로 돌려준다 - 선언한 모양(`_`)으로 되돌린다
		[...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name = "", value = ""]) => [
			name.replaceAll("-", "_"),
			value.trim(),
		]),
	);
};

/** CSS 블록 본문 안의 `--bt-*` 선언 */
const declarations = (block: string): Record<string, string> =>
	Object.fromEntries(
		[...block.matchAll(/(--bt-[\w-]+):\s*([^;]+);/g)].map(([, name = "", value = ""]) => [
			name,
			value.trim(),
		]),
	);

const themeCss = compile(
	readFileSync("src/styles/theme.scss", "utf8").replaceAll('"./', '"src/styles/'),
);
const lightVars = declarations(themeCss.match(/^:root\s*\{([^}]*)\}/m)?.[1] ?? "");
const darkVars = declarations(
	themeCss.match(/\[data-theme=["']?dark["']?\]\s*\{([^}]*)\}/)?.[1] ?? "",
);
const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// ── 검사 ─────────────────────────────────────────────────────────────────

describe("design tokens", () => {
	it("committed generated files match tokens.json (pnpm tokens)", () => {
		expect(stale()).toEqual([]);
	});

	it("compiles the theme", () => {
		expect(Object.keys(lightVars).length).toBeGreaterThan(50);
		expect(Object.keys(darkVars).length).toBeGreaterThan(30);
	});

	it("every theme color variable has a TS colors entry", () => {
		const covered = new Set(
			Object.entries(colors).flatMap(([group, values]) =>
				Object.keys(values).map((key) => `--bt-color-${group}-${kebab(key)}`),
			),
		);
		const missing = Object.keys(lightVars).filter(
			(name) => name.startsWith("--bt-color-") && !covered.has(name),
		);
		expect(missing).toEqual([]);
	});

	it("cssVars only points at variables the theme defines, in both themes where they change", () => {
		const referenced: string[] = JSON.stringify(cssVars).match(/--bt-[\w-]+/g) ?? [];
		expect(referenced.length).toBeGreaterThan(50);
		expect(referenced.filter((name) => !(name in lightVars))).toEqual([]);
		// light/dark 가 다른 변수는 전부 cssVars 로 닿을 수 있어야 한다 - 인라인 스타일이 dark 를 따라가는 길
		const themed = Object.keys(darkVars).filter((name) =>
			/^--bt-(color|elevation|focus-ring)/.test(name),
		);
		expect(themed.filter((name) => !referenced.includes(name))).toEqual([]);
	});

	it("radius/spacing CSS vars keep the TS values as both definition and SCSS fallback", () => {
		const scss = {
			...moduleVariables("src/styles/radius"),
			...moduleVariables("src/styles/spacing"),
		};
		const rows = [
			...Object.entries(radius).map(([key, value]) => ["radius", key, value] as const),
			...Object.entries(spacing).map(([key, value]) => ["spacing", key, value] as const),
		];
		const wrong = rows.flatMap(([group, key, value]) => {
			const name = `--bt-${group}-${key}`;
			const expected = { root: value, scss: `var(${name}, ${value})` };
			const actual = { root: lightVars[name], scss: scss[`${group}_${key}`] };
			return JSON.stringify(actual) === JSON.stringify(expected)
				? []
				: [{ name, actual, expected }];
		});
		expect(wrong).toEqual([]);
	});

	it("--bt-font-family definition matches the SCSS fallback and the TS primary family", () => {
		const root = lightVars["--bt-font-family"];
		expect(root?.startsWith(`"${baseTypography.fontFamily.primary}"`)).toBe(true);
		expect(moduleVariables("src/styles/typography").font_family_primary).toBe(
			`var(--bt-font-family, ${root})`,
		);
	});
});
