import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Field } from "../field";
import { type DateRange, DateRangePicker } from ".";

const meta: Meta<typeof DateRangePicker> = {
	title: "Components/Forms/DateRangePicker",
	component: DateRangePicker,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**DateRangePicker** - 시작일·종료일 한 쌍. \`DatePicker\` 둘을 묶는다.

**거꾸로 된 범위를 만들 수 없다.** 종료일의 최소값이 시작일이라 이전 날짜가 목록에 아예 없고,
시작일을 종료일보다 뒤로 옮기면 종료일이 비워진다. 손으로 두 개를 나란히 두면 이 검증을
화면마다 다시 쓰고, 대개 "조회" 버튼을 누른 뒤 서버 오류로 알게 된다.

종료일을 조용히 시작일로 맞추지 않고 **비운다** — 사용자가 고르지 않은 날짜를 고른 것처럼
만들면 그대로 조회·저장된다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Basic: Story = {
	name: "기본",
	render: () => {
		const [range, setRange] = useState<DateRange>({});
		return (
			<div style={{ maxWidth: 560 }}>
				<Field name="period" label="조회 기간">
					<DateRangePicker value={range} onValueChange={setRange} />
				</Field>
				<p style={{ marginTop: 12, fontSize: 13, color: "var(--bt-color-text-caption)" }}>
					{range.start ?? "-"} ~ {range.end ?? "-"}
				</p>
			</div>
		);
	},
};

export const UntilToday: Story = {
	name: "오늘까지만",
	parameters: {
		docs: {
			description: {
				story: '`selectableRange="until-today"` — 미래 날짜를 고를 수 없다. 정산·통계 조회에.',
			},
		},
	},
	render: () => {
		const [range, setRange] = useState<DateRange>({});
		return (
			<div style={{ maxWidth: 560 }}>
				<Field name="period" label="정산 기간" help="오늘까지 조회할 수 있습니다">
					<DateRangePicker
						value={range}
						onValueChange={setRange}
						selectableRange="until-today"
						startYear={2020}
					/>
				</Field>
			</div>
		);
	},
};

export const Prefilled: Story = {
	name: "값이 있는 상태",
	parameters: {
		docs: {
			description: {
				story:
					"시작일의 월을 종료일보다 뒤로 옮겨 보라 — 종료일이 비워지고, 그 뒤 종료일 목록은 새 시작일부터 시작한다.",
			},
		},
	},
	render: () => {
		const [range, setRange] = useState<DateRange>({ start: "2026-05-01", end: "2026-05-31" });
		return (
			<div style={{ maxWidth: 560 }}>
				<DateRangePicker value={range} onValueChange={setRange} />
				<p style={{ marginTop: 12, fontSize: 13, color: "var(--bt-color-text-caption)" }}>
					{range.start ?? "-"} ~ {range.end ?? "-"}
				</p>
			</div>
		);
	},
};
