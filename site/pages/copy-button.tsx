import type { DocPage } from "../docs";

export const copyButton: DocPage = {
	slug: "copy-button",
	category: "버튼",
	order: 2,
	title: "CopyButton",
	name: "복사 버튼",
	summary:
		'텍스트를 클립보드에 복사합니다. 복사되면 2초간 "복사됨" 으로 바뀌고 스크린리더에도 알립니다.',
	when: [
		["링크 · 코드 · 주소를 한 번에 복사", "CopyButton", true],
		["버튼 없이 복사만 (단축키, 메뉴 항목)", "`useClipboard` · `copyText`", false],
	],
	examples: [
		{ id: "copy-button/basic", title: "기본 · 아이콘만" },
		{
			id: "copy-button/in-table",
			title: "여러 개",
			desc: '모두 "복사" 로 들리지 않게 `aria-label` 에 무엇을 복사하는지 담습니다.',
		},
	],
	props: "CopyButtonProps",
	playground: {
		base: { text: "pnpm add @bigtablet/design-system", "aria-label": "설치 명령 복사" },
	},
	notes: [
		'버튼 이름은 바뀌지 않고 보이는 문구만 "복사됨" 으로 바뀝니다. 스크린 리더가 두 번 읽지 않게 하려는 것입니다',
		"Toast 를 함께 띄우면 같은 문구를 두 번 듣습니다. 다른 문구로 맥락을 더하거나 하나만 씁니다",
	],
};
