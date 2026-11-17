import type { DocPage } from "../docs";

export const timeline: DocPage = {
	slug: "timeline",
	category: "데이터",
	order: 5,
	title: "Timeline",
	name: "타임라인",
	summary: "시간 순 기록입니다. 각 항목에 상태 점과 시각을 둡니다.",
	when: [
		["주문 추적 · 활동 로그", "Timeline", true],
		["사용자가 밟아 가는 절차", "Stepper", false],
	],
	examples: [{ id: "timeline/order", title: "주문 추적" }],
	props: "TimelineProps",
};
