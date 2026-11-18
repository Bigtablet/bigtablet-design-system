import type { DocPage } from "../docs";

export const tagInput: DocPage = {
	slug: "tag-input",
	category: "텍스트 입력",
	order: 3,
	title: "TagInput",
	name: "태그 입력",
	summary: "목록에 없는 값을 사용자가 직접 만들어 넣는 다중 입력입니다.",
	when: [
		["자유 키워드 · 라벨 · 이메일 여러 개", "TagInput", true],
		["정해진 후보에서 여럿", "Dropdown `multiple`", false],
		["후보가 서버에 있음", "Combobox", false],
	],
	examples: [
		{
			id: "tag-input/basic",
			title: "기본",
			desc: "Enter 로 추가하고 Backspace 로 마지막 태그를 지웁니다.",
		},
		{ id: "tag-input/states", title: "비활성" },
	],
	props: "TagInputProps",
};
