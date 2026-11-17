import type { DocPage } from "../docs";

export const bottomNav: DocPage = {
	slug: "bottom-nav",
	category: "내비게이션",
	order: 2,
	title: "BottomNav",
	name: "하단 메뉴",
	summary: "모바일 화면 아래에 고정되는 주요 메뉴입니다. 2~5개 항목을 둡니다.",
	when: [
		["모바일 앱형 화면의 주요 이동", "BottomNav", true],
		["관리 화면의 메뉴", "Sidebar (600px 미만에서 하단 바로 바뀜)", false],
		["같은 화면의 보기 전환", "Tabs", false],
	],
	examples: [
		{
			id: "bottom-nav/basic",
			title: "기본",
			desc: '`active` 면 `aria-current="page"` 가 붙습니다.',
			frame: 360,
		},
	],
	props: ["BottomNavProps", "BottomNavItemProps"],
	notes: [
		"`position: fixed` 라 본문 끝을 가립니다 - `BottomNavSpacer` 를 깔거나 `--bt-bottom-nav-total-height` 로 여백을 잡습니다",
		"라벨은 짧게 - 넘치면 말줄임으로 잘립니다",
	],
};
