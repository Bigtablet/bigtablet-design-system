import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
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
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DateFieldDemo>;

export const YearMonthDay: Story = {
	args: { mode: "year-month-day", defaultValue: "2026-01-06" },
};

export const YearMonth: Story = {
	args: { mode: "year-month", defaultValue: "2026-01" },
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "2026-01-06" },
};

export const CustomYearRange: Story = {
	name: "연도 범위 (2000~2035)",
	args: { startYear: 2000, endYear: 2035, defaultValue: "2026-01-06" },
};

export const UntilToday: Story = {
	args: { selectableRange: "until-today" },
};
