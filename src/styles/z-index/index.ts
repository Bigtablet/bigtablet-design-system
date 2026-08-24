export const zIndex = {
	level0: 0,
	level1: 10,
	level2: 100,
	level3: 200,
	level4: 500,
	level5: 1000,

	/** 컨텐츠 내부 겹침 - sticky 표 헤더, Hero 오버레이 */
	content: 10,
	/** Modal · Drawer · Sidebar · BottomNav */
	chrome: 100,
	/** Toast · NavBar */
	notification: 200,
	/** TopLoading */
	loading: 500,
	/** Tooltip · Popover · Menu · Dropdown 목록 · Alert */
	popup: 1000,
	/** 앱이 소유한 크롬용 대역 - DS chrome(100) 위, notification(200) 아래 */
	appChrome: 150,
} as const;
