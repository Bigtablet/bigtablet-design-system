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
	notes: [
		"좁은 화면에서 `cards` 면 행이 카드로 바뀝니다",
		'상태 배지 · 바뀌는 버튼 글자처럼 행마다 길이가 달라지는 칸이 있으면 `layout="fixed"` 로 둡니다. 바뀌는 칸은 가장 긴 값으로 `width` 를 재고, 이름처럼 길이를 모르는 열 하나는 너비 없이 `truncate` 로 남는 폭을 가져가게 합니다',
	],
};
