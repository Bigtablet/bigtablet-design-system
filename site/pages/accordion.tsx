import type { DocPage } from "../docs";

export const accordion: DocPage = {
	slug: "accordion",
	category: "콘텐츠",
	order: 4,
	title: "Accordion",
	name: "아코디언",
	summary:
		"제목을 눌러 내용을 펼치고 접습니다. 기본은 하나만 열리고 `multiple` 이면 여럿이 열립니다.",
	when: [
		["FAQ · 긴 설정 묶음", "Accordion", true],
		["보기를 바꾸는 탭", "Tabs", false],
	],
	examples: [{ id: "accordion/faq", title: "FAQ" }],
	props: ["AccordionProps", "AccordionItem"],
	notes: ["제목은 `headingAs` 로 정한 제목 태그 안의 버튼이라, 문서 구조에 맞춰 h2~h6 을 고릅니다"],
};
