import type { DocPage } from "../docs";

export const navBar: DocPage = {
	slug: "nav-bar",
	category: "내비게이션",
	order: 0,
	title: "NavBar",
	name: "상단 메뉴",
	summary: "서비스 맨 위 가로 메뉴입니다. 로고 · 링크 · 언어 전환 · 동작 버튼을 둡니다.",
	when: [
		["마케팅 · 서비스 상단 메뉴", "NavBar", true],
		["관리 화면 왼쪽 메뉴", "Sidebar", false],
	],
	examples: [
		{
			id: "nav-bar/basic",
			title: "기본",
			desc: "좁은 화면에서는 링크 줄이 가로로 스크롤되고 현재 링크가 보이게 맞춥니다.",
		},
	],
	props: ["NavBarProps", "NavLinkProps", "NavBarLocaleConfig", "NavBarLocaleOption"],
};
