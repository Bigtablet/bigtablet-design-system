/**
 * 토큰 drift 검사 - SCSS 가 기준이다.
 *
 * 실제 화면에 쓰이는 값은 `colors/_index.scss`(raw) 와 `theme.scss`(CSS 변수, light/dark)다. TS export ·
 * `tokens.json` 은 그 값을 옮겨 적은 사본이라 손으로 고치다 보면 갈린다(caption 이 `neutral-500` 을
 * 가리키거나 accent 가 navy 로 남았던 것). 여기서 SCSS 를 실제로 컴파일해 나온 값과 대조한다.
 */
import { readFileSync } from "node:fs";
import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";
import { a11y, controlHeight } from "./a11y";
import { baseColors, colors } from "./colors";
import { cssVars } from "./css-vars";
import { elevation } from "./elevation";
import { radius } from "./radius";
import { skeleton } from "./skeleton";
import { spacing } from "./spacing";

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
const scssColors = moduleVariables("src/styles/colors");
const scssA11y = moduleVariables("src/styles/a11y");

// ── 값 정규화 ─────────────────────────────────────────────────────────────
// 같은 색이 `#FFF` · `#ffffff` · `rgba(255, 255, 255, 1)` · `white` 로 다르게 적힐 수 있다.

const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000", transparent: "#0000" };

const toRgba = (color: string): string => {
	let c = color.trim().toLowerCase();
	c = NAMED[c] ?? c;
	const hex = c.match(/^#([0-9a-f]{3,8})$/)?.[1];
	if (hex) {
		const full = hex.length <= 4 ? [...hex].map((h) => h + h).join("") : hex;
		const [r, g, b, a = 255] = full.match(/../g)?.map((h) => Number.parseInt(h, 16)) ?? [];
		return `${r},${g},${b},${Math.round((a / 255) * 100) / 100}`;
	}
	const fn = c.match(/^rgba?\(([^)]+)\)$/)?.[1];
	if (fn) {
		const [r, g, b, a = "1"] = fn.split(/[\s,/]+/).filter(Boolean);
		return `${Number(r)},${Number(g)},${Number(b)},${Math.round(Number(a) * 100) / 100}`;
	}
	return c;
};

