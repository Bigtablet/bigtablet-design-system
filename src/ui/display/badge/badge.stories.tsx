import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

const meta: Meta<typeof Badge> = {
	title: "Components/Display/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		shape: { control: "select", options: ["dot", "count", "label"] },
		tone: {
			control: "select",
			options: ["accent", "neutral", "info", "success", "warning", "error"],
		},
		appearance: { control: "select", options: ["solid", "soft"] },
		size: { control: "select", options: ["sm", "md", "lg"] },
		count: { control: "number" },
		max: { control: "number" },
		children: { control: "text" },
	},
	args: { shape: "label", tone: "accent", appearance: "solid", size: "md", children: "New" },
	parameters: {
		docs: {
			description: {
				component: `
**Badge** - 작은 상태·카운트 표시. 정적 표시 전용이다 (클릭·삭제는 Chip 참고).

- **Shapes** - \`dot\` / \`count\` / \`label\`
- **Tones** (\`tone\`) - \`accent\` / \`neutral\` / \`info\` / \`success\` / \`warning\` / \`error\`
- **Appearance** - \`solid\` (강한 fill) / \`soft\` (tint 배경 + 진한 글자). 둘 다 WCAG AA 통과
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
			<Badge tone="accent">New</Badge>
			<Badge tone="neutral">Beta</Badge>
			<Badge tone="info">Info</Badge>
			<Badge tone="success">Active</Badge>
			<Badge tone="warning">Pending</Badge>
			<Badge tone="error">Error</Badge>
		</div>
	),
};

export const Counts: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"읽지 않은 개수처럼 **숫자 자체가 정보**일 때 씁니다. `max` 를 주면 넘는 값이 `99+` 로 접혀 뱃지 폭이 들쭉날쭉해지지 않습니다.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<Badge shape="count" count={1} />
			<Badge shape="count" count={9} />
			<Badge shape="count" count={42} />
			<Badge shape="count" count={150} max={99} />
			<Badge shape="count" count={5} tone="error" />
		</div>
	),
};

export const Dots: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"숫자 없이 **있다/없다만** 알리는 형태입니다. 새 알림이 있다는 사실만 중요하고 개수는 중요하지 않을 때, 또는 자리가 좁을 때 씁니다.\n\n점만으로는 스크린리더에 아무것도 남지 않으니 옆 요소의 접근성 이름에 상태를 담으세요.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Badge shape="dot" tone="success" />
			<Badge shape="dot" tone="warning" />
			<Badge shape="dot" tone="error" />
			<Badge shape="dot" tone="accent" />
		</div>
	),
};

export const SolidVsSoft: Story = {
	name: "Solid vs Soft (appearance)",
	parameters: {
		docs: {
			description: {
				story:
					'`appearance="solid"` (기본) - 강한 fill. 알림·상태 강조용. `appearance="soft"` - tint 배경 + 진한 글자. 정보 라벨용. 둘 다 WCAG AA (5~7:1) 를 통과한다.',
			},
		},
	},
	render: () => (
		<div style={{ display: "grid", gap: 24 }}>
			<div>
				<div style={{ fontSize: 12, color: "var(--bt-color-text-caption)", marginBottom: 8 }}>
					solid
				</div>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<Badge tone="accent" appearance="solid">
						New
					</Badge>
					<Badge tone="neutral" appearance="solid">
						Beta
					</Badge>
					<Badge tone="info" appearance="solid">
						Info
					</Badge>
					<Badge tone="success" appearance="solid">
						Active
					</Badge>
					<Badge tone="warning" appearance="solid">
						Pending
					</Badge>
					<Badge tone="error" appearance="solid">
						Error
					</Badge>
				</div>
			</div>
			<div>
				<div style={{ fontSize: 12, color: "var(--bt-color-text-caption)", marginBottom: 8 }}>
					soft
				</div>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<Badge tone="accent" appearance="soft">
						New
					</Badge>
					<Badge tone="neutral" appearance="soft">
						Beta
					</Badge>
					<Badge tone="info" appearance="soft">
						Info
					</Badge>
					<Badge tone="success" appearance="soft">
						+5%
					</Badge>
					<Badge tone="warning" appearance="soft">
						Review
					</Badge>
					<Badge tone="error" appearance="soft">
						Failed
					</Badge>
				</div>
			</div>
		</div>
	),
};
