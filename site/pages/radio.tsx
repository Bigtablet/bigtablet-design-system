import type { DocPage } from "../docs";

export const radio: DocPage = {
	slug: "radio",
	category: "Forms",
	title: "Radio",
	summary: "단독 라디오입니다. 라벨 · 에러 · 필수 표시가 필요하면 RadioGroup 을 씁니다.",
	when: [
		["그룹 라벨 없이 짧게 몇 개", "Radio", true],
		["라벨 · 에러가 있는 선택", "RadioGroup", false],
	],
	examples: [{ id: "radio/basic", title: "기본" }],
	props: "RadioProps",
};
