import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DATETIME_COMPARISON } from "../datetime-comparison.docs";
import { DatePicker } from ".";

type DateFieldDemoProps = {
	mode?: "year-month" | "year-month-day";
	startYear?: number;
	endYear?: number;
	disabled?: boolean;
	defaultValue?: string;
	selectableRange?: "all" | "until-today";
};

const DateFieldDemo = ({
	mode = "year-month-day",
	startYear = 1950,
	endYear = new Date().getFullYear() + 10,
	disabled = false,
	defaultValue = "2026-01-06",
	selectableRange = "all",
}: DateFieldDemoProps) => {
	const [value, setValue] = React.useState<string>(defaultValue);
	React.useEffect(() => setValue(defaultValue), [defaultValue]);
	return (
		<div style={{ padding: 20, display: "grid", gap: 12, maxWidth: 520 }}>
			<DatePicker
				value={value}
				onValueChange={setValue}
				mode={mode}
				startYear={startYear}
				endYear={endYear}
				disabled={disabled}
				selectableRange={selectableRange}
			/>
			<div style={{ fontSize: 13 }}>
				value: <code>{value}</code>
			</div>
		</div>
	);
};

const meta: Meta<typeof DateFieldDemo> = {
	title: "Components/Forms/DatePicker",
	component: DateFieldDemo,
	tags: ["autodocs"],
	argTypes: {
		mode: { control: "select", options: ["year-month", "year-month-day"] },
		selectableRange: { control: "select", options: ["all", "until-today"] },
		startYear: { control: "number" },
		endYear: { control: "number" },
		disabled: { control: "boolean" },
		defaultValue: { control: "text" },
	},
	args: {
		mode: "year-month-day",
		startYear: 1950,
		endYear: new Date().getFullYear() + 10,
		defaultValue: "2026-01-06",
		selectableRange: "all",
	},
	parameters: {
		docs: {
			description: {
				component: `
**DatePicker** - 연/월/일 Dropdown 조합. \`onValueChange\` 가 돌려주는 형식은 \`mode\` 에 따른다 - \`year-month-day\`(기본)는 \`YYYY-MM-DD\`, \`year-month\` 는 \`YYYY-MM\` 이다(구 \`onChange\` 는 deprecated).

\`mode\`: \`year-month\`(일 Dropdown 없음) / \`year-month-day\`(기본).
주요 prop: \`startYear\`, \`endYear\`, \`selectableRange\` (\`all\` / \`until-today\`), \`disabled\`.

${DATETIME_COMPARISON}
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DateFieldDemo>;

export const YearMonthDay: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"기본 모드입니다. 연·월·일 Dropdown 셋이 서고 `YYYY-MM-DD` 를 돌려줍니다.\n\n월을 바꾸면 일 목록이 그 달의 일수로 다시 그려집니다 - 2월 31일 같은 값이 남지 않습니다.",
			},
		},
	},
	args: { mode: "year-month-day", defaultValue: "2026-01-06" },
};

export const YearMonth: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"일 Dropdown 이 없고 `YYYY-MM` 을 돌려줍니다. 정산월·구독 시작월처럼 **날짜가 의미 없는 값**에 씁니다.\n\n`-01` 로 채워 주지 않습니다 - 서버가 날짜를 요구하면 화면에서 붙이세요.",
			},
		},
	},
	args: { mode: "year-month", defaultValue: "2026-01" },
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "2026-01-06" },
};

export const CustomYearRange: Story = {
	name: "연도 범위 (2000~2035)",
	parameters: {
		docs: {
			description: {
				story:
					"`startYear`·`endYear` 로 연도 목록을 좁힙니다. 기본은 1950 부터라 생년월일에는 맞지만 예약·계약처럼 최근 몇 년만 쓰는 화면에서는 목록이 길어집니다.\n\n범위를 좁히는 것은 편의고, **고를 수 없는 날짜를 막는 것**은 `selectableRange` 쪽입니다.",
			},
		},
	},
	args: { startYear: 2000, endYear: 2035, defaultValue: "2026-01-06" },
};

export const UntilToday: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`selectableRange="until-today"` 는 미래를 목록에서 **아예 빼 버립니다.** 생년월일·발생일처럼 지난 날짜만 받는 자리에 씁니다.\n\n고른 뒤 검증하는 방식과 다릅니다 - 고를 수 없으면 오류 문구가 필요 없습니다.',
			},
		},
	},
	args: { selectableRange: "until-today" },
};
