import type { DocPage } from "../docs";

export const radioGroup: DocPage = {
	slug: "radio-group",
	category: "Forms",
	title: "RadioGroup",
	summary: "여럿 중 하나를 고르는 묶음입니다. 방향키로 옮기고 그룹에 라벨 · 에러가 붙습니다.",
	when: [
		["옵션마다 설명을 펼쳐 보여야 함", "RadioGroup", true],
		["옵션이 많음", "Dropdown", false],
		["짧은 2~5개를 한 줄로", "SegmentedControl", false],
	],
	examples: [{ id: "radio-group/basic", title: "기본" }],
	props: "RadioGroupProps",
};
