import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Home, Settings, ShoppingCart, Users } from "lucide-react";
import * as React from "react";
import { Sidebar, SidebarItem, SidebarSection } from ".";

const meta: Meta<typeof Sidebar> = {
	title: "Components/Sidebar",
	component: Sidebar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**Sidebar**는 admin/dashboard 좌측 메인 네비게이션. **navy bg + 흰 텍스트** 고정. \`SidebarItem\` + \`SidebarSection\`과 함께 사용.

### 언제 쓰는가
- ✅ Admin/dashboard 좌측 영구 네비게이션
- ❌ B2C/마케팅 헤더는 **NavBar**
- ❌ 페이지 위계 표시는 **Breadcrumb**
- ❌ 페이지 내 섹션 전환은 **Tabs**

### collapsed
\`collapsed={true}\`로 너비를 \`240px → 64px\`로 축소, 아이콘만 표시.
label / trailing / section label은 \`opacity:0 + width:0\`으로 숨김 (DOM 유지 → 스크린리더 접근 가능).

### 접근성
\`<aside>\` + 내부 \`<nav>\` 시멘틱. \`active={true}\` → \`aria-current="page"\` 자동.
focus ring은 navy bg에 맞춰 흰색 outline.

### 애니메이션
너비 변화: 200ms (\`transition_base\`). hover/active: 100ms (\`transition_fast\`).

### Next.js Link 통합
\`<SidebarItem as="a" href="/path">\` 형태로 anchor 렌더.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const SAMPLE_ITEMS = [
	{ key: "home", label: "홈", icon: <Home size={20} /> },
	{ key: "users", label: "사용자", icon: <Users size={20} /> },
	{ key: "orders", label: "주문", icon: <ShoppingCart size={20} /> },
	{ key: "settings", label: "설정", icon: <Settings size={20} /> },
];

function BrandHeader() {
	return (
		<img
			src="/images/logo/bigtablet.png"
			alt="Bigtablet"
			height={28}
			style={{ display: "block" }}
		/>
	);
}

function ProfileFooter() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: 999,
					background: "rgba(255,255,255,0.2)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontWeight: 600,
				}}
			>
				S
			</div>
			<div style={{ display: "grid", gap: 2, fontSize: 13 }}>
				<strong>sangmin</strong>
				<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>sangmin@bigtablet.com</span>
			</div>
		</div>
	);
}

function FullDemo({ collapsed = false }: { collapsed?: boolean }) {
	const [active, setActive] = React.useState("home");
	return (
		<div style={{ display: "flex", minHeight: 480, background: "#f4f4f4" }}>
			<Sidebar header={<BrandHeader />} footer={<ProfileFooter />} collapsed={collapsed}>
				<SidebarSection label="Main">
					{SAMPLE_ITEMS.slice(0, 2).map((it) => (
						<SidebarItem
							key={it.key}
							icon={it.icon}
							active={active === it.key}
							onClick={() => setActive(it.key)}
							trailing={it.key === "users" ? <Bell size={14} /> : undefined}
						>
							{it.label}
						</SidebarItem>
					))}
				</SidebarSection>
				<SidebarSection label="Commerce">
					{SAMPLE_ITEMS.slice(2).map((it) => (
						<SidebarItem
							key={it.key}
							icon={it.icon}
							active={active === it.key}
							onClick={() => setActive(it.key)}
						>
							{it.label}
						</SidebarItem>
					))}
				</SidebarSection>
			</Sidebar>
			<main style={{ flex: 1, padding: 32 }}>
				<h2 style={{ margin: 0 }}>{SAMPLE_ITEMS.find((i) => i.key === active)?.label}</h2>
				<p style={{ color: "#666" }}>현재 활성 페이지의 콘텐츠 영역.</p>
			</main>
		</div>
	);
}

export const Default: Story = {
	name: "기본 (펼침)",
	render: () => <FullDemo />,
};

export const Collapsed: Story = {
	name: "Collapsed (아이콘만)",
	render: () => <FullDemo collapsed />,
};
