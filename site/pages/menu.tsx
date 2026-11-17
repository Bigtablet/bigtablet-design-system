import type { DocPage } from "../docs";

export const menu: DocPage = {
	slug: "menu",
	category: "내비게이션",
	order: 7,
	title: "Menu",
	name: "메뉴",
	summary: "버튼을 누르면 뜨는 동작 목록입니다. 방향키로 옮기고 Enter 로 고릅니다.",
	when: [
		["더보기 · 행 동작 목록", "Menu", true],
		["값을 고르는 입력", "Dropdown", false],
		["폼 같은 자유 내용", "Popover", false],
	],
	examples: [{ id: "menu/basic", title: "행 동작", desc: "`destructive` 항목은 빨간 글자입니다." }],
	props: "MenuProps",
};
