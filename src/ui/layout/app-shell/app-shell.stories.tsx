import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../general/button";
import { NavBar } from "../../navigation/nav-bar";
import { Sidebar, SidebarItem, SidebarSection } from "../../navigation/sidebar";
import { PageHeader } from "../page-header";
import { AppShell } from ".";

const meta: Meta<typeof AppShell> = {
	title: "Components/Layout/AppShell",
	component: AppShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**AppShell** - 관리자·대시보드 화면의 껍데기. 사이드바 열 + 고정 헤더 + 본문.

화면마다 \`<div style={{ display: "flex", minHeight: "100vh" }}>\` 로 다시 만들던 층이고,
그때마다 조용히 빠지던 셋을 여기서 소유한다.

- **문서가 스크롤한다** — 본문을 \`overflow-y: auto\` 로 만들면 \`Modal\`·\`Drawer\` 의 스크롤 잠금
  (\`body { overflow: hidden }\`)이 본문에 닿지 않아 모달 뒤 배경이 계속 스크롤된다
- **콘텐츠 열에 \`min-width: 0\`** — 없으면 넓은 표 하나가 grid 열을 밀어내 화면 전체에 가로 스크롤이 생긴다
- **하단 크롬 여백** — \`Sidebar\` 는 600px 아래에서 fixed BottomBar 로 변신하고 \`BottomNav\` 도 fixed 다.
  본문 끝이 그 아래로 가리지 않게 \`--bt-bottom-inset\` 만큼 띄운다

헤더를 사이드바 위까지 꽉 채우려면 \`AppShell\` 밖에 두면 된다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof AppShell>;

const nav = (
	<Sidebar header={<strong>Bigtablet</strong>} headerCollapsed={<strong>B</strong>}>
		<SidebarSection label="운영">
			<SidebarItem active>대시보드</SidebarItem>
			<SidebarItem>주문</SidebarItem>
			<SidebarItem>매출</SidebarItem>
		</SidebarSection>
		<SidebarSection label="관리">
			<SidebarItem>구성원</SidebarItem>
			<SidebarItem>설정</SidebarItem>
		</SidebarSection>
	</Sidebar>
);

export const Admin: Story = {
	name: "관리자 (사이드바 + 헤더)",
	render: () => (
		<AppShell sidebar={nav} header={<NavBar layout="fluid" sticky brand={<span>관리자</span>} />}>
			<PageHeader
				title="대시보드"
				description="최근 30일 지표를 봅니다"
				actions={<Button size="sm">보고서 내보내기</Button>}
			/>
			{Array.from({ length: 12 }, (_, i) => (
				<p key={i}>스크롤 확인용 문단 {i + 1}</p>
			))}
		</AppShell>
	),
};

export const WithoutSidebar: Story = {
	name: "사이드바 없이",
	parameters: {
		docs: {
			description: {
				story:
					"사이드바를 주지 않으면 열을 만들지 않는다. 마케팅 화면처럼 헤더 + 본문만 쓰는 경우.",
			},
		},
	},
	render: () => (
		<AppShell header={<NavBar sticky brand={<span>Bigtablet</span>} />}>
			<PageHeader title="요금제" description="필요한 만큼만 씁니다" />
			<p>본문</p>
		</AppShell>
	),
};

export const WideContent: Story = {
	name: "넓은 콘텐츠 (열 폭 고정)",
	parameters: {
		docs: {
			description: {
				story:
					"줄바꿈 없는 긴 줄처럼 **자기 넘침을 스스로 처리하지 않는** 자식이 들어와도 콘텐츠 열은 뷰포트 폭에 머문다. 열이 `1fr` 이면 열 자체가 자식 폭까지 늘어나(실측 1024px → 1869px) 고정 헤더와 모든 행이 화면보다 넓어진다. `Table` 처럼 자체 `overflow-x` 래퍼를 가진 컴포넌트는 애초에 이 경로를 타지 않는다.",
			},
		},
	},
	render: () => (
		<AppShell sidebar={nav}>
			<PageHeader title="감사 로그" />
			{/* 스크롤 영역은 키보드로도 닿아야 한다 - tabIndex 가 없으면 axe 가 잡는다
			    (scrollable-region-focusable) */}
			<pre tabIndex={0} style={{ margin: 0, overflowX: "auto" }}>
				2026-09-02T04:00:00Z order_id=01JQ7F3K2M9XV4B8ZC6H1TDWRS actor=sangmin@bigtablet.com
				action=refund.approve amount=1290000 reason=customer_request trace=7f3a91c0e2
			</pre>
		</AppShell>
	),
};

export const NoPadding: Story = {
	name: "여백 없이",
	parameters: {
		docs: {
			description: { story: "`padded={false}` - 화면이 자체 여백을 가질 때." },
		},
	},
	render: () => (
		<AppShell sidebar={nav} padded={false}>
			<div style={{ background: "var(--bt-color-bg-solid)", padding: 24 }}>자체 여백</div>
		</AppShell>
	),
};
