import type { DocPage } from "../docs";

export const tooltip: DocPage = {
	slug: "tooltip",
	category: "오버레이",
	order: 3,
	title: "Tooltip",
	name: "툴팁",
	summary: "마우스를 올리거나 포커스하면 뜨는 짧은 설명입니다.",
	when: [
		["아이콘 버튼의 이름 · 단축키", "Tooltip", true],
		["누를 수 있는 내용", "Popover", false],
		["꼭 읽어야 하는 안내", "InlineAlert", false],
	],
	examples: [{ id: "tooltip/basic", title: "아이콘 버튼" }],
	props: "TooltipProps",
	notes: ["마우스 · 포커스에서만 뜹니다 - 꼭 알아야 하는 정보는 담지 않습니다"],
};
