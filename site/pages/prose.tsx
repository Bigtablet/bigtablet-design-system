import type { DocPage } from "../docs";

export const prose: DocPage = {
	slug: "prose",
	category: "콘텐츠",
	order: 3,
	title: "Prose",
	summary: "클래스가 없는 글 마크업(h · p · ul · a …)에 타이포 규칙을 입힙니다.",
	when: [
		["CMS · 마크다운에서 온 본문", "Prose", true],
		["컴포넌트로 만든 화면", "각 컴포넌트", false],
	],
	examples: [{ id: "prose/article", title: "본문" }],
	props: "ProseProps",
};
