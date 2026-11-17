import type { DocPage } from "../docs";

export const field: DocPage = {
	slug: "field",
	category: "Forms",
	title: "Field",
	summary: "라벨 · 도움말 · 에러를 입력 하나에 연결합니다. 입력 11종을 같은 규칙으로 감쌉니다.",
	when: [
		["폼 화면 (라벨 · 에러 · 간격을 한 규칙으로)", "Field", true],
		["서버 에러를 이름으로 한 번에", "Form `errors` + Field", false],
		["라벨 없는 단독 입력 (검색창)", "입력의 `aria-label`", false],
	],
	examples: [
		{
			id: "field/validation",
			title: "입력하면서 검증",
			desc: "`Field` 의 `error` 는 메시지, 입력의 `error` 는 boolean 이라 Field 안에서는 입력에 주지 않습니다.",
		},
	],
	props: "FieldProps",
	notes: ["Field 안에서는 입력에 `label` 을 주지 않습니다 - 두 번 보입니다"],
};
