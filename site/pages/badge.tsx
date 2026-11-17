import type { DocPage } from "../docs";

export const badge: DocPage = {
	slug: "badge",
	category: "라벨 · 아이콘",
	order: 0,
	title: "Badge",
	summary: "상태 · 개수를 짧게 붙이는 라벨입니다. 의미 색은 `tone`, 모양은 `shape` 로 정합니다.",
	when: [
		["주문 상태 · 알림 개수", "Badge", true],
		["누르거나 지우는 라벨", "Chip", false],
		["사용자가 입력하는 여러 값", "TagInput", false],
	],
	examples: [{ id: "badge/basic", title: "tone · shape" }],
	props: "BadgeProps",
	notes: ['`shape="dot"` 처럼 글자가 없으면 `aria-label` 로 뜻을 줍니다'],
};
