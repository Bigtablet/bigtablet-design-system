import type { DocPage } from "../docs";

export const pageHeader: DocPage = {
	slug: "page-header",
	category: "레이아웃",
	order: 1,
	title: "PageHeader",
	summary: "화면 제목 줄입니다. 경로 · 제목 · 설명 · 액션 · 탭을 한 규칙으로 묶습니다.",
	when: [
		["화면 맨 위 제목과 주요 동작", "PageHeader", true],
		["카드 · 섹션 안의 작은 제목", "Card `heading`", false],
	],
	examples: [
		{ id: "page-header/basic", title: "기본" },
		{
			id: "page-header/tabs",
			title: "탭",
			desc: "`Tabs` 가 PageHeader 와 본문을 함께 감싸고, `tabs` 칸에는 `TabList` 만 넣습니다.",
		},
	],
	props: "PageHeaderProps",
	notes: ["제목은 `h1` 입니다 - 화면에 하나만 둡니다"],
};
