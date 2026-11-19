import { describe, expect, it } from "vitest";
import { AVOID, avoidDoc, RECIPES, tokensDoc } from "./llms-docs";
import props from "./props.json";

// 에이전트 문서(dist/llms)가 소스와 어긋나면 에이전트가 틀린 코드를 자신 있게 쓴다 (#1093).
// 사이트 테스트는 browser 프로젝트에서만 돌아 이름이 .browser 다 - 브라우저 기능은 쓰지 않는다
const examples = import.meta.glob("./examples/**/*.tsx");

describe("llms docs", () => {
	it("lists avoided props that are really gone and replacements that really exist", () => {
		for (const row of AVOID.filter((a) => a.props)) {
			const names = (props as Record<string, { name: string }[]>)[row.props as string]?.map(
				(p) => p.name,
			);
			expect(names, row.props).toBeDefined();
			expect(names).not.toContain(row.avoid);
			expect(names).toContain(row.use);
		}
		expect(avoidDoc()).toContain("| Dropdown `onChange` | `onValueChange` |");
	});

	it("builds every recipe from a real example file", () => {
		for (const r of RECIPES) expect(Object.keys(examples)).toContain(`./examples/${r.id}.tsx`);
	});

	it("writes token names and values from tokens.json", () => {
		const doc = tokensDoc();
		expect(doc).toContain("`token.$color_text_heading` | `--bt-color-text-heading` |");
		// 하위 묶음(heading.large)과 토큰 하나뿐인 경로(caption) 모두
		expect(doc).toContain("`@include token.heading_large`");
		expect(doc).toContain("`@include token.caption`");
		expect(doc).toContain("`token.$font_family_primary`");
		// 간격 단계는 있고, 지어낸 사이 값은 없다
		expect(doc).toContain("token.$spacing_16");
		expect(doc).not.toContain("token.$spacing_18");
	});
});
