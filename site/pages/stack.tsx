import type { DocPage } from "../docs";

export const stack: DocPage = {
	slug: "stack",
	category: "Layout",
	title: "Stack",
	summary: "한 줄 또는 한 열로 흐르는 배치입니다. 간격은 spacing 토큰 값만 받습니다.",
	when: [
		["아바타 + 이름, 버튼 줄, 폼 줄", "Stack", true],
		["m열 × n행 격자", "Grid", false],
		["가로 폭 제한", "Container", false],
	],
	examples: [
		{
			id: "stack/basic",
			title: "가로 배치",
			desc: "가로일 때 `align` 은 세로 정렬, `justify` 는 가로 정렬입니다.",
		},
	],
	props: "StackProps",
	notes: [
		"권장 간격 - 아이콘 + 글자 4~8, 폼 줄 8~12, 카드 안 12~16, 카드 사이 16~24, 큰 구역 40~48",
	],
};
