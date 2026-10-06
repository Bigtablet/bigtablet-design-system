import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { baseTypography, typography } from "./index";

// TS 토큰은 React `style` 에, SCSS 토큰은 스타일시트에 쓰인다. 같은 이름이 다른 값을 가지면
// 두 경로로 그린 화면이 어긋난다 - 실제로 TS fontWeight 만 "Regular" 같은 Figma 이름이어서
// `style={typography.body.small}` 의 font-weight 가 무시됐다(#723).
const scss = readFileSync(resolve(__dirname, "_index.scss"), "utf8");

const scssVars = new Map(
	[...scss.matchAll(/^\$(\w+):\s*([^;]+);/gm)].map((m) => [m[1] ?? "", (m[2] ?? "").trim()]),
);
const scssVar = (name: string) => {
	const value = scssVars.get(name);
	if (value === undefined) throw new Error(`SCSS 변수 $${name} 없음`);
	return value;
};

/** `"22-5"` → `22_5`, `semiBold` → `semi_bold` */
const snake = (key: string) =>
	key.replace(/-/g, "_").replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

describe("typography tokens - TS ↔ SCSS", () => {
	it("base font sizes match", () => {
		for (const [key, value] of Object.entries(baseTypography.fontSize)) {
			expect(value, `fontSize ${key}`).toBe(scssVar(`font_size_${snake(key)}`));
		}
	});

	it("base font weights are CSS numbers that match SCSS", () => {
		for (const [key, value] of Object.entries(baseTypography.fontWeight)) {
			expect(typeof value, `fontWeight ${key}`).toBe("number");
			expect(String(value), `fontWeight ${key}`).toBe(scssVar(`font_weight_${snake(key)}`));
		}
	});

	it("base line heights and letter spacings match", () => {
		for (const [key, value] of Object.entries(baseTypography.lineHeight)) {
			expect(value, `lineHeight ${key}`).toBe(scssVar(`line_height_${snake(key)}`));
		}
		for (const [key, value] of Object.entries(baseTypography.letterSpacing)) {
			expect(value, `letterSpacing ${key}`).toBe(scssVar(`letter_spacing_${snake(key)}`));
		}
	});

	// 글자 스타일 믹스인(font-size 를 선언하고 다른 믹스인·미디어쿼리를 부르지 않는 것) 전부.
	// `display_large_responsive` 같은 반응형 믹스인과 `text_truncate` 같은 유틸은 빠진다.
	const styleMixins = new Map(
		[...scss.matchAll(/@mixin (\w+)\s*\{([^}]*)\}/g)]
			.filter((m) => /font-size:/.test(m[2] ?? "") && !/@include|@media/.test(m[2] ?? ""))
			.map((m) => [m[1] ?? "", m[2] ?? ""]),
	);
	const GROUPS = ["display", "heading", "title", "body", "label"];
	/** `display_large_bold` → `display.largeBold`, `caption_bold` → `captionBold` */
	const tsPath = (mixin: string) => {
		const camel = (parts: string[]) =>
			parts.map((p, i) => (i === 0 ? p : p[0]?.toUpperCase() + p.slice(1))).join("");
		const [head = "", ...rest] = mixin.split("_");
		return GROUPS.includes(head) ? [head, camel(rest)] : [camel([head, ...rest])];
	};
	const tsStyle = (path: string[]) =>
		path.reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], typography) as
			| Record<string, string | number>
			| undefined;
	/** SCSS 선언값 - `$변수` 면 풀고, 아니면 리터럴(`-0.02em`) 그대로 */
	const resolve = (raw: string) => (raw.startsWith("$") ? scssVar(raw.slice(1)) : raw);
	const camelProp = (prop: string) => prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

	it("every SCSS text style has a TS twin with the same declarations", () => {
		expect(styleMixins.size).toBeGreaterThan(0);
		for (const [mixin, body] of styleMixins) {
			const style = tsStyle(tsPath(mixin));
			expect(style, `TS typography.${tsPath(mixin).join(".")} (← @mixin ${mixin})`).toBeDefined();
			const decls = [...body.matchAll(/([a-z-]+):\s*([^;]+);/g)];
			for (const [, prop = "", raw = ""] of decls) {
				expect(String(style?.[camelProp(prop)]), `${mixin} ${prop}`).toBe(resolve(raw.trim()));
			}
			// TS 쪽에만 있는 속성도 없어야 한다
			expect(Object.keys(style ?? {}).sort(), mixin).toEqual(
				decls.map(([, prop = ""]) => camelProp(prop)).sort(),
			);
		}
	});

	it("every TS text style has a SCSS mixin", () => {
		const { fontFamily: _fontFamily, ...rest } = typography;
		const paths: string[][] = [];
		for (const [name, value] of Object.entries(rest)) {
			if ("fontSize" in value) paths.push([name]);
			else for (const key of Object.keys(value)) paths.push([name, key]);
		}
		const mixinOf = (path: string[]) => path.map((p) => snake(p)).join("_");
		for (const path of paths) {
			expect(
				styleMixins.has(mixinOf(path)),
				`@mixin ${mixinOf(path)} (← typography.${path.join(".")})`,
			).toBe(true);
		}
		expect(paths.length).toBe(styleMixins.size);
	});
});
