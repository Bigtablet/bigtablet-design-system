import type { DocPage } from "../docs";

export const dataView: DocPage = {
	slug: "data-view",
	category: "데이터",
	order: 1,
	title: "DataView",
	name: "목록 화면",
	summary:
		"목록 화면 한 덩어리입니다. 표 · 검색 · 선택 동작 · 페이지 · 로딩 · 빈 상태 · 오류를 함께 맡습니다.",
	when: [
		["관리 화면의 목록", "DataView", true],
		["표만 필요", "Table", false],
		["한 항목의 상세", "DescriptionList", false],
	],
	examples: [
		{
			id: "data-view/orders",
			title: "주문 목록",
			desc: "`query` 에 `{ data, isLoading, error, refetch }` 를 그대로 넘깁니다 - React Query 결과 모양과 같습니다.",
		},
	],
	props: "DataViewProps",
	notes: ["`selectionActions` 를 주면 행 선택과 일괄 동작 바가 생깁니다"],
};
