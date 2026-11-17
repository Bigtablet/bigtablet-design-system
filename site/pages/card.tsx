import type { DocPage } from "../docs";

export const card: DocPage = {
	slug: "card",
	category: "콘텐츠",
	order: 0,
	title: "Card",
	name: "카드",
	summary: "내용을 한 덩어리로 묶는 표면입니다. 제목 · 하단 버튼 칸을 가집니다.",
	when: [
		["요약 · 설정 묶음", "Card", true],
		["이미지가 주인공인 카드", "MediaCard", false],
		["통계 숫자 하나", "Stat", false],
	],
	examples: [{ id: "card/basic", title: "기본 · 테두리" }],
	props: "CardProps",
	playground: {
		base: { heading: "팀 요금제" },
		children: "인원 제한 없이 월 9만 원입니다.",
		omit: ["headingAs", "footerAlign"],
	},
	notes: ["`interactive` 면 카드 전체가 눌리는 표면이 되므로 안에 다른 버튼을 두지 않습니다"],
};
