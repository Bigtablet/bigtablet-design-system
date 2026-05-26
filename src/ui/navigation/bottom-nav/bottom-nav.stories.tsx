import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, Bell, Home, UtensilsCrossed } from "lucide-react";
import * as React from "react";
import { Badge } from "../../display/badge";
import { BottomNav, BottomNavItem, BottomNavSpacer } from ".";

const meta: Meta<typeof BottomNav> = {
	title: "Components/Navigation/BottomNav",
	component: BottomNav,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		viewport: { defaultViewport: "compact" },
		docs: {
			description: {
				component: `
**BottomNav** — 모바일 하단 네비게이션. 2–5개 \`BottomNavItem\` 으로 구성.

\`position: fixed; bottom: 0\` 으로 viewport 하단 고정. iOS 홈 인디케이터 영역 (\`env(safe-area-inset-bottom)\`) 자동 패딩. 본문이 가려지지 않게 페이지 끝에 \`<BottomNavSpacer />\` 깔거나 \`--bt-bottom-nav-height\` / \`--bt-bottom-nav-total-height\` CSS 변수로 layout 계산.

\`<BottomNavItem icon label active badge as href />\` — \`active\` 시 \`aria-current="page"\` 자동.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

const NAV = [
	{ key: "orders", label: "주문", icon: <Home size={22} /> },
	{ key: "menu", label: "메뉴", icon: <UtensilsCrossed size={22} /> },
	{ key: "sales", label: "매출", icon: <BarChart3 size={22} /> },
];

function PageShell({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				position: "relative",
				minHeight: 480,
				background: "var(--bt-color-bg-solid-dim)",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{children}
		</div>
	);
}

function Demo() {
	const [active, setActive] = React.useState("orders");
	const current = NAV.find((n) => n.key === active);
	return (
		<PageShell>
			<main style={{ flex: 1, padding: 24 }}>
				<h2 style={{ margin: 0, marginBottom: 8 }}>{current?.label}</h2>
				<p style={{ color: "var(--bt-color-text-body)", margin: 0 }}>
					하단 바에서 항목을 탭하면 active 상태가 바뀜.
				</p>
			</main>
			<BottomNavSpacer />
			<BottomNav>
				{NAV.map((n) => (
					<BottomNavItem
						key={n.key}
						icon={n.icon}
						label={n.label}
						active={active === n.key}
						onClick={() => setActive(n.key)}
					/>
				))}
			</BottomNav>
		</PageShell>
	);
}

export const Default: Story = {
	name: "기본 (3 항목)",
	render: () => <Demo />,
};

export const WithBadge: Story = {
	name: "Badge 표시",
	parameters: {
		docs: {
			description: {
				story: "아이콘 우상단에 `badge` prop 으로 알림 dot/카운트 표시. `<Badge>` 컴포넌트 활용.",
			},
		},
	},
	render: () => {
		const [active, setActive] = React.useState("orders");
		return (
			<PageShell>
				<main style={{ flex: 1, padding: 24 }}>
					<p style={{ color: "var(--bt-color-text-body)", margin: 0 }}>알림 매장 — badge 표시 예.</p>
				</main>
				<BottomNavSpacer />
				<BottomNav>
					<BottomNavItem
						icon={<Home size={22} />}
						label="주문"
						active={active === "orders"}
						onClick={() => setActive("orders")}
						badge={<Badge variant="error" shape="count" size="sm" count={3} />}
					/>
					<BottomNavItem
						icon={<Bell size={22} />}
						label="알림"
						active={active === "alerts"}
						onClick={() => setActive("alerts")}
						badge={<Badge variant="error" shape="dot" size="sm" />}
					/>
					<BottomNavItem
						icon={<BarChart3 size={22} />}
						label="매출"
						active={active === "sales"}
						onClick={() => setActive("sales")}
					/>
				</BottomNav>
			</PageShell>
		);
	},
};

export const FiveItems: Story = {
	name: "최대 5 항목",
	parameters: {
		docs: {
			description: {
				story: "5개까지 균등 분할 권장. 그 이상은 라벨 잘림 / 탭 영역 부족.",
			},
		},
	},
	render: () => {
		const items = [
			{ key: "home", label: "홈", icon: <Home size={22} /> },
			{ key: "orders", label: "주문", icon: <Home size={22} /> },
			{ key: "menu", label: "메뉴", icon: <UtensilsCrossed size={22} /> },
			{ key: "sales", label: "매출", icon: <BarChart3 size={22} /> },
			{ key: "alerts", label: "알림", icon: <Bell size={22} /> },
		];
		const [active, setActive] = React.useState("home");
		return (
			<PageShell>
				<main style={{ flex: 1, padding: 24 }}>
					<p style={{ color: "var(--bt-color-text-body)", margin: 0 }}>5 항목 — 균등 분할.</p>
				</main>
				<BottomNavSpacer />
				<BottomNav>
					{items.map((n) => (
						<BottomNavItem
							key={n.key}
							icon={n.icon}
							label={n.label}
							active={active === n.key}
							onClick={() => setActive(n.key)}
						/>
					))}
				</BottomNav>
			</PageShell>
		);
	},
};
