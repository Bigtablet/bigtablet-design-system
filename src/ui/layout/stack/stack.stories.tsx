import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from ".";

const meta: Meta<typeof Stack> = {
	title: "Components/Layout/Stack",
	component: Stack,
	tags: ["autodocs"],
	argTypes: {
		direction: { control: "select", options: ["vertical", "horizontal"] },
		gap: { control: "select", options: [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48] },
		align: { control: "select", options: [undefined, "start", "center", "end", "stretch"] },
		justify: {
			control: "select",
			options: [undefined, "start", "center", "end", "between", "around", "evenly"],
		},
		wrap: { control: "select", options: [undefined, "nowrap", "wrap", "wrap-reverse"] },
		as: { control: "text" },
		children: { control: false },
	},
	args: { direction: "vertical", gap: 16 },
	parameters: {
		docs: {
			description: {
				component: `
**Stack** — Flex 기반 1D 레이아웃. 2D 격자는 \`Grid\`.

주요 prop: \`direction\` (\`vertical\`/\`horizontal\`), \`gap\` (px), \`align\` (교차축), \`justify\` (주축), \`wrap\`.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Stack>;

const Item = ({ label, w = 80, h = 48 }: { label: string; w?: number; h?: number }) => (
	<div
		style={{
			width: w,
			height: h,
			background: "var(--bt-color-bg-solid-dim)",
			borderRadius: 6,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 12,
			fontWeight: 600,
			color: "var(--bt-color-text-body)",
			flexShrink: 0,
		}}
	>
		{label}
	</div>
);

export const Horizontal: Story = {
	render: () => (
		<Stack direction="horizontal" gap={12} align="center">
			<Item label="A" />
			<Item label="B" />
			<Item label="C" />
		</Stack>
	),
};

export const GapScale: Story = {
	render: () => (
		<Stack gap={32}>
			{([4, 8, 16, 24, 32] as const).map((gap) => (
				<div key={gap}>
					<p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--bt-color-text-caption)" }}>gap={gap}</p>
					<Stack direction="horizontal" gap={gap} align="center">
						<Item label="1" />
						<Item label="2" />
						<Item label="3" />
					</Stack>
				</div>
			))}
		</Stack>
	),
};

export const JustifyBetween: Story = {
	render: () => (
		<div style={{ width: "100%", border: "1px dashed #DDE3E9", borderRadius: 8, padding: 16 }}>
			<Stack direction="horizontal" gap={0} justify="between" align="center">
				<Item label="Left" w={100} />
				<Item label="Right" w={100} />
			</Stack>
		</div>
	),
};

export const Wrap: Story = {
	render: () => (
		<div style={{ width: 320 }}>
			<Stack direction="horizontal" gap={8} wrap="wrap">
				{Array.from({ length: 8 }, (_, i) => (
					<Item key={`wrap-${i}`} label={`${i + 1}`} w={90} />
				))}
			</Stack>
		</div>
	),
};
