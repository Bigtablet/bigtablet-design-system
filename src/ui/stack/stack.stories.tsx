import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from ".";

const meta: Meta<typeof Stack> = {
	title: "Layout/Stack",
	component: Stack,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Stack** — Flex 기반 1D 레이아웃. `direction`으로 수직/수평, `gap`으로 간격, `align`/`justify`로 정렬 제어.",
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
			background: "#DDE3E9",
			borderRadius: 6,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 12,
			fontWeight: 600,
			color: "#47555E",
			flexShrink: 0,
		}}
	>
		{label}
	</div>
);

export const Vertical: Story = {
	name: "수직 스택 (기본)",
	render: () => (
		<Stack gap={16}>
			<Item label="A" w={200} />
			<Item label="B" w={200} />
			<Item label="C" w={200} />
		</Stack>
	),
};

export const Horizontal: Story = {
	name: "수평 스택",
	render: () => (
		<Stack direction="horizontal" gap={12} align="center">
			<Item label="A" />
			<Item label="B" />
			<Item label="C" />
		</Stack>
	),
};

export const GapScale: Story = {
	name: "간격 비교",
	render: () => (
		<Stack gap={32}>
			{([4, 8, 16, 24, 32] as const).map((gap) => (
				<div key={gap}>
					<p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>gap={gap}</p>
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
	name: "justify=between",
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
	name: "flex-wrap",
	render: () => (
		<div style={{ width: 320 }}>
			<Stack direction="horizontal" gap={8} wrap="wrap">
				{Array.from({ length: 8 }, (_, i) => (
					<Item key={i} label={`${i + 1}`} w={90} />
				))}
			</Stack>
		</div>
	),
};
