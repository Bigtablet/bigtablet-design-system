import type { DocPage } from "../docs";

export const popover: DocPage = {
	slug: "popover",
	category: "오버레이",
	order: 2,
	title: "Popover",
	name: "팝오버",
	summary: "버튼 옆에 붙는 작은 패널입니다. 안에 입력을 둘 수 있습니다.",
	when: [
		["짧은 폼 · 선택지", "Popover", true],
		["동작 목록", "Menu", false],
		["설명 한 줄", "Tooltip", false],
	],
	examples: [
		{
			id: "popover/basic",
			title: "빠른 메모",
			desc: "안에 입력이 있으면 스크롤해도 닫히지 않습니다.",
		},
	],
	props: "PopoverProps",
};
