import type { DocPage } from "../docs";

export const sidebar: DocPage = {
	slug: "sidebar",
	category: "Navigation",
	title: "Sidebar",
	summary: "관리 화면 왼쪽 메뉴입니다. 접을 수 있고 600px 미만에서는 하단 바로 바뀝니다.",
	when: [
		["관리 · 대시보드 메뉴", "Sidebar (AppShell `sidebar`)", true],
		["서비스 상단 메뉴", "NavBar", false],
		["모바일 앱형 하단 메뉴", "BottomNav", false],
	],
	examples: [
		{
			id: "sidebar/basic",
			title: "접기",
			desc: "`collapsible` 이면 아이콘만 남게 접힙니다.",
			frame: 420,
		},
	],
	props: ["SidebarProps", "SidebarSectionProps", "SidebarItemProps"],
};
