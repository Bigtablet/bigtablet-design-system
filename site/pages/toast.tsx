import type { DocPage } from "../docs";

export const toast: DocPage = {
	slug: "toast",
	category: "알림 · 상태",
	order: 0,
	title: "Toast",
	name: "토스트",
	summary:
		"잠깐 떴다 사라지는 알림입니다. `useToast()` 로 띄우고 진행 중 → 완료로 바꿀 수 있습니다.",
	when: [
		["저장 · 복사 같은 결과 알림", "Toast", true],
		["화면에 남아야 하는 안내", "InlineAlert", false],
		["사용자 확인이 필요함", "Alert", false],
	],
	examples: [
		{
			id: "toast/basic",
			title: "종류 · 갱신",
			desc: "`duration: Infinity` 면 닫을 때까지 남습니다. `update` 로 내용을 바꾸면서 시간을 다시 줄 수 있습니다. 같은 `id` 로 다시 띄우면 쌓지 않고 갱신합니다.",
		},
	],
	props: ["ToastProviderProps", "ToastOptions", "ToastAction"],
	notes: [
		"앱 최상위에 `ToastProvider` 를 한 번 둡니다",
		"쌓인 토스트가 화면 높이를 넘으면 목록 안에서 스크롤됩니다",
		"최신은 늘 모서리 쪽에 붙고, 5개를 넘으면 반대쪽 끝의 가장 오래된 것이 빠집니다",
		"같은 `id` 로 다시 띄우면 새로 쌓지 않고 그 토스트를 갱신합니다 - 저장을 연달아 눌러도 하나만 남습니다",
	],
};
