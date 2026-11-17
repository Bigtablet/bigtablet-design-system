import type { DocPage } from "../docs";

export const form: DocPage = {
	slug: "form",
	category: "Forms",
	title: "Form",
	summary: "폼 전체의 서버 에러를 이름으로 받습니다. 제출 뒤 첫 에러 칸으로 포커스를 옮깁니다.",
	when: [
		["서버가 돌려준 필드별 에러", "Form `errors`", true],
		["입력하면서 검증", "Field `error`", false],
	],
	examples: [{ id: "form/server-errors", title: "서버 에러", desc: "가입을 눌러 봅니다." }],
	props: ["FormProps", "FormActionsProps"],
	notes: ["Field 의 `error` 가 Form `errors[name]` 보다 우선합니다"],
};
