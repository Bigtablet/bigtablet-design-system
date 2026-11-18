import type { DocPage } from "../docs";

export const combobox: DocPage = {
	slug: "combobox",
	category: "선택",
	order: 1,
	title: "Combobox",
	name: "검색 선택",
	summary: "후보를 서버에서 가져오는 선택 입력입니다. 입력이 멈추면 `onSearch` 를 한 번 부릅니다.",
	when: [
		["후보가 서버에 있어 검색해야 나옴 (담당자 · 회사 · 상품)", "Combobox", true],
		["이미 가진 옵션에서 고르기", "Dropdown (`searchable`)", false],
		["목록 없이 값을 직접 만들어 넣음", "TagInput", false],
	],
	examples: [
		{
			id: "combobox/server-search",
			title: "서버 검색",
			desc: "오래된 응답은 버리고 마지막 입력의 결과만 보여 줍니다.",
		},
	],
	props: "ComboboxProps",
	notes: ["`onSearch` 는 Promise 를 돌려주고, 그동안 목록에 로딩 표시가 뜹니다"],
};
