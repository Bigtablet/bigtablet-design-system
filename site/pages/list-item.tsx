import type { DocPage } from "../docs";

export const listItem: DocPage = {
	slug: "list-item",
	category: "데이터",
	order: 3,
	title: "ListItem",
	summary: "한 줄짜리 항목입니다. 앞 · 뒤 칸에 아이콘 · 컨트롤을 넣습니다.",
	when: [
		["설정 목록 · 메뉴 목록", "ListItem", true],
		["열로 비교하는 목록", "Table", false],
	],
	examples: [{ id: "list-item/settings", title: "설정 목록" }],
	props: "ListItemProps",
};
