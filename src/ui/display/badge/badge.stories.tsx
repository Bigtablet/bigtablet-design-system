import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

const meta: Meta<typeof Badge> = {
	title: "Components/Display/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		shape: { control: "select", options: ["dot", "count", "label"] },
		variant: { control: "select", options: ["accent", "neutral", "info", "success", "warning", "error"] },
		size: { control: "select", options: ["sm", "md", "lg"] },
		count: { control: "number" },
		max: { control: "number" },
		children: { control: "text" },
	},
	args: { shape: "label", variant: "accent", size: "md", children: "New" },
	parameters: {
		docs: {
			description: {
				component: `
**Badge** — 작은 상태/카운트 표시. 정적 표시 전용 (클릭/삭제 X — Chip 참고).

Shapes: \`dot\` / \`count\` / \`label\`.
Variants: \`accent\` / \`neutral\` / \`info\` / \`success\` / \`warning\` / \`error\`.
\`count > max\` → \`{max}+\` 로 표시.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Labels: Story = {
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
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Badge shape="dot" variant="success" />
			<Badge shape="dot" variant="warning" />
			<Badge shape="dot" variant="error" />
			<Badge shape="dot" variant="accent" />
		</div>
	),
};
