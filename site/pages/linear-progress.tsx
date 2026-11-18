import type { DocPage } from "../docs";

export const linearProgress: DocPage = {
	slug: "linear-progress",
	category: "내비게이션",
	order: 6.5,
	title: "LinearProgress",
	name: "단계 진행 막대",
	summary: "단계형 진행 막대입니다. 몇 단계 중 몇 번째인지 보여 줍니다.",
	when: [
		["단계 수만 보여 주면 됨", "LinearProgress", true],
		["단계 이름까지 보여 줌", "Stepper", false],
		["페이지 불러오기", "TopLoading", false],
	],
	examples: [{ id: "linear-progress/steps", title: "4단계 중 2" }],
	props: "LinearProgressProps",
};
