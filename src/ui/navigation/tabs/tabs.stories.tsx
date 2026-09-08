import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from ".";

const meta: Meta<typeof Tabs> = {
	title: "Components/Navigation/Tabs",
	component: Tabs,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Tabs** - 배타적 패널 전환. compound API: \`Tabs\` + \`TabList\` + \`Tab\` + \`TabPanel\`.

Variants: \`line\` (기본, 하단 underline) / \`fills\` (segmented control).
WAI-ARIA + roving tabIndex + 키보드 (←→/Home/End, disabled 는 건너뜀).
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function LineDemo() {
	const [value, setValue] = React.useState("overview");
	return (
		<Tabs value={value} onValueChange={setValue}>
			<TabList ariaLabel="Project sections">
				<Tab value="overview">Overview</Tab>
				<Tab value="activity">Activity</Tab>
				<Tab value="settings">Settings</Tab>
			</TabList>
			<TabPanel value="overview">
				<p style={{ margin: 0 }}>Overview 콘텐츠 영역입니다.</p>
			</TabPanel>
			<TabPanel value="activity">
				<p style={{ margin: 0 }}>최근 활동 내역.</p>
			</TabPanel>
			<TabPanel value="settings">
				<p style={{ margin: 0 }}>프로젝트 설정.</p>
			</TabPanel>
		</Tabs>
	);
}

function FillsDemo() {
	const [value, setValue] = React.useState("all");
	return (
		<Tabs value={value} onValueChange={setValue} variant="fills">
			<TabList ariaLabel="Filter">
				<Tab value="all">전체</Tab>
				<Tab value="active">활성</Tab>
				<Tab value="archived">보관</Tab>
			</TabList>
			<TabPanel value="all">전체 결과</TabPanel>
			<TabPanel value="active">활성만</TabPanel>
			<TabPanel value="archived">보관만</TabPanel>
		</Tabs>
	);
}

export const Line: Story = {
	name: "Line (기본)",
	parameters: {
		docs: {
			description: {
				story:
					"기본값입니다. **같은 화면 안에서 패널을 갈아 끼우는** 용도지 페이지 이동이 아닙니다 - 주소가 바뀌어야 하면 `NavBar`/`Sidebar` 쪽입니다.\n\n키보드는 roving tabIndex 로 동작합니다(←→/Home/End, `disabled` 는 건너뜀). Tab 키는 탭 목록을 통째로 지나 패널로 갑니다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 480 }}>
			<LineDemo />
		</div>
	),
};

export const Fills: Story = {
	name: "Fills",
	parameters: {
		docs: {
			description: {
				story:
					"segmented control 형태입니다. 항목이 **둘~셋이고 라벨이 짧을 때** 어울립니다 - 넷 이상이면 칸이 좁아져 `line` 쪽이 읽기 쉽습니다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 480 }}>
			<FillsDemo />
		</div>
	),
};

export const Small: Story = {
	name: "Size sm",
	parameters: {
		docs: {
			description: {
				story:
					"카드나 패널 안에 넣을 때 씁니다. 페이지 최상단의 주 탭에는 기본 크기를 두세요 - 작은 탭이 페이지 제목과 경쟁하면 위계가 흐려집니다.",
			},
		},
	},
	render: () => {
		const Demo = () => {
			const [v, setV] = React.useState("a");
			return (
				<Tabs value={v} onValueChange={setV} size="sm">
					<TabList>
						<Tab value="a">A</Tab>
						<Tab value="b">B</Tab>
						<Tab value="c">C</Tab>
					</TabList>
					<TabPanel value="a">Panel A</TabPanel>
					<TabPanel value="b">Panel B</TabPanel>
					<TabPanel value="c">Panel C</TabPanel>
				</Tabs>
			);
		};
		return (
			<div style={{ width: 320 }}>
				<Demo />
			</div>
		);
	},
};
