import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from ".";

const meta: Meta<typeof Grid> = {
	title: "Layout/Grid",
	component: Grid,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Grid** — CSS Grid 기반 2D 레이아웃. `cols` 고정 열 수 또는 `cols=\"auto\"` auto-fill 반응형 그리드.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Card = ({ label }: { label: string }) => (
	<div
		style={{
			background: "#F2F5F8",
			border: "1px solid #DDE3E9",
			borderRadius: 8,
			padding: "24px 16px",
			textAlign: "center",
			fontSize: 13,
			fontWeight: 600,
			color: "#47555E",
		}}
	>
		{label}
	</div>
);

export const ThreeColumns: Story = {
	name: "3열 고정 (기본)",
	render: () => (
		<Grid cols={3} gap={16}>
			{Array.from({ length: 6 }, (_, i) => (
				<Card key={i} label={`Item ${i + 1}`} />
			))}
		</Grid>
	),
};

export const AutoFill: Story = {
	name: "Auto-fill (반응형)",
	render: () => (
		<Grid cols="auto" minColWidth="200px" gap={16}>
			{Array.from({ length: 8 }, (_, i) => (
				<Card key={i} label={`Item ${i + 1}`} />
			))}
		</Grid>
	),
};

export const ColVariants: Story = {
	name: "열 수 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
			{([1, 2, 3, 4] as const).map((cols) => (
				<div key={cols}>
					<p style={{ margin: "0 0 8px", fontSize: 12, color: "#888", fontWeight: 600 }}>
						cols={cols}
					</p>
					<Grid cols={cols} gap={12}>
						{Array.from({ length: cols }, (_, i) => (
							<Card key={i} label={`${i + 1}`} />
						))}
					</Grid>
				</div>
			))}
		</div>
	),
};

export const IndependentGaps: Story = {
	name: "rowGap / colGap 분리",
	render: () => (
		<Grid cols={3} rowGap={32} colGap={8}>
			{Array.from({ length: 9 }, (_, i) => (
				<Card key={i} label={`${i + 1}`} />
			))}
		</Grid>
	),
};
