import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Home, Settings, ShoppingCart, Users } from "lucide-react";
import * as React from "react";
import { Sidebar, SidebarItem, SidebarSection } from ".";

const meta: Meta<typeof Sidebar> = {
	title: "Components/Navigation/Sidebar",
	component: Sidebar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**Sidebar** - Left navigation for admin/dashboard. Combine \`SidebarItem\` + \`SidebarSection\`. / **Sidebar** - admin/dashboard 좌측 네비게이션. \`SidebarItem\` + \`SidebarSection\` 조합.

\`collapsed\` (240→64px) - icons only, with a favicon node via \`headerCollapsed\`. \`collapsible\` (default true) → floating chevron toggle. \`active={true}\` → \`aria-current="page"\` set automatically. / \`collapsed\` (240→64px) - 아이콘만 표시, \`headerCollapsed\` 로 favicon 노드. \`collapsible\` (기본 true) → floating chevron 토글. \`active={true}\` → \`aria-current="page"\` 자동.

**Responsive** - default \`mode="auto"\`: below viewport \`< 600px\` it automatically transforms into a bottom bar (BottomNav style). Header/footer/section labels are hidden and items become a horizontal stack. Use \`mode="static"\` to disable the transform (admin desktop-only cases). / **Responsive** - 기본 \`mode="auto"\`: viewport \`< 600px\` 에서 자동으로 하단 bar (BottomNav 형태) 로 변신. header/footer/섹션 라벨 hide, 아이템은 horizontal stack. \`mode="static"\` 으로 변신 끄기 (admin desktop-only 케이스).
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

function FaviconHeader() {
	// collapsed 시 표시되는 favicon (작은 정사각형 마크)
	return (
		<img
			src="/images/logo/favicon.png"
			alt="Bigtablet"
			width={28}
			height={28}
			style={{ display: "block", borderRadius: 6 }}
		/>
	);
}

function ProfileFooter({ collapsed = false }: { collapsed?: boolean }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: collapsed ? "8px" : "8px 12px",
				justifyContent: collapsed ? "center" : "flex-start",
			}}
		>
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: 999,
					background: "var(--bt-color-bg-solid-dim)",
					color: "var(--bt-color-text-heading)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontWeight: 600,
					flexShrink: 0,
				}}
			>
				S
			</div>
			{!collapsed && (
				<div style={{ display: "grid", gap: 2, fontSize: 13, minWidth: 0 }}>
					<strong>sangmin</strong>
					<span style={{ color: "var(--bt-color-text-body)", fontSize: 11 }}>sangmin@bigtablet.com</span>
				</div>
			)}
		</div>
	);
}

function FullDemo({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
	const [active, setActive] = React.useState("home");
	const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
	return (
		<div style={{ display: "flex", minHeight: 480, background: "var(--bt-color-bg-solid-dim)" }}>
			<Sidebar
				header={<BrandHeader />}
				headerCollapsed={<FaviconHeader />}
				footer={<ProfileFooter collapsed={collapsed} />}
				collapsed={collapsed}
				onCollapsedChange={setCollapsed}
			>
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
				<p style={{ color: "var(--bt-color-text-body)" }}>현재 활성 페이지의 콘텐츠 영역.</p>
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
	render: () => <FullDemo defaultCollapsed />,
};
