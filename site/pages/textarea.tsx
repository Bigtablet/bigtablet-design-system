import type { DocPage } from "../docs";

export const textarea: DocPage = {
	slug: "textarea",
	category: "텍스트 입력",
	order: 1,
	title: "Textarea",
	name: "여러 줄 입력",
	summary: "여러 줄 입력입니다. 내용에 맞춰 `minRows` ~ `maxRows` 사이로 늘어납니다.",
	when: [
		["메모 · 설명 · 문의 내용", "Textarea", true],
		["한 줄 입력", "TextField", false],
	],
	examples: [{ id: "textarea/basic", title: "글자 수 표시" }],
	props: "TextareaProps",
};
