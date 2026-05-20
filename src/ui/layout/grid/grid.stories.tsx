import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from ".";

const meta: Meta<typeof Grid> = {
	title: "Layout/Grid",
	component: Grid,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: [
					"**Grid** — CSS Grid 기반 2D 레이아웃. `cols` 고정 열 수 또는 `cols=\"auto\"` auto-fill 반응형 그리드.",
					"",
					"#### 역할",
					"4개 Layout 프리미티브 중 **2D 격자**(m열 × n행)를 담당. 한 줄/한 열만 흐른다면 `Stack`을 사용하세요.",
					"",
					"#### cols 선택",
					"- `1` — 모바일/좁은 사이드 영역",
					"- `2` — 비교 카드·통계 페어",
					"- `3` (기본) — 기능 소개·MediaCard 카드 리스트",
					"- `4` — 콤팩트 카드·통계 패널",
					"- `5`/`6` — 작은 아이콘 그리드·로고 월",
					"- `\"auto\"` — `repeat(auto-fill, minmax(minColWidth, 1fr))`. 컨테이너 폭에 따라 자동 열 수",
					"",
					"#### gap / rowGap / colGap",
					"`gap`은 행/열 모두에 적용. `rowGap`/`colGap`을 명시하면 해당 축만 override합니다.",
					"",
					"#### 반응형",
					"- `singleColOnMobile={true}` (기본) — `< 600px`에서 무조건 1열로 축소.",
					"- `singleColOnMobile={false}` — 작은 아이콘 그리드처럼 모바일에서도 다열을 유지해야 할 때.",
					"- `cols=\"auto\"` — `singleColOnMobile`과 무관하게 `minmax`로 자동 줄바꿈.",
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
