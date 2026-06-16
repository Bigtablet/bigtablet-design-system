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
**Tabs** — Exclusive panel switching. Compound API: \`Tabs\` + \`TabList\` + \`Tab\` + \`TabPanel\`. / 배타적 패널 전환. compound API: \`Tabs\` + \`TabList\` + \`Tab\` + \`TabPanel\`.

Variants: \`line\` (default, bottom underline) / \`fills\` (segmented control). / Variants: \`line\` (기본, 하단 underline) / \`fills\` (segmented control).
WAI-ARIA + roving tabIndex + keyboard (←→/Home/End, skips disabled). / WAI-ARIA + roving tabIndex + 키보드 (←→/Home/End, disabled 스킵).
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
	render: () => (
		<div style={{ width: 480 }}>
			<LineDemo />
		</div>
	),
};

export const Fills: Story = {
	name: "Fills",
	render: () => (
		<div style={{ width: 480 }}>
			<FillsDemo />
		</div>
	),
};

export const Small: Story = {
	name: "Size sm",
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
