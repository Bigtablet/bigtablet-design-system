import type { DocPage } from "../docs";

export const localeProvider: DocPage = {
	slug: "locale-provider",
	category: "System",
	title: "LocaleProvider",
	summary:
		"DS 가 스스로 렌더하는 문구(닫기 · 이전/다음 · 빈 목록 등 58개)를 한곳에서 정합니다. 감싸지 않으면 한국어입니다.",
	when: [
		["영어 화면", '`locale="en"`', true],
		["문구 몇 개만 바꾸기", '`messages={{ "table.empty": … }}`', true],
		["한 곳만 다르게", "그 컴포넌트의 prop (`closeLabel` 등)", false],
	],
	examples: [{ id: "locale-provider/english", title: "영어" }],
	props: "LocaleProviderProps",
	notes: [
		"우선순위: 인스턴스 prop > `messages` > `locale` 카탈로그 > 한국어 기본",
		"`useLocaleText()` 로 같은 문구를 앱에서도 꺼내 씁니다",
	],
};
