import type { DocPage } from "../docs";

export const dropdown: DocPage = {
	slug: "dropdown",
	category: "선택",
	order: 0,
	title: "Dropdown",
	name: "드롭다운",
	summary:
		"정해진 목록에서 하나(또는 `multiple` 로 여럿)를 고릅니다. `searchable` 로 목록 안을 검색합니다.",
	when: [
		["이미 가진 옵션 목록에서 고르기", "Dropdown", true],
		["후보가 서버에 있음", "Combobox", false],
		["2~5개를 한눈에 보이게 두고 전환", "SegmentedControl", false],
		["옵션마다 설명이 길어 펼쳐 보여야 함", "RadioGroup", false],
	],
	examples: [
		{ id: "dropdown/basic", title: "기본" },
		{ id: "dropdown/multiple-search", title: "여러 개 · 검색" },
		{ id: "dropdown/states", title: "필수 · 비활성" },
	],
	props: ["DropdownSingleProps", "DropdownMultipleProps"],
	notes: [
		"목록은 `body` 로 포털로 렌더되어 `overflow: hidden` 부모에 잘리지 않습니다",
		"트리거가 스크롤로 화면 밖에 나가면 목록이 닫힙니다",
	],
};
