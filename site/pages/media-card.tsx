import type { DocPage } from "../docs";

export const mediaCard: DocPage = {
	slug: "media-card",
	category: "Display",
	title: "MediaCard",
	summary: "이미지가 주인공인 카드입니다. 이미지 위치는 위 · 왼쪽 · 겹치기 중에 고릅니다.",
	when: [
		["글 · 상품 · 사례 목록", "MediaCard", true],
		["이미지 없는 카드", "Card", false],
		["페이지 첫 화면", "Hero", false],
	],
	examples: [{ id: "media-card/basic", title: "기본" }],
	props: "MediaCardProps",
};
