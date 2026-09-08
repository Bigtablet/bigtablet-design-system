import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from ".";

const meta: Meta<typeof Grid> = {
	title: "Components/Layout/Grid",
	component: Grid,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: [
					"**Grid** - CSS Grid 2D 레이아웃. 1D 흐름은 `Stack`.",
					"",
					'주요 prop: `cols` (1~6 또는 `"auto"` = minmax auto-fill), `gap`/`rowGap`/`colGap`, `singleColOnMobile` (<600 1열 축소, 기본 true).',
				].join("\n"),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Card = ({ label }: { label: string }) => (
	<div
		style={{
			background: "var(--bt-color-bg-solid-dim)",
			border: "1px solid #DDE3E9",
			borderRadius: 8,
			padding: "24px 16px",
			textAlign: "center",
			fontSize: 13,
			fontWeight: 600,
			color: "var(--bt-color-text-body)",
		}}
	>
		{label}
	</div>
);

export const ThreeColumns: Story = {
	name: "3열 고정 (기본)",
	parameters: {
		docs: {
			description: {
				story:
					"`cols` 기본값은 3입니다. **599px 이하에서 자동으로 1열로 접힙니다** - `singleColOnMobile` 이 기본 `true` 라 모바일 분기를 따로 쓰지 않아도 됩니다.\n\n접힘을 끄려면 `singleColOnMobile={false}` 를 주세요. 열이 좁아도 유지해야 하는 표·달력에 씁니다.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					'`cols="auto"` 는 `repeat(auto-fill, minmax(minColWidth, 1fr))` 이 됩니다 - 열 수를 **폭이 정합니다.** 카드 목록처럼 항목 수가 유동적일 때 씁니다.\n\n`minColWidth`(기본 280px)는 **`cols="auto"` 에서만 쓰입니다.** 숫자 `cols` 와 함께 주면 아무 일도 하지 않습니다.',
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"1~6 열 비교입니다. 열이 많아질수록 `599px` 이하에서 1열로 접히는 폭이 커지므로, **접힌 모습도 함께 보세요** - 6열이 1열이 되면 스크롤이 여섯 배 길어집니다.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
			{([1, 2, 3, 4] as const).map((cols) => (
				<div key={cols}>
					<p
						style={{
							margin: "0 0 8px",
							fontSize: 12,
							color: "var(--bt-color-text-caption)",
							fontWeight: 600,
						}}
					>
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
	parameters: {
		docs: {
			description: {
				story:
					"`rowGap`·`colGap` 은 `gap` 을 덮습니다. 세로는 넓게 가로는 좁게 두는 식으로, 카드가 위아래로 붙어 보이는 것을 막을 때 씁니다.\n\n둘 중 하나만 주면 나머지는 `gap` 값을 그대로 씁니다.",
			},
		},
	},
	render: () => (
		<Grid cols={3} rowGap={32} colGap={8}>
			{Array.from({ length: 9 }, (_, i) => (
				<Card key={i} label={`${i + 1}`} />
			))}
		</Grid>
	),
};
