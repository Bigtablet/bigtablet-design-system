import type { DocPage } from "../docs";

export const field: DocPage = {
	slug: "field",
	category: "폼",
	order: 0,
	title: "Field · Form",
	summary:
		"`Field` 는 라벨 · 도움말 · 에러를 입력 하나에 연결하고, `Form` 은 서버 에러를 이름으로 받아 각 Field 에 나눠 줍니다.",
	when: [
		["폼 화면 (라벨 · 에러 · 간격을 한 규칙으로)", "Field", true],
		["서버가 돌려준 필드별 에러", "Form `errors` + Field", true],
		["라벨 없는 단독 입력 (검색창)", "입력의 `aria-label`", false],
	],
	examples: [
		{
			id: "field/validation",
			title: "입력하면서 검증",
			desc: "`Field` 의 `error` 는 메시지, 입력의 `error` 는 boolean 이라 Field 안에서는 입력에 주지 않습니다.",
		},
		{
			id: "form/server-errors",
			title: "서버 에러",
			desc: "`errors` 에 이름으로 넘기면 첫 에러 칸으로 포커스가 갑니다. 가입을 눌러 봅니다.",
		},
	],
	props: ["FieldProps", "FormProps", "FormActionsProps"],
	notes: [
		"Field 안에서는 입력에 `label` 을 주지 않습니다 - 두 번 보입니다",
		"Field 의 `error` 가 Form `errors[name]` 보다 우선합니다",
	],
};
