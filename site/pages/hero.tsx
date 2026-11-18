import type { DocPage } from "../docs";

export const hero: DocPage = {
	slug: "hero",
	category: "콘텐츠",
	order: 2,
	title: "Hero",
	name: "히어로",
	summary:
		"마케팅 페이지 맨 위의 큰 제목 구역입니다. 배경 이미지 · 오버레이 · 버튼 두 개를 가집니다.",
	when: [
		["랜딩 첫 화면", "Hero", true],
		["관리 화면 제목", "PageHeader", false],
	],
	examples: [{ id: "hero/basic", title: "기본" }],
	props: ["HeroProps", "HeroAction"],
	notes: ["배경 이미지 위 글자는 `overlay` 로 대비를 맞춥니다"],
};
