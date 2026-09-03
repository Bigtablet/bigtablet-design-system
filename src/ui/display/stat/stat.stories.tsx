import type { Meta, StoryObj } from "@storybook/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Grid } from "../../layout/grid";
import { Card } from "../card";
import { Stat } from ".";

const meta: Meta<typeof Stat> = {
	title: "Components/Display/Stat",
	component: Stat,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Stat** - 대시보드의 지표 한 칸. 이름 · 값 · 변화량.

화면마다 \`<p style={{ fontSize: 24, fontWeight: 700 }}>\` 로 다시 만들던 층이다. 같은 대시보드
안에서 지표 값이 서로 다른 크기로 보이는 것이 그 결과였다.

**값은 \`tabular-nums\` 로 렌더한다.** 비례 숫자는 자릿수마다 폭이 달라 값이 갱신될 때 숫자가
좌우로 흔들리고, 여러 지표를 나란히 두면 자리가 맞지 않는다.

변화량의 색은 **방향이 아니라 좋음/나쁨**으로 고른다 — "재고 부족 +2" 는 오르지만 나쁘다.

표면(테두리·여백)은 \`Card\` 가 소유한다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Basic: Story = {
	name: "기본",
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 240 }}>
			<Stat label="오늘 매출" value="₩1,284,000" delta="+12%" deltaTone="positive" />
		</Card>
	),
};

export const Row: Story = {
	name: "지표 여러 개",
	parameters: {
		docs: {
			description: {
				story:
					"값의 자릿수가 달라도 `tabular-nums` 라 숫자 폭이 같다. `Grid` 로 배치하고 각 칸을 `Card` 로 감싼다.",
			},
		},
	},
	render: () => (
		<Grid cols={4} gap={16}>
			{[
				{ label: "오늘 매출", value: "₩1,284,000", delta: "+12%", tone: "positive" as const },
				{ label: "신규 주문", value: "47", delta: "+8%", tone: "positive" as const },
				{ label: "활성 직원", value: "12", delta: "0%", tone: "neutral" as const },
				{ label: "재고 부족", value: "3", delta: "+2개", tone: "negative" as const },
			].map((s) => (
				<Card key={s.label} bordered padding="lg">
					<Stat label={s.label} value={s.value} delta={s.delta} deltaTone={s.tone} />
				</Card>
			))}
		</Grid>
	),
};

export const Tones: Story = {
	name: "변화량 색",
	parameters: {
		docs: {
			description: {
				story:
					"`deltaTone` 은 방향이 아니라 평가다. 오르는 것이 나쁜 지표(이탈률·재고 부족)는 `negative` 를 쓴다.",
			},
		},
	},
	render: () => (
		<Grid cols={3} gap={16}>
			<Card bordered padding="lg">
				<Stat
					label="가입 전환"
					value="18.4%"
					delta="+2.1%p"
					deltaTone="positive"
					icon={<TrendingUp size={14} />}
				/>
			</Card>
			<Card bordered padding="lg">
				<Stat
					label="이탈률"
					value="7.2%"
					delta="+1.3%p"
					deltaTone="negative"
					icon={<TrendingUp size={14} />}
				/>
			</Card>
			<Card bordered padding="lg">
				<Stat
					label="평균 응답"
					value="1.8초"
					delta="-0.2초"
					deltaTone="positive"
					icon={<TrendingDown size={14} />}
				/>
			</Card>
		</Grid>
	),
};

export const NoDelta: Story = {
	name: "변화량 없이",
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 240 }}>
			<Stat label="등록된 매장" value="128" />
		</Card>
	),
};
