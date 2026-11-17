import type { DocPage } from "../docs";

export const imageCropper: DocPage = {
	slug: "image-cropper",
	category: "파일",
	order: 1,
	title: "ImageCropper",
	name: "이미지 자르기",
	summary:
		"업로드 전에 이미지에서 보일 정사각 영역을 정합니다. 결과는 `ref.crop()` 이 `Blob` 으로 줍니다.",
	when: [
		["프로필 · 썸네일 자르기", "ImageCropper", true],
		["그냥 파일 올리기", "FileInput", false],
	],
	examples: [{ id: "image-cropper/avatar", title: "원형" }],
	props: "ImageCropperProps",
	notes: [
		'모달은 포함하지 않습니다. Modal 로 감싸고 "적용" 버튼에서 `crop()` 을 부릅니다',
		"키보드로도 움직이고(방향키) 확대합니다(+ / -)",
	],
};