/** 색이든 그림자든 비교 가능한 형태로 */
const norm = (value: string): string =>
	value
		.replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]+\)/gi, (m) => `rgba(${toRgba(m)})`)
		.replace(/\b0px\b/g, "0")
		.replace(/\s+/g, " ")
		.replace(/\s*,\s*/g, ",")
		.trim();

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
/** `alphaBlack12` → `alpha_black_12` */
const snake = (key: string) =>
	key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`).replace(/(\D)(\d)/g, "$1_$2");

// ── tokens.json ───────────────────────────────────────────────────────────

type JsonToken = {
	$value: unknown;
	$extensions?: { "com.bigtablet.theme"?: { dark?: string } };
};
const json = JSON.parse(readFileSync("src/styles/tokens.json", "utf8"));
const jsonBaseColors: Record<string, JsonToken> = json.base.color;
const jsonSemanticColors: Record<string, Record<string, JsonToken>> = json.semantic.color;

/** `{base.color.neutral-0}` 참조를 따라간다 */
const resolve = (value: string): string => {
	const ref = value.match(/^\{(.+)\}$/)?.[1];
	if (!ref) return value;
	const target = ref.split(".").reduce((node, key) => node?.[key], json);
	if (!target) throw new Error(`tokens.json: 참조 대상이 없다 - ${value}`);
	return resolve(target.$value);
};

const shadowToCss = (
	layers: { x: number; y: number; blur: number; spread: number; color: string }[],
) => layers.map((l) => `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`).join(", ");

/** 실패 메시지에 어긋난 이름이 바로 보이도록 { 이름: [기대, 실제] } 로 모은다 */
const mismatches = (pairs: [string, string | undefined, string | undefined][]) =>
	Object.fromEntries(
		pairs
			.filter(
				([, expected, actual]) =>
					actual === undefined || expected === undefined || norm(expected) !== norm(actual),
			)
			.map(([name, expected, actual]) => [name, [expected, actual]]),
	);

// ── 검사 ─────────────────────────────────────────────────────────────────

describe("design tokens stay in sync with SCSS", () => {
	it("compiles the theme and the SCSS modules", () => {
		expect(Object.keys(lightVars).length).toBeGreaterThan(50);
		expect(Object.keys(darkVars).length).toBeGreaterThan(30);
		expect(scssColors.color_base_neutral_0).toBeDefined();
	});

	it("TS baseColors equal the SCSS $color_base_* values", () => {
		expect(
			mismatches(
				Object.entries(baseColors).map(([key, value]) => [
					key,
					scssColors[`color_base_${snake(key)}`],
					value,
				]),
			),
		).toEqual({});
	});

	it("TS colors equal the light theme CSS variables, key for key", () => {
		const pairs = Object.entries(colors).flatMap(([group, values]) =>
			Object.entries(values).map(([key, value]): [string, string | undefined, string] => {
				const name = `--bt-color-${group}-${kebab(key)}`;
				return [name, lightVars[name], value];
			}),
		);
		expect(mismatches(pairs)).toEqual({});
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

	it("TS elevation, focus rings and skeleton equal the light theme", () => {
		expect(
			mismatches([
				...Object.entries(elevation).map(([key, value]): [string, string | undefined, string] => [
					`--bt-elevation-${key}`,
					lightVars[`--bt-elevation-${key}`],
					value,
				]),
				["--bt-focus-ring", lightVars["--bt-focus-ring"], a11y.focusRing],
				["--bt-focus-ring-error", lightVars["--bt-focus-ring-error"], a11y.focusRingError],
				["--bt-focus-ring-success", lightVars["--bt-focus-ring-success"], a11y.focusRingSuccess],
				...Object.entries(skeleton.color).map(
					([key, value]): [string, string | undefined, string] => [
						`skeleton.color.${key}`,
						lightVars[`--bt-color-skeleton-${key}`],
						value,
					],
				),
			]),
		).toEqual({});
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

	it("controlHeight equals the SCSS $control_height_* steps", () => {
		expect(
			mismatches(
				Object.entries(controlHeight).map(([key, value]) => [
					key,
					scssA11y[`control_height_${key}`],
					value,
				]),
			),
		).toEqual({});
		expect(
			mismatches(
				Object.entries(controlHeight).map(([key, value]) => [
					key,
					resolve(json.semantic.control.height[key].$value),
					value,
				]),
			),
		).toEqual({});
	});

	describe("tokens.json", () => {
		it("base colors equal the SCSS $color_base_* values, both ways", () => {
			expect(
				mismatches(
					Object.entries(jsonBaseColors).map(([key, token]) => [
						key,
						scssColors[`color_base_${key.replaceAll("-", "_")}`],
						resolve(token.$value as string),
					]),
				),
			).toEqual({});
			const jsonKeys = new Set(
				Object.keys(jsonBaseColors).map((k) => `color_base_${k.replaceAll("-", "_")}`),
			);
			expect(
				Object.keys(scssColors).filter((n) => n.startsWith("color_base_") && !jsonKeys.has(n)),
			).toEqual([]);
		});

		it("semantic colors equal the theme in light and dark (or the fixed SCSS value)", () => {
			const pairs = Object.entries(jsonSemanticColors).flatMap(([group, tokens]) =>
				Object.entries(tokens).flatMap(
					([key, token]): [string, string | undefined, string | undefined][] => {
						const name = `--bt-color-${group}-${key}`;
						const light = resolve(token.$value as string);
						const dark = token.$extensions?.["com.bigtablet.theme"]?.dark;
						// CSS 변수가 없는 것은 테마와 무관한 고정 alpha(on-dark · scrim)다 - SCSS 변수와 대조
						if (!(name in lightVars)) {
							return [
								[
									`$color_${group}_${key.replaceAll("-", "_")}`,
									scssColors[`color_${group}_${key.replaceAll("-", "_")}`],
									light,
								],
							];
						}
						return [
							[name, lightVars[name], light],
							[`${name} (dark)`, darkVars[name] ?? lightVars[name], dark ? resolve(dark) : light],
						];
					},
				),
			);
			expect(mismatches(pairs)).toEqual({});
		});

		it("covers every theme color variable", () => {
			const jsonNames = new Set(
				Object.entries(jsonSemanticColors).flatMap(([group, tokens]) =>
					Object.keys(tokens).map((key) => `--bt-color-${group}-${key}`),
				),
			);
			expect(
				Object.keys(lightVars).filter((n) => n.startsWith("--bt-color-") && !jsonNames.has(n)),
			).toEqual([]);
		});

		it("elevation equals the light theme shadows", () => {
			expect(
				mismatches(
					Object.entries(
						json.base.elevation as Record<string, { $value: Parameters<typeof shadowToCss>[0] }>,
					).map(([key, token]) => {
						const name = `--bt-elevation-${key.replace("-", "")}`;
						return [name, lightVars[name], shadowToCss(token.$value)];
					}),
				),
			).toEqual({});
		});
	});
});
