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
**Tabs**는 한 영역에서 서로 배타적인 콘텐츠 패널을 전환하는 네비게이션. \`Tabs\` + \`TabList\` + \`Tab\` + \`TabPanel\` compound API.

### 언제 쓰는가
- ✅ 카테고리 간 전환 (서로 배타적, 한 번에 하나만)
- ✅ 리스트 필터 그룹 — \`variant="fills"\`
- ❌ 점진적 노출 / 여러 섹션 동시 펼침은 **Accordion**
- ❌ 페이지 간 이동은 **NavBar / Sidebar**

### Variants
- \`variant="line"\` (기본) — 하단 underline. 페이지 내 섹션 전환
- \`variant="fills"\` — 둥근 박스 그룹. 카테고리 필터, segmented control 형태

### Compound API
\`\`\`tsx
<Tabs value={current} onValueChange={setCurrent} variant="line">
  <TabList ariaLabel="Settings tabs">
    <Tab value="general">General</Tab>
    <Tab value="security">Security</Tab>
  </TabList>
  <TabPanel value="general">...</TabPanel>
  <TabPanel value="security">...</TabPanel>
</Tabs>
\`\`\`

### 접근성
WAI-ARIA Tabs 패턴 자동 적용: \`role="tab"\` / \`role="tabpanel"\`, \`aria-selected\`, \`aria-controls\`, \`aria-labelledby\`.
**Roving tabIndex** — 활성 tab만 \`tabIndex=0\`, Tab 키 진입은 1회.
**키보드**: <kbd>←</kbd>/<kbd>→</kbd>로 이전·다음 (양 끝 wrap), <kbd>Home</kbd>/<kbd>End</kbd>로 처음·마지막. \`disabled\` tab은 자동 스킵.

### 애니메이션
Tab 색상/border: 200ms (\`transition_base\`). TabPanel 전환은 즉시 (애니메이션 없음).
\`unmountInactive={false}\`로 비활성 panel을 DOM 유지 가능 (스크롤/입력 보존).
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
