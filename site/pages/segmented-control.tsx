import type { DocPage } from "../docs";

export const segmentedControl: DocPage = {
	slug: "segmented-control",
	category: "선택",
	order: 5,
	title: "SegmentedControl",
	name: "세그먼트",
	summary: "짧은 옵션 2~5개 중 하나를 고릅니다. 고른 칸만 떠오른 표면으로 채웁니다.",
	when: [
		["보기 방식 · 기간 · 통화처럼 짧은 옵션 몇 개", "SegmentedControl", true],
		["옵션이 많거나 김", "Dropdown", false],
		["같은 화면의 내용 패널 전환", "Tabs", false],
	],
	examples: [{ id: "segmented-control/basic", title: "기본" }],
	props: "SegmentedControlProps",
	notes: ["native radio 기반이라 방향키 이동과 폼 제출을 브라우저가 처리합니다"],
};
