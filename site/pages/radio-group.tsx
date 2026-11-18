import type { DocPage } from "../docs";

export const radioGroup: DocPage = {
	slug: "radio-group",
	category: "선택",
	order: 3,
	title: "RadioGroup · Radio",
	name: "라디오",
	summary:
		"여럿 중 하나를 고릅니다. 보통은 `RadioGroup` 안에 `Radio` 를 넣어 그룹 라벨 · 에러 · 방향키 이동을 함께 받습니다.",
	when: [
		["옵션마다 설명을 펼쳐 보여야 함", "RadioGroup", true],
		["그룹 라벨 없이 짧게 몇 개", "Radio 단독 (같은 `name`)", true],
		["옵션이 많음", "Dropdown", false],
		["짧은 2~5개를 한 줄로", "SegmentedControl", false],
	],
	examples: [
		{ id: "radio-group/basic", title: "RadioGroup" },
		{
			id: "radio/basic",
			title: "Radio 단독",
			desc: "그룹 라벨 · 에러가 없을 때만 같은 `name` 으로 묶어 씁니다.",
		},
	],
	props: ["RadioGroupProps", "RadioProps"],
};
