import type { DocPage } from "../docs";

export const checkbox: DocPage = {
	slug: "checkbox",
	category: "선택",
	order: 2,
	title: "Checkbox",
	summary: "네모 체크 상자입니다. 여러 개를 독립적으로 켜고 끕니다.",
	when: [
		["여러 항목을 각각 켜고 끔 (약관 동의, 필터)", "Checkbox", true],
		["여럿 중 하나만", "RadioGroup", false],
		["즉시 적용되는 설정 켜기/끄기", "Toggle", false],
	],
	examples: [
		{
			id: "checkbox/basic",
			title: "상태",
			desc: "`indeterminate` 는 하위 항목이 일부만 선택됐을 때 씁니다.",
		},
	],
	props: "CheckboxProps",
};
