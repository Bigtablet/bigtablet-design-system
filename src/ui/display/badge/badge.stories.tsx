import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

const meta: Meta<typeof Badge> = {
	title: "Components/Display/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		shape: { control: "select", options: ["dot", "count", "label"] },
		variant: { control: "select", options: ["accent", "neutral", "info", "success", "warning", "error"] },
		appearance: { control: "select", options: ["solid", "soft"] },
		size: { control: "select", options: ["sm", "md", "lg"] },
		count: { control: "number" },
		max: { control: "number" },
		children: { control: "text" },
	},
	args: { shape: "label", variant: "accent", appearance: "solid", size: "md", children: "New" },
	parameters: {
		docs: {
			description: {
				component: `
**Badge** — Small status/count indicator. Static display only (no click/remove — see Chip).
작은 상태/카운트 표시. 정적 표시 전용 (클릭/삭제 X — Chip 참고).

- **Shapes** — \`dot\` / \`count\` / \`label\`
- **Variants** — \`accent\` / \`neutral\` / \`info\` / \`success\` / \`warning\` / \`error\`
- **Appearance** — \`solid\` (strong fill) / \`soft\` (tint bg + dark text), both WCAG AA. / 강한 fill / tint 배경 + 진한 글자
- \`count > max\` → \`{max}+\`
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

export const SolidVsSoft: Story = {
	name: "Solid vs Soft (appearance)",
	parameters: {
		docs: {
			description: {
				story:
					"`appearance=\"solid\"` (default) — strong fill, for notification / status emphasis. `appearance=\"soft\"` — tint bg + dark text, for info labels. Both pass WCAG AA (5~7:1). / 강한 fill (기본) vs tint 배경 + 진한 글자. 둘 다 AA 통과.",
			},
		},
	},
	render: () => (
		<div style={{ display: "grid", gap: 24 }}>
			<div>
				<div style={{ fontSize: 12, color: "var(--bt-color-text-caption)", marginBottom: 8 }}>solid</div>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<Badge variant="accent" appearance="solid">New</Badge>
					<Badge variant="neutral" appearance="solid">Beta</Badge>
					<Badge variant="info" appearance="solid">Info</Badge>
					<Badge variant="success" appearance="solid">Active</Badge>
					<Badge variant="warning" appearance="solid">Pending</Badge>
					<Badge variant="error" appearance="solid">Error</Badge>
				</div>
			</div>
			<div>
				<div style={{ fontSize: 12, color: "var(--bt-color-text-caption)", marginBottom: 8 }}>soft</div>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<Badge variant="accent" appearance="soft">New</Badge>
					<Badge variant="neutral" appearance="soft">Beta</Badge>
					<Badge variant="info" appearance="soft">Info</Badge>
					<Badge variant="success" appearance="soft">+5%</Badge>
					<Badge variant="warning" appearance="soft">Review</Badge>
					<Badge variant="error" appearance="soft">Failed</Badge>
				</div>
			</div>
		</div>
	),
};
