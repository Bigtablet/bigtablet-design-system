import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

const meta: Meta<typeof Badge> = {
	title: "Components/Badge",
	component: Badge,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Badge**는 작은 상태/카운트 표시. `dot` / `count` / `label` 3가지 shape, 6가지 variant (accent/neutral + 4 status).",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Labels: Story = {
	name: "Label (variant 비교)",
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
			<Badge variant="accent">New</Badge>
			<Badge variant="neutral">Beta</Badge>
			<Badge variant="info">Info</Badge>
			<Badge variant="success">Active</Badge>
			<Badge variant="warning">Pending</Badge>
			<Badge variant="error">Error</Badge>
		</div>
	),
};

export const Counts: Story = {
	name: "Count",
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<Badge shape="count" count={1} />
			<Badge shape="count" count={9} />
			<Badge shape="count" count={42} />
			<Badge shape="count" count={150} max={99} />
			<Badge shape="count" count={5} variant="error" />
		</div>
	),
};

export const Dots: Story = {
	name: "Dot",
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Badge shape="dot" variant="success" />
			<Badge shape="dot" variant="warning" />
			<Badge shape="dot" variant="error" />
			<Badge shape="dot" variant="accent" />
		</div>
	),
};

export const NotificationExample: Story = {
	name: "사용 예 — 알림 표시",
	render: () => (
		<div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
			<span style={{ fontSize: 20 }}>🔔</span>
			<Badge shape="count" count={3} variant="error" />
		</div>
	),
};
