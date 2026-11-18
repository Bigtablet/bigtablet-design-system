import type { DocPage } from "../docs";

export const emptyState: DocPage = {
	slug: "empty-state",
	category: "알림 · 상태",
	order: 3,
	title: "EmptyState",
	name: "빈 상태",
	summary: "목록이 비었을 때 이유와 다음 동작을 보여 줍니다.",
	when: [
		["아직 데이터가 없음", "EmptyState", true],
		["불러오다 실패함", "ErrorState", false],
		["검색 결과 없음", "EmptyState (검색어를 바꾸라는 안내)", true],
	],
	examples: [{ id: "empty-state/basic", title: "기본" }],
	props: "EmptyStateProps",
	playground: {
		base: { title: "아직 주문이 없습니다", description: "첫 주문이 들어오면 여기에 보입니다." },
	},
};
