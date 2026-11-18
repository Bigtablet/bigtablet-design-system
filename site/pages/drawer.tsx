import type { DocPage } from "../docs";

export const drawer: DocPage = {
	slug: "drawer",
	category: "오버레이",
	order: 1,
	title: "Drawer",
	name: "서랍 패널",
	summary: "옆이나 아래에서 나오는 패널입니다. 뒤 화면을 일부 보여 줍니다.",
	when: [
		["필터 · 상세 보기", "Drawer", true],
		["모바일 하단 시트", 'Drawer `placement="bottom"`', true],
		["가운데 대화 상자", "Modal", false],
	],
	examples: [{ id: "drawer/filters", title: "필터 패널" }],
	props: "DrawerProps",
	notes: ["포커스 트랩 · Esc 닫기 · 배경 스크롤 잠금은 Modal 과 같습니다"],
};
