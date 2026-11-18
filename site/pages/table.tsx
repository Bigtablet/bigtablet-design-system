import type { DocPage } from "../docs";

export const table: DocPage = {
	slug: "table",
	category: "데이터",
	order: 0,
	title: "Table",
	name: "표",
	summary: "열 정의 기반 표입니다. 정렬 · 선택 · 로딩 · 빈 상태를 가집니다.",
	when: [
		["같은 형식의 행을 열로 비교", "Table", true],
		["검색 · 페이지까지 있는 목록 화면", "DataView", false],
		["한 항목의 상세", "DescriptionList", false],
		["열 비교가 필요 없는 목록", "ListItem", false],
	],
	examples: [
		{ id: "table/basic", title: "정렬" },
		{ id: "table/loading", title: "불러오는 중" },
	],
	props: ["TableProps", "TableColumn", "TableSort"],
	notes: ["좁은 화면에서 `cards` 면 행이 카드로 바뀝니다"],
};
