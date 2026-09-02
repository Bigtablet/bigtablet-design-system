import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../general/button";
import { Breadcrumb } from "../../navigation/breadcrumb";
import { Tab, TabList, TabPanel, Tabs } from "../../navigation/tabs";
import { PageHeader } from ".";

const meta: Meta<typeof PageHeader> = {
	title: "Components/Layout/PageHeader",
	component: PageHeader,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**PageHeader** - 화면 제목 줄. 경로 · 제목 · 설명 · 액션 · 탭을 한 규약으로 묶는다.

화면마다 \`<h1 style={{ fontSize: 20, fontWeight: 600 }}>\` 로 다시 만들던 층이다. 제목 크기와
설명 색을 화면마다 정하면 같은 제품 안에서 제목이 서로 다른 크기로 보인다.

제목은 \`h1\` 이다 — 화면의 제목이므로 문서에 하나만 있어야 한다. 겉은 \`<header>\` 가 아니라
\`<div>\` 인데, \`<header>\` 는 \`<main>\` 안에 있어도 banner landmark 로 계산돼(\`main\` 은
sectioning content 가 아니다) \`NavBar\` 와 banner 가 둘이 되기 때문이다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Basic: Story = {
	name: "기본",
	render: () => <PageHeader title="대시보드" description="최근 30일 지표를 봅니다" />,
};

export const WithActions: Story = {
	name: "액션과 함께",
	render: () => (
		<PageHeader
			title="주문 관리"
			description="결제 완료된 주문만 보입니다"
			actions={
				<>
					<Button size="sm" variant="outline">
						내보내기
					</Button>
					<Button size="sm">주문 추가</Button>
				</>
			}
		/>
	),
};

export const Full: Story = {
	name: "경로 · 탭까지",
	parameters: {
		docs: {
			description: {
				story:
					"`breadcrumb` 은 제목 위, `tabs` 는 제목 줄 아래에 붙는다. `Tabs` 는 `PageHeader` 와 본문을 **함께** 감싸야 한다 - `TabList` 만 슬롯에 넣고 패널을 밖에 두면 탭의 `aria-controls` 가 존재하지 않는 요소를 가리킨다.",
			},
		},
	},
	render: () => (
		<Tabs defaultValue="all">
			<PageHeader
				breadcrumb={
					<Breadcrumb
						items={[{ label: "홈", href: "#" }, { label: "운영", href: "#" }, { label: "주문" }]}
					/>
				}
				title="주문 관리"
				description="결제 완료된 주문만 보입니다"
				actions={<Button size="sm">주문 추가</Button>}
				tabs={
					<TabList>
						<Tab value="all">전체</Tab>
						<Tab value="pending">처리 대기</Tab>
						<Tab value="done">완료</Tab>
					</TabList>
				}
			/>
			<TabPanel value="all">전체 주문 목록</TabPanel>
			<TabPanel value="pending">처리 대기 주문</TabPanel>
			<TabPanel value="done">완료된 주문</TabPanel>
		</Tabs>
	),
};

export const LongTitle: Story = {
	name: "긴 제목",
	parameters: {
		docs: {
			description: {
				story: "제목이 길면 줄바꿈하고, 액션은 제목을 밀어내지 않고 다음 줄로 내려간다.",
			},
		},
	},
	render: () => (
		<div style={{ maxWidth: 420 }}>
			<PageHeader
				title="아주 긴 화면 제목이 들어오는 경우의 줄바꿈 확인용 제목"
				actions={<Button size="sm">액션</Button>}
			/>
		</div>
	),
};
