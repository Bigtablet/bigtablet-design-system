import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from ".";

const meta: Meta<typeof Tabs> = {
	title: "Components/Tabs",
	component: Tabs,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Tabs**는 한 영역에 여러 콘텐츠를 전환해 보여주는 컴포넌트.

### Compound API
\`\`\`tsx
<Tabs value={current} onValueChange={setCurrent}>
  <TabList ariaLabel="Settings tabs">
    <Tab value="general">General</Tab>
    <Tab value="security">Security</Tab>
  </TabList>
  <TabPanel value="general">...</TabPanel>
  <TabPanel value="security">...</TabPanel>
</Tabs>
\`\`\`

### Variants
- **line** (기본): 하단 underline. admin 페이지 위계 표시
- **pills**: 둥근 박스. 토글/필터 그룹

### a11y
- WAI-ARIA Tabs 패턴 (\`role="tab"\` / \`role="tabpanel"\`)
- Arrow Left/Right, Home/End 키보드 네비게이션
- 활성 tab만 \`tabIndex=0\` (롤 그룹 진입은 1회)
- \`aria-selected\`, \`aria-controls\`, \`aria-labelledby\` 자동 연결
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

function PillsDemo() {
	const [value, setValue] = React.useState("all");
	return (
		<Tabs value={value} onValueChange={setValue} variant="pills">
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

export const Pills: Story = {
	name: "Pills",
	render: () => (
		<div style={{ width: 480 }}>
			<PillsDemo />
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
