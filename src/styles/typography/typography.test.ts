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

	it("each semantic style matches its SCSS mixin", () => {
		const groups = ["display", "heading", "title", "body", "label"] as const;
		let checked = 0;
		for (const group of groups) {
			for (const [key, style] of Object.entries(typography[group])) {
				const mixin = `${group}_${snake(key)}`;
				const body = scss.match(new RegExp(`@mixin ${mixin}\\s*\\{([^}]*)\\}`))?.[1];
				expect(body, `@mixin ${mixin}`).toBeDefined();
				const decl = (prop: string) =>
					scssVar(body?.match(new RegExp(`${prop}:\\s*\\$(\\w+)`))?.[1] ?? "");
				expect(style.fontSize, mixin).toBe(decl("font-size"));
				expect(String(style.fontWeight), mixin).toBe(decl("font-weight"));
				expect(style.lineHeight, mixin).toBe(decl("line-height"));
				expect(style.letterSpacing, mixin).toBe(decl("letter-spacing"));
				checked++;
			}
		}
		// 정규식이 하나도 못 잡고 통과하는 것을 막는다
		expect(checked).toBe(30);
	});
});
