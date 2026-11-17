import type { DocPage } from "../docs";

export const stat: DocPage = {
	slug: "stat",
	category: "데이터",
	order: 4,
	title: "Stat",
	name: "통계 숫자",
	summary: "숫자 하나와 변화량을 보여 줍니다.",
	when: [
		["대시보드 숫자", "Stat", true],
		["여러 숫자를 비교하는 표", "Table", false],
	],
	examples: [{ id: "stat/basic", title: "변화량" }],
	props: "StatProps",
	notes: ["`deltaTone` 은 좋음 · 나쁨이라 숫자 부호와 따로 줍니다 (비용이 줄면 positive)"],
};
