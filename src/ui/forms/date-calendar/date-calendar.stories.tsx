import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DateCalendar } from ".";

const meta: Meta<typeof DateCalendar> = {
	title: "Components/Forms/DateCalendar",
	component: DateCalendar,
	tags: ["autodocs"],
	argTypes: {
		weekStartsOn: {
			control: "select",
			options: [0, 1],
			description: "주의 첫 요일 (0 일요일, 1 월요일)",
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
**DateCalendar** - 월 달력. 날짜 하나를 고르고, 보이는 달 · 범위 · 고를 수 없는 날 · 주 시작 요일 · 날짜 장식을 다룹니다. \`DatePicker variant="calendar"\` 의 팝오버도 이 컴포넌트입니다.

값은 **\`"YYYY-MM-DD"\` 문자열**입니다(보이는 달은 \`"YYYY-MM"\`). 시간대가 없어서 \`new Date("2026-10-16")\` 처럼 UTC 자정으로 해석돼 하루 밀리는 버그가 생기지 않습니다. Date 가 필요하면 \`new Date(y, m - 1, d)\` 로 앱에서 만드세요.

키보드는 WAI-ARIA APG Date Picker 규칙(←→ ↑↓ Home/End PageUp/PageDown, Shift+PageUp/Down 한 해, Enter/Space)을 따르고, 포커스는 한 칸만 받습니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DateCalendar>;

export const Default: Story = {
	render: (args) => {
		const [value, setValue] = React.useState<string | null>("2026-10-16");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<DateCalendar {...args} today="2026-10-16" value={value} onValueChange={setValue} />
				<code style={{ fontSize: 12 }}>value: {value}</code>
			</div>
		);
	},
};

const EVENTS: Record<string, number> = {
	"2026-10-05": 1,
	"2026-10-12": 3,
	"2026-10-21": 2,
	"2026-10-28": 1,
};

export const WithEvents: Story = {
	name: "일정 표시 (renderDay · describeDay)",
	render: () => (
		<DateCalendar
			today="2026-10-16"
			renderDay={(d, { selected }) =>
				EVENTS[d] ? (
					<span
						style={{
							width: 4,
							height: 4,
							borderRadius: "50%",
							background: selected ? "currentColor" : "var(--bt-color-status-info)",
						}}
					/>
				) : null
			}
			describeDay={(d) => (EVENTS[d] ? `일정 ${EVENTS[d]}개` : undefined)}
		/>
	),
};

export const MondayStartWithRange: Story = {
	name: "월요일 시작 · 범위 · 휴일",
	render: () => (
		<DateCalendar
			today="2026-10-16"
			weekStartsOn={1}
			min="2026-10-06"
			max="2026-11-20"
			isDateDisabled={(d) => {
				const [y, m, dd] = d.split("-").map(Number);
				const weekday = new Date(y!, m! - 1, dd).getDay();
				return weekday === 0 || weekday === 6 || d === "2026-10-09";
			}}
		/>
	),
};

export const ControlledMonth: Story = {
	name: "보이는 달 제어",
	render: () => {
		const [month, setMonth] = React.useState("2026-10");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<div style={{ display: "flex", gap: 8 }}>
					{["2026-01", "2026-06", "2026-12"].map((m) => (
						<button key={m} type="button" onClick={() => setMonth(m)}>
							{m}
						</button>
					))}
				</div>
				<DateCalendar today="2026-10-16" month={month} onMonthChange={setMonth} />
			</div>
		);
	},
};
