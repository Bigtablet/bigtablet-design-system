import type { DocPage } from "../docs";

export const textField: DocPage = {
	slug: "text-field",
	category: "텍스트 입력",
	order: 0,
	title: "TextField",
	summary: "한 줄 텍스트 입력입니다. 아이콘 · 지우기 · 비밀번호 보기 버튼을 칸 안에 넣습니다.",
	when: [
		["이름 · 이메일 · 검색어", "TextField", true],
		["여러 줄", "Textarea", false],
		["목록에서 고르기", "Dropdown · Combobox", false],
		["칩으로 여러 개", "TagInput", false],
		["칸이 나뉜 인증 코드", "OtpInput", false],
	],
	examples: [{ id: "text-field/basic", title: "기본 · 아이콘 · 에러" }],
	props: "TextFieldProps",
	notes: ["폼 화면에서는 Field 로 감싸고 `label` 은 Field 에 줍니다"],
};
