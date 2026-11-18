import type { DocPage } from "../docs";

export const inlineAlert: DocPage = {
	slug: "inline-alert",
	category: "알림 · 상태",
	order: 2,
	title: "InlineAlert",
	name: "안내 띠",
	summary: "화면 안에 고정해 두는 알림 띠입니다. 닫기 버튼을 둘 수 있습니다.",
	when: [
		["화면을 떠나도 남아야 하는 안내 (만료 예정 · 권한 없음)", "InlineAlert", true],
		["잠깐 알리고 사라짐", "Toast", false],
		["사용자 확인이 필요함", "Alert", false],
	],
	examples: [{ id: "inline-alert/basic", title: "경고 · 닫기" }],
	props: "InlineAlertProps",
	playground: { base: { title: "결제 수단 만료 예정" }, children: "설정에서 카드를 바꿔 주세요." },
};
