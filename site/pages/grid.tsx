import type { DocPage } from "../docs";

export const grid: DocPage = {
	slug: "grid",
	category: "레이아웃",
	order: 5,
	title: "Grid",
	summary: "같은 너비의 칸을 격자로 놓습니다. 열 수를 고정하거나 폭에 따라 자동으로 바꿉니다.",
	when: [
		["같은 너비의 카드 격자", "Grid", true],
		["폭에 따라 열 수가 바뀌는 카드 목록", '`cols="auto"`', true],
		["한 줄 · 한 열로만 흐름", "Stack", false],
		["칸마다 span 이 다른 복잡한 배치", "직접 CSS Grid", false],
	],
	examples: [
		{
			id: "grid/cards",
			title: "고정 열",
			desc: "`singleColOnMobile` 이면 600px 미만에서 한 열이 됩니다.",
		},
		{ id: "grid/auto", title: "자동 열" },
	],
	props: "GridProps",
	notes: ["`rowGap` · `colGap` 은 그 축에서만 `gap` 을 덮어씁니다"],
};
