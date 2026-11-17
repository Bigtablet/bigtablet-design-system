import type { DocPage } from "../docs";

export const section: DocPage = {
	slug: "section",
	category: "레이아웃",
	order: 3,
	title: "Section",
	summary: "마케팅 페이지의 구역입니다. 세로 여백과 배경색을 정하고 `<section>` 으로 렌더합니다.",
	when: [
		["페이지를 의미 블록으로 나눔 (히어로 · 기능 · 후기)", "Section", true],
		["끝까지 칠하는 배경 + 제한된 글 폭", "Section + 안쪽 Container", true],
		["가로 폭 제한만", "Container", false],
		["카드 안의 작은 구분", "Stack · Divider", false],
	],
	examples: [{ id: "section/backgrounds", title: "배경" }],
	props: "SectionProps",
};
