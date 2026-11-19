import type { DocPage } from "../docs";

export const localeProvider: DocPage = {
	slug: "locale-provider",
	category: "앱 설정",
	order: 1,
	title: "LocaleProvider",
	name: "다국어",
	summary:
		"DS 가 스스로 렌더하는 문구(닫기 · 이전/다음 · 빈 목록 등 82개)를 한곳에서 정합니다. 감싸지 않으면 한국어입니다.",
	when: [
		["영어 화면", '`locale="en"`', true],
		["문구 몇 개만 바꾸기", '`messages={{ "table.empty": … }}`', true],
		["한 곳만 다르게", "그 컴포넌트의 prop (`closeLabel` 등)", false],
	],
	examples: [
		{
			id: "locale-provider/english",
			title: "영어",
			desc: '첫 번째는 감싸지 않은 기본(한국어), 두 번째는 `locale="en"` 입니다 - 좁은 화면에서는 위아래로 놓입니다. 안내 문구 · 버튼 · 빈 목록처럼 DS 가 직접 그리는 글만 바뀌고 앱이 넘긴 `label` 은 그대로입니다.',
		},
	],
	props: "LocaleProviderProps",
	notes: [
		"우선순위: 인스턴스 prop > `messages` > `locale` 카탈로그 > 한국어 기본",
		"`useLocaleText()` 로 같은 문구를 앱에서도 꺼내 씁니다",
	],
};
