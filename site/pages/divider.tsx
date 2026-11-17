import type { DocPage } from "../docs";

export const divider: DocPage = {
	slug: "divider",
	category: "Display",
	title: "Divider",
	summary: "구역을 나누는 선입니다.",
	when: [
		["같은 표면 안의 구역 구분", "Divider", true],
		["페이지 구역 구분", "Section", false],
	],
	examples: [{ id: "divider/basic", title: "굵기" }],
	props: "DividerProps",
};
