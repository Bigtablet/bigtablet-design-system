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
**Stack** - flex 기반 1차원 레이아웃. 2차원 격자는 \`Grid\` 를 쓴다.

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
	parameters: {
		docs: {
			description: {
				story:
					'`direction="horizontal"` 은 `flex-direction: row` 입니다. **2차원 격자는 `Grid`** 를 쓰세요 - Stack 을 겹쳐 격자를 만들면 행마다 열 폭이 어긋납니다.\n\n좁은 화면에서 자동으로 세로가 되지 않습니다. 접혀야 하면 `wrap` 을 주거나 `Grid` 로 바꿉니다.',
			},
		},
	},
	render: () => (
		<Stack direction="horizontal" gap={12} align="center">
			<Item label="A" />
			<Item label="B" />
			<Item label="C" />
		</Stack>
	),
};

export const GapScale: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`gap` 은 **px 숫자**입니다(토큰 문자열이 아닙니다). 간격 스케일은 `4`·`8`·`12`·`16`·`24`·`32` 처럼 spacing 토큰과 같은 값을 쓰세요 - 임의의 숫자를 섞으면 화면마다 리듬이 달라집니다.",
			},
		},
	},
	render: () => (
		<Stack gap={32}>
			{([4, 8, 16, 24, 32] as const).map((gap) => (
				<div key={gap}>
					<p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--bt-color-text-caption)" }}>
						gap={gap}
					</p>
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
	parameters: {
		docs: {
			description: {
				story:
					'`justify` 는 **주축**, `align` 은 **교차축**입니다 - `direction` 을 바꾸면 두 축의 의미도 바뀝니다.\n\n제목과 버튼을 양끝으로 미는 헤더 줄이 `horizontal` + `justify="between"` 의 대표 용례입니다.',
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"`wrap` 을 켜면 넘치는 항목이 다음 줄로 갑니다. 칩 목록·태그 나열에 씁니다.\n\n줄이 바뀌면 `gap` 이 줄 간격에도 적용되므로, 가로 간격만 좁히고 싶으면 `colGap` 이 있는 `Grid` 쪽이 맞습니다.",
			},
		},
	},
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
