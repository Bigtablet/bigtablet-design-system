import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from ".";

const meta: Meta<typeof Stack> = {
	title: "Layout/Stack",
	component: Stack,
	tags: ["autodocs"],
	argTypes: {
		direction: {
			control: "select",
			options: ["vertical", "horizontal"],
			description: "flex 방향. 1D 흐름 — 2D는 Grid 사용.",
		},
		gap: {
			control: "select",
			options: [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48],
			description: "아이템 간격 (px). spacing 토큰 기반 고정값.",
		},
		align: {
			control: "select",
			options: [undefined, "start", "center", "end", "stretch"],
			description: "교차축 정렬 (align-items).",
		},
		justify: {
			control: "select",
			options: [undefined, "start", "center", "end", "between", "around", "evenly"],
			description: "주축 정렬 (justify-content).",
		},
		wrap: {
			control: "select",
			options: [undefined, "nowrap", "wrap", "wrap-reverse"],
			description: "flex-wrap.",
		},
		as: {
			control: "text",
			description: "렌더링할 HTML 요소 (기본 div).",
		},
		children: {
			control: false,
			description: "Stack 자식 아이템.",
		},
	},
	args: {
		direction: "vertical",
		gap: 16,
	},
	parameters: {
		docs: {
			description: {
				component: [
					"**Stack** — Flex 기반 1D 레이아웃. `direction`으로 수직/수평, `gap`으로 간격, `align`/`justify`로 정렬 제어.",
					"",
					"#### 역할",
					"4개 Layout 프리미티브 중 **한 줄 또는 한 열 흐름**을 담당. 2D 격자가 필요하면 `Grid`를 사용하세요.",
					"",
					"#### gap 가이드",
					"- `4`–`8` — 인라인 라벨 그룹 (아이콘+텍스트)",
					"- `8`–`12` — 폼 필드 줄 내부",
					"- `12`–`16` — 카드 내부 컨텐츠",
					"- `16`–`24` — 카드 간 수직 간격",
					"- `24`–`32` — 섹션 내부 큰 블록",
					"- `40`–`48` — 페이지 큰 영역 분리",
					"",
					"#### 정렬",
					"- `align` — 교차축 정렬. `vertical`이면 가로, `horizontal`이면 세로.",
					"- `justify=\"between\"` — 좌우 끝 정렬 패턴 (헤더 제목 ↔ 액션 버튼).",
					"- `align=\"stretch\"` — 자식이 교차축을 꽉 채움 (동일 높이 카드 줄).",
					"",
					"#### 반응형",
					"Stack 자체는 미디어 쿼리를 가지지 않습니다. 모바일에서 wrap이 필요하면 `wrap=\"wrap\"`을, direction 자체를 바꿔야 한다면 별도 CSS를 사용하세요.",
				].join("\n"),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 direction/gap/align/justify/wrap을 바꿔보세요.",
			},
		},
	},
	render: (args) => (
		<div style={{ width: "100%", border: "1px dashed #DDE3E9", borderRadius: 8, padding: 16 }}>
			<Stack {...args}>
				{["A", "B", "C"].map((label) => (
					<div
						key={label}
						style={{
							width: 80,
							height: 48,
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
				))}
			</Stack>
		</div>
	),
};

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
