import type { DocPage } from "../docs";

export const errorState: DocPage = {
	slug: "error-state",
	category: "알림 · 상태",
	order: 4,
	title: "ErrorState",
	name: "오류 상태",
	summary: "불러오기 실패를 알리고 다시 시도할 동작을 둡니다. 화면 전체 · 위젯 크기를 고릅니다.",
	when: [
		["데이터를 못 불러옴", "ErrorState", true],
		["비어 있을 뿐", "EmptyState", false],
		["입력 값 오류", "Field `error`", false],
	],
	examples: [{ id: "error-state/basic", title: "위젯" }],
	props: "ErrorStateProps",
};
