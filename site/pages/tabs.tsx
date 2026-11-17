import type { DocPage } from "../docs";

export const tabs: DocPage = {
	slug: "tabs",
	category: "내비게이션",
	order: 3,
	title: "Tabs",
	name: "탭",
	summary: "같은 화면 안에서 내용 패널을 바꿉니다. 방향키로 탭을 옮깁니다.",
	when: [
		["같은 화면의 내용 전환", "Tabs", true],
		["값 하나 고르기 (보기 방식 · 기간)", "SegmentedControl", false],
		["다른 화면으로 이동", "NavBar · Sidebar", false],
	],
	examples: [
		{ id: "tabs/basic", title: "기본" },
		{
			id: "tabs/with-segmented",
			title: "SegmentedControl 과 함께",
			desc: "밑줄 탭은 내용 패널을 바꾸고, 알약 모양 SegmentedControl 은 그 안의 값 하나를 고릅니다. 모양으로 역할이 구분됩니다.",
		},
		{
			id: "tabs/fills-lookalike",
			title: "`fills` 를 쓰지 않는 이유",
			desc: '`variant="fills"`(위)는 SegmentedControl(아래)과 거의 같아 보여 역할이 헷갈립니다. 밑줄(`line`)을 씁니다.',
		},
	],
	props: ["TabsProps", "TabListProps", "TabProps", "TabPanelProps"],
	notes: ["화면 제목 줄에 탭을 둘 때는 PageHeader `tabs` 를 씁니다"],
};
