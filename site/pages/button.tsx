import type { DocPage } from "../docs";

export const button: DocPage = {
	slug: "button",
	category: "General",
	title: "Button",
	summary: "글자가 있는 버튼입니다. `href` 를 주거나 `as={Link}` 로 링크로도 렌더합니다.",
	when: [
		["저장 · 제출 · 다음 같은 동작 (글자가 보임)", "Button", true],
		["다른 화면으로 이동하는 버튼 모양 링크", "Button `href` / `as={Link}`", true],
		["아이콘만 있는 동작 (닫기, 더보기, 툴바)", "IconButton", false],
		["값을 클립보드에 복사", "CopyButton", false],
	],
	examples: [
		{
			id: "button/variants",
			title: "모양",
			desc: "화면에서 가장 중요한 동작 하나만 `filled` 로 둡니다.",
		},
		{ id: "button/sizes", title: "크기" },
		{
			id: "button/danger",
			title: "위험한 동작 · 비활성",
			desc: "되돌릴 수 없는 동작에는 `danger` 를 줍니다.",
		},
	],
	props: "ButtonProps",
	notes: [
		"`disabled` 인 링크(`href`)는 `<a>` 를 유지하고 `aria-disabled` 로 막습니다 - 포커스는 갑니다",
	],
};
