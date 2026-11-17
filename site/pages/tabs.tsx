import type { DocPage } from "../docs";

export const tabs: DocPage = {
	slug: "tabs",
	category: "내비게이션",
	order: 3,
	title: "Tabs",
	summary: "같은 화면 안에서 내용 패널을 바꿉니다. 방향키로 탭을 옮깁니다.",
	when: [
		["같은 화면의 내용 전환", "Tabs", true],
		["값 하나 고르기 (보기 방식 · 기간)", "SegmentedControl", false],
		["다른 화면으로 이동", "NavBar · Sidebar", false],
	],
	examples: [{ id: "tabs/basic", title: "기본" }],
	props: ["TabsProps", "TabListProps", "TabProps", "TabPanelProps"],
	notes: ["화면 제목 줄에 탭을 둘 때는 PageHeader `tabs` 를 씁니다"],
};
