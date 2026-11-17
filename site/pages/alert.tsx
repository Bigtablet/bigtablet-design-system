import type { DocPage } from "../docs";

export const alert: DocPage = {
	slug: "alert",
	category: "알림 · 상태",
	order: 1,
	title: "Alert",
	summary: "확인 · 안내 대화 상자입니다. 마크업 없이 `useConfirm` · `useAlert` 훅으로 띄웁니다.",
	when: [
		["삭제 확인처럼 예 / 아니요만", "`useConfirm`", true],
		["읽고 닫는 안내", "`useAlert` 의 `showAlert`", true],
		["폼 같은 자유 내용", "Modal", false],
		["잠깐 알리고 사라짐", "Toast", false],
	],
	examples: [
		{
			id: "alert/confirm",
			title: "확인 받기",
			desc: "`await confirm(...)` 이 `true` / `false` 를 돌려줍니다.",
		},
		{ id: "alert/notice", title: "안내" },
	],
	notes: [
		"앱 최상위에 `AlertProvider` 를 한 번 둡니다",
		"`onConfirm` 이 Promise 면 끝날 때까지 확인 버튼이 진행 중 상태가 됩니다",
	],
};
