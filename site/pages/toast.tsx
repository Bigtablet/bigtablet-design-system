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
		{ id: "toast/basic", title: "종류 · 갱신", desc: "`duration: 0` 이면 닫을 때까지 남습니다." },
	],
	props: "ToastProviderProps",
	notes: [
		"앱 최상위에 `ToastProvider` 를 한 번 둡니다",
		"쌓인 토스트가 화면 높이를 넘으면 목록 안에서 스크롤됩니다",
	],
};
