import type { DocPage } from "../docs";

export const iconButton: DocPage = {
	slug: "icon-button",
	category: "버튼",
	order: 1,
	title: "IconButton",
	name: "아이콘 버튼",
	summary:
		"아이콘만 있는 버튼입니다. `aria-label` 이나 `aria-labelledby` 가 없으면 컴파일되지 않습니다.",
	when: [
		["닫기 · 더보기 · 툴바처럼 아이콘만으로 뜻이 통하는 동작", "IconButton", true],
		["글자가 보여야 하는 동작", "Button", false],
		["값을 복사하는 아이콘 버튼", "CopyButton `iconOnly`", false],
	],
	examples: [
		{ id: "icon-button/variants", title: "모양", desc: "variant 이름은 Button 과 같습니다." },
		{
			id: "icon-button/toolbar",
			title: "툴바",
			desc: '여러 개를 묶을 때는 `role="toolbar"` 와 이름을 줍니다.',
		},
	],
	props: "IconButtonProps",
	notes: ["아이콘은 `aria-hidden` 으로 감싸집니다 - 이름은 `aria-label` 로만 전해집니다"],
};
