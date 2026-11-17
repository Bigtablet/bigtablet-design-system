import type { DocPage } from "../docs";

export const fileInput: DocPage = {
	slug: "file-input",
	category: "파일",
	order: 0,
	title: "FileInput",
	summary: '파일을 고르는 입력입니다. `variant="preview"` 면 고른 이미지를 미리 보여 줍니다.',
	when: [
		["문서 · 첨부 업로드", "FileInput", true],
		["이미지에서 보일 영역을 잘라야 함", "ImageCropper", false],
	],
	examples: [{ id: "file-input/basic", title: "버튼 · 미리보기" }],
	props: "FileInputProps",
};
