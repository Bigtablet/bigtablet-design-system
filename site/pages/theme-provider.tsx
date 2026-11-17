import type { DocPage } from "../docs";

export const themeProvider: DocPage = {
	slug: "theme-provider",
	category: "시작하기",
	order: 0,
	title: "ThemeProvider",
	name: "테마",
	summary:
		"라이트 · 다크를 화면에서 전환할 때 씁니다. 대상 요소에 `data-theme` 를 붙여 CSS 변수를 바꿉니다.",
	when: [
		["앱 안에 테마 전환 버튼이 있음", "ThemeProvider + `useTheme`", true],
		["OS 설정만 따르면 됨", "Provider 없이 - `prefers-color-scheme` 로 자동", false],
	],
	examples: [
		{
			id: "theme-provider/toggle",
			title: "전환 버튼",
			desc: "`resolved` 는 `system` 을 실제 적용된 테마로 풀어 줍니다.",
		},
	],
	props: "ThemeProviderProps",
	notes: ["SSR 에서 첫 화면이 깜빡이지 않게 하려면 THEMING 문서의 SSR / FOUC 절을 봅니다"],
};
