import type { DocPage } from "../docs";

export const spinner: DocPage = {
	slug: "spinner",
	category: "로딩",
	order: 0,
	title: "Spinner",
	summary: "돌아가는 로딩 표시입니다.",
	when: [
		["버튼 · 작은 영역의 짧은 대기", "Spinner", true],
		["모양을 아는 내용", "Skeleton", false],
	],
	examples: [{ id: "spinner/basic", title: "크기" }],
	props: "SpinnerProps",
	notes: ["무엇을 기다리는지 `ariaLabel` 로 알려 줍니다"],
};
