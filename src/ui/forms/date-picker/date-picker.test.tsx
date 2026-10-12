import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../../system/locale-provider";
import { Field } from "../field";
import { DatePicker } from "./index";

describe("DatePicker", () => {
	it("renders with label", () => {
		render(<DatePicker label="Birth Date" onChange={() => {}} />);
		expect(screen.getByText("Birth Date")).toBeInTheDocument();
	});

	it("renders year/month selects by default", () => {
		render(<DatePicker onChange={() => {}} />);
		// label + placeholder 로 각 Dropdown 에 두 번씩 "년"/"월" 나타남
		expect(screen.getAllByText("년").length).toBeGreaterThan(0);
		expect(screen.getAllByText("월").length).toBeGreaterThan(0);
	});

	it("renders day select in year-month-day mode", () => {
		render(<DatePicker mode="year-month-day" onChange={() => {}} />);
		expect(screen.getAllByText("일").length).toBeGreaterThan(0);
	});

	it("does not render day select in year-month mode", () => {
		render(<DatePicker mode="year-month" onChange={() => {}} />);
		expect(screen.queryByText("일")).not.toBeInTheDocument();
	});

	it("renders 3 select buttons in year-month-day mode", () => {
		render(<DatePicker mode="year-month-day" onChange={() => {}} />);
		expect(screen.getAllByRole("combobox")).toHaveLength(3);
	});

	it("renders 2 select buttons in year-month mode", () => {
		render(<DatePicker mode="year-month" onChange={() => {}} />);
		expect(screen.getAllByRole("combobox")).toHaveLength(2);
	});

	it("calls onChange when year is selected (year-month mode)", () => {
		const onChange = vi.fn();
		render(<DatePicker mode="year-month" startYear={2020} endYear={2025} onChange={onChange} />);

		// 첫 Select 버튼(연도) 열고 "2024" 클릭
		const buttons = screen.getAllByRole("combobox");
		fireEvent.click(buttons[0]!);
		fireEvent.click(screen.getByText("2024"));

		expect(onChange).toHaveBeenCalledWith("2024-01");
	});

	it("calls onChange when month is changed", () => {
		const onChange = vi.fn();
		render(<DatePicker value="2024" onChange={onChange} />);

		const buttons = screen.getAllByRole("combobox");
		// month = buttons[1]
		fireEvent.click(buttons[1]!);
		fireEvent.click(screen.getByText("06"));

		expect(onChange).toHaveBeenCalledWith("2024-06-01");
	});

	it("calls onChange when day is changed", () => {
		const onChange = vi.fn();
		render(<DatePicker value="2024-06" onChange={onChange} />);

		const buttons = screen.getAllByRole("combobox");
		fireEvent.click(buttons[2]!);
		fireEvent.click(screen.getByText("15"));

		expect(onChange).toHaveBeenCalledWith("2024-06-15");
	});

	it("shows selected year in button label", () => {
		render(<DatePicker value="2024-06-15" onChange={() => {}} />);
		const buttons = screen.getAllByRole("combobox");
		expect(buttons[0]).toHaveTextContent("2024");
	});

	it("shows selected month in button label", () => {
		render(<DatePicker value="2024-06-15" onChange={() => {}} />);
		const buttons = screen.getAllByRole("combobox");
		expect(buttons[1]).toHaveTextContent("06");
	});

	it("shows selected day in button label", () => {
		render(<DatePicker value="2024-06-15" onChange={() => {}} />);
		const buttons = screen.getAllByRole("combobox");
		expect(buttons[2]).toHaveTextContent("15");
	});

	it("disables all selects when disabled", () => {
		render(<DatePicker disabled onChange={() => {}} />);
		const buttons = screen.getAllByRole("combobox");
		buttons.forEach((btn) => {
			expect(btn).toBeDisabled();
		});
	});

	it("disables month select when year is not selected", () => {
		render(<DatePicker onChange={() => {}} />);
		const buttons = screen.getAllByRole("combobox");
		expect(buttons[1]).toBeDisabled();
	});

	it("disables day select when month is not selected", () => {
		render(<DatePicker value="2024" onChange={() => {}} />);
		const buttons = screen.getAllByRole("combobox");
		expect(buttons[2]).toBeDisabled();
	});

	it("applies fullWidth class by default", () => {
		const { container } = render(<DatePicker onChange={() => {}} />);
		expect(container.firstChild).toHaveClass("date_picker_full_width");
	});

	it("does not apply fullWidth class when fullWidth is false", () => {
		const { container } = render(<DatePicker fullWidth={false} onChange={() => {}} />);
		expect(container.firstChild).not.toHaveClass("date_picker_full_width");
	});

	it("applies custom width style", () => {
		const { container } = render(<DatePicker width={300} onChange={() => {}} />);
		expect(container.firstChild).toHaveStyle({ width: "300px" });
	});

	it("applies string width style", () => {
		const { container } = render(<DatePicker width="50%" onChange={() => {}} />);
		expect(container.firstChild).toHaveStyle({ width: "50%" });
	});

	it("renders sr-only constraint description when minDate is set", () => {
		render(<DatePicker minDate="2020-01-01" onChange={() => {}} />);
		expect(screen.getByText(/최소 날짜: 2020-01-01/)).toBeInTheDocument();
	});

	it("renders sr-only constraint description when selectableRange is until-today", () => {
		render(<DatePicker selectableRange="until-today" onChange={() => {}} />);
		expect(screen.getByText(/오늘까지 선택 가능/)).toBeInTheDocument();
	});

	it("links group to constraint description via aria-describedby", () => {
		render(<DatePicker minDate="2020-01-01" onChange={() => {}} />);
		const group = document.querySelector("[role='group']") as HTMLElement;
		const descId = group.getAttribute("aria-describedby");

		expect(descId).toBeTruthy();
		expect(document.getElementById(descId ?? "")).toBeInTheDocument();
	});

	it("does not render constraint description when no constraints set", () => {
		render(<DatePicker onChange={() => {}} />);
		const group = document.querySelector("[role='group']") as HTMLElement;
		expect(group).not.toHaveAttribute("aria-describedby");
	});

	it("uses custom minDateSrFormat when provided", () => {
		render(
			<DatePicker minDate="2020-01-01" minDateSrFormat="최소 날짜: {date}" onChange={() => {}} />,
		);
		expect(screen.getByText("최소 날짜: 2020-01-01")).toBeInTheDocument();
	});

	it("uses custom selectableRangeUntilTodaySrText when provided", () => {
		render(
			<DatePicker
				selectableRange="until-today"
				selectableRangeUntilTodaySrText="오늘까지 선택 가능"
				onChange={() => {}}
			/>,
		);
		expect(screen.getByText("오늘까지 선택 가능")).toBeInTheDocument();
	});

	it("calls onValueChange (canonical) when year is selected", () => {
		const onValueChange = vi.fn();
		render(
			<DatePicker
				mode="year-month"
				startYear={2020}
				endYear={2025}
				onValueChange={onValueChange}
			/>,
		);
		const buttons = screen.getAllByRole("combobox");
		fireEvent.click(buttons[0]!);
		fireEvent.click(screen.getByText("2024"));
		expect(onValueChange).toHaveBeenCalledWith("2024-01");
	});

	it("prefers onValueChange over the deprecated onChange when both are given", () => {
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		render(
			<DatePicker
				mode="year-month"
				startYear={2020}
				endYear={2025}
				onValueChange={onValueChange}
				onChange={onChange}
			/>,
		);

		const buttons = screen.getAllByRole("combobox");
		fireEvent.click(buttons[0]!);
		fireEvent.click(screen.getByText("2024"));

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("2024-01");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("keeps years before minDate out of the list", () => {
		// 월·일만 좁히면 minDate 이전 연도가 남는다 - 그 해를 고르는 순간 제약이 무의미해진다
		// (월·일 제한은 `year === min.year` 일 때만 걸린다). 실제로 1950 이 첫 항목이었다.
		render(<DatePicker value="2026-05-01" minDate="2020-01-01" onValueChange={vi.fn()} />);

		fireEvent.click(screen.getAllByRole("combobox")[0]!);
		const years = screen.getAllByRole("option").map((o) => o.textContent);

		expect(years[0]).toBe("2020");
		expect(years).not.toContain("1950");
	});
	it("keeps the emitted day inside minDate when the year changes", () => {
		// 연도를 바꾸면 월은 minDate 로 당겨지는데 일은 그대로 나갔다. 결과가 minDate 보다
		// 앞선 날짜인데도 onValueChange 로 흘러나간다 - 이 컴포넌트가 막으려는 바로 그 값이다.
		const onValueChange = vi.fn();
		render(<DatePicker value="2030-01-01" minDate="2020-06-15" onValueChange={onValueChange} />);

		const buttons = screen.getAllByRole("combobox");
		fireEvent.click(buttons[0]!);
		fireEvent.click(screen.getByText("2020"));

		expect(onValueChange).toHaveBeenCalledWith("2020-06-15");
	});
	it("keeps the emitted day inside until-today when the year changes", () => {
		// 같은 결함의 반대쪽 - 연도를 올해로 바꾸면 월은 이번 달로 당겨지는데 일이 그대로
		// 나가 미래 날짜가 emit 됐다. 게다가 그 값은 일 목록에 없어 화면은 빈 칸으로 보인다.
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 15));
		try {
			const onValueChange = vi.fn();
			render(
				<DatePicker
					value="2025-12-31"
					selectableRange="until-today"
					onValueChange={onValueChange}
				/>,
			);

			const buttons = screen.getAllByRole("combobox");
			fireEvent.click(buttons[0]!);
			fireEvent.click(screen.getByText("2026"));

			expect(onValueChange).toHaveBeenCalledWith("2026-09-15");
		} finally {
			vi.useRealTimers();
		}
	});
	it("offers no day and never emits a future date when minDate and until-today conflict", () => {
		// minDate 가 오늘보다 뒤면 두 제약의 교집합이 비어 있다. 넓은 쪽으로 풀면 미래 날짜가
		// 선택 가능해진다 - 이 컴포넌트가 막으려는 바로 그 값이다.
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 15));
		try {
			const onValueChange = vi.fn();
			render(
				<DatePicker
					value="2026-09-10"
					minDate="2026-09-20"
					selectableRange="until-today"
					onValueChange={onValueChange}
				/>,
			);

			// 일 목록이 비어 고를 수 있는 날이 없다 - 넓은 쪽으로 풀었다면 20일이 떴을 자리다.
			const buttons = screen.getAllByRole("combobox");
			fireEvent.click(buttons[2]!);
			expect(screen.queryAllByRole("option")).toHaveLength(0);
			expect(onValueChange).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
	it("offers no month when the whole window is empty", () => {
		// 일 목록을 비우는 것만으로는 부족하다 - `minDate="2026-12-01"` + `until-today` 면
		// 월 목록에 12 가 남고, 그것을 고르면 그 달의 일수만 보고 미래 날짜가 그대로 나갔다.
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 15));
		try {
			const onValueChange = vi.fn();
			render(
				<DatePicker
					value="2026-09-10"
					minDate="2026-12-01"
					selectableRange="until-today"
					onValueChange={onValueChange}
				/>,
			);

			// 월 목록 자체가 비어야 한다. `Math.max` 로 넓히면 12 가 남고, 그것을 고르는 순간
			// `dayBoundsFor` 는 그 달의 일수만 보므로 미래 날짜가 그대로 나갔다.
			const buttons = screen.getAllByRole("combobox");
			fireEvent.click(buttons[1]!);
			expect(screen.queryAllByRole("option")).toHaveLength(0);
			expect(onValueChange).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
	it("hides a month whose days are all out of range in year-month mode", () => {
		// `minDate="2026-09-20"` + `until-today`(오늘 2026-09-15) 면 9월에 고를 수 있는 날이
		// 하나도 없다. 월 목록은 일을 보지 않으므로 9월이 그대로 떴고, 고르면 emit 이 조용히
		// 막혀 드롭다운이 반응 없이 멈췄다 - 목록과 emit 이 다른 계산을 쓴 자리다.
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 15));
		try {
			const onValueChange = vi.fn();
			render(
				<DatePicker
					mode="year-month"
					value="2026-09"
					minDate="2026-09-20"
					selectableRange="until-today"
					onValueChange={onValueChange}
				/>,
			);

			const buttons = screen.getAllByRole("combobox");
			fireEvent.click(buttons[1]!);
			expect(screen.queryAllByRole("option")).toHaveLength(0);
		} finally {
			vi.useRealTimers();
		}
	});

	it("passes the Field's required state down to every dropdown", () => {
		// role="group" 에는 aria-required 를 붙일 수 없다(axe aria-allowed-attr) - 안쪽
		// Dropdown 마다 내려보낸다.
		render(
			<Field name="birth" label="생년월일" required>
				<DatePicker onValueChange={vi.fn()} />
			</Field>,
		);

		const controls = screen.getAllByRole("combobox");
		expect(controls.length).toBeGreaterThan(0);
		for (const control of controls) {
			expect(control).toHaveAttribute("aria-required", "true");
		}
		expect(screen.getByRole("group")).not.toHaveAttribute("aria-required");
	});

	it("lets an optional Field override the required prop", () => {
		render(
			<Field name="birth" label="생년월일">
				<DatePicker onValueChange={vi.fn()} required />
			</Field>,
		);

		for (const control of screen.getAllByRole("combobox")) {
			expect(control).not.toHaveAttribute("aria-required");
		}
	});

	it("announces required from the prop outside a Field", () => {
		render(<DatePicker onValueChange={vi.fn()} required />);

		for (const control of screen.getAllByRole("combobox")) {
			expect(control).toHaveAttribute("aria-required", "true");
		}
	});

	it("does not claim required without a Field or the prop", () => {
		render(<DatePicker onValueChange={vi.fn()} />);

		for (const control of screen.getAllByRole("combobox")) {
			expect(control).not.toHaveAttribute("aria-required");
		}
	});
});

/**
 * `variant="calendar"` - 날짜 칸 하나 + 월 달력 팝오버. 드롭다운 3개와 같은 값 형식(`YYYY-MM-DD`)과 같은
 * 제약(`minDate` · `selectableRange`)을 지키는지, 그리고 APG Date Picker Dialog 키보드 규칙을 잠근다.
 * 오늘은 2026-10-12(월)로 고정한다.
 */

/** 날짜 칸 - 이름이 값에 따라 바뀌어 팝오버를 여는 버튼이라는 점으로 찾는다. */
const open = () => {
	const trigger = screen
		.getAllByRole("button")
		.find((b) => b.getAttribute("aria-haspopup") === "dialog");
	if (!trigger) throw new Error("date trigger not found");
	fireEvent.click(trigger);
};
const grid = () => screen.getByRole("grid");
const day = (n: number) => within(grid()).getByRole("button", { name: new RegExp(`10월 ${n}일`) });

describe("DatePicker variant=calendar", () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date(2026, 9, 12, 9, 0));
	});
	afterEach(() => vi.useRealTimers());

	it("드롭다운 대신 날짜 칸 하나를 그리고, 값이 없으면 안내 문구를 보인다", () => {
		render(<DatePicker variant="calendar" onValueChange={vi.fn()} />);

		expect(screen.queryAllByRole("combobox")).toHaveLength(0);
		expect(screen.getByRole("button", { name: "날짜 선택" })).toHaveAttribute(
			"aria-haspopup",
			"dialog",
		);
	});

	it("값은 요일과 함께 보인다", () => {
		render(<DatePicker variant="calendar" value="2026-10-12" onValueChange={vi.fn()} />);

		expect(screen.getByText("2026. 10. 12. (월)")).toBeInTheDocument();
	});

	it("열면 고른 달이 보이고, 날을 누르면 YYYY-MM-DD 로 내보낸 뒤 닫힌다", async () => {
		const onValueChange = vi.fn();
		render(<DatePicker variant="calendar" value="2026-10-12" onValueChange={onValueChange} />);

		open();
		expect(screen.getByText("2026년 10월")).toBeInTheDocument();
		expect(day(12)).toHaveAttribute("tabindex", "0");
		expect(day(12).closest("td")).toHaveAttribute("aria-selected", "true");

		fireEvent.click(day(20));

		expect(onValueChange).toHaveBeenCalledWith("2026-10-20");
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	});

	it("열면 포커스가 고른 날에 앉는다 - 1일이나 넘김 버튼이 아니다", async () => {
		render(<DatePicker variant="calendar" value="2026-10-12" onValueChange={vi.fn()} />);
		open();

		await waitFor(() => expect(day(12)).toHaveFocus());
	});

	it("오늘은 aria-current 로 표시하고, 값이 없으면 오늘에서 시작한다", () => {
		render(<DatePicker variant="calendar" onValueChange={vi.fn()} />);

		open();
		expect(day(12)).toHaveAttribute("aria-current", "date");
		expect(day(12)).toHaveAttribute("tabindex", "0");
	});

	it("방향키 · PageDown · Home/End 로 옮기고 Enter 로 고른다", () => {
		const onValueChange = vi.fn();
		render(<DatePicker variant="calendar" value="2026-10-12" onValueChange={onValueChange} />);
		open();

		fireEvent.keyDown(day(12), { key: "ArrowRight" });
		expect(day(13)).toHaveFocus();
		fireEvent.keyDown(day(13), { key: "ArrowDown" });
		expect(day(20)).toHaveFocus();
		fireEvent.keyDown(day(20), { key: "Home" });
		expect(day(18)).toHaveFocus(); // 10-18 은 일요일
		fireEvent.keyDown(day(18), { key: "End" });
		expect(day(24)).toHaveFocus();

		fireEvent.keyDown(day(24), { key: "PageDown" });
		expect(screen.getByText("2026년 11월")).toBeInTheDocument();
		const nov24 = within(grid()).getByRole("button", { name: /11월 24일/ });
		expect(nov24).toHaveFocus();

		fireEvent.click(nov24);
		expect(onValueChange).toHaveBeenCalledWith("2026-11-24");
	});

	it("수식키가 붙은 키는 가로채지 않는다", () => {
		render(<DatePicker variant="calendar" value="2026-10-12" onValueChange={vi.fn()} />);
		open();

		fireEvent.keyDown(day(12), { key: "ArrowRight", ctrlKey: true });
		expect(day(12)).toHaveAttribute("tabindex", "0");
	});

	it("minDate 이전 날은 고를 수 없고, 그 달보다 앞으로 넘어가지 않는다", () => {
		const onValueChange = vi.fn();
		render(
			<DatePicker
				variant="calendar"
				minDate="2026-10-10"
				value="2026-10-12"
				onValueChange={onValueChange}
			/>,
		);
		open();

		expect(day(9)).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(day(9));
		expect(onValueChange).not.toHaveBeenCalled();
		expect(day(10)).not.toHaveAttribute("aria-disabled");
		expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled();
	});

	it("selectableRange=until-today 면 내일부터 막고 다음 달로 넘어가지 않는다", () => {
		render(<DatePicker variant="calendar" selectableRange="until-today" onValueChange={vi.fn()} />);
		open();

		expect(day(12)).not.toHaveAttribute("aria-disabled");
		expect(day(13)).toHaveAttribute("aria-disabled", "true");
		expect(screen.getByRole("button", { name: "다음 달" })).toBeDisabled();
	});

	it("넘김 버튼으로 달을 바꿔도 포커스는 버튼에 남는다", () => {
		render(<DatePicker variant="calendar" value="2026-10-12" onValueChange={vi.fn()} />);
		open();

		const next = screen.getByRole("button", { name: "다음 달" });
		next.focus();
		act(() => fireEvent.click(next));
		expect(screen.getByText("2026년 11월")).toBeInTheDocument();
		expect(next).toHaveFocus();
	});

	it("Field 안에서는 라벨이 칸을 가리키고, 칸의 이름은 라벨 + 값이다", () => {
		render(
			<Field name="start" label="시작일" error="날짜를 고르세요">
				<DatePicker variant="calendar" value="2026-10-12" onValueChange={vi.fn()} />
			</Field>,
		);

		const trigger = screen.getByRole("button", { name: "시작일 2026. 10. 12. (월)" });
		expect(screen.getByText("시작일").closest("label")).toHaveAttribute("for", trigger.id);
		expect(trigger).toHaveAttribute("aria-invalid", "true");
	});

	it("disabled 면 열리지 않는다", () => {
		render(<DatePicker variant="calendar" disabled onValueChange={vi.fn()} />);

		const trigger = screen.getByRole("button", { name: "날짜 선택" });
		expect(trigger).toBeDisabled();
		fireEvent.click(trigger);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("mode=year-month 면 고를 날이 없어 드롭다운으로 그린다", () => {
		render(<DatePicker variant="calendar" mode="year-month" onValueChange={vi.fn()} />);

		expect(screen.getAllByRole("combobox")).toHaveLength(2);
	});

	it("영어 로캘에서는 영어 날짜와 문구를 쓴다", () => {
		render(
			<LocaleProvider locale="en">
				<DatePicker variant="calendar" value="2026-10-12" onValueChange={vi.fn()} />
			</LocaleProvider>,
		);

		expect(screen.getByText("Mon, Oct 12, 2026")).toBeInTheDocument();
		open();
		expect(screen.getByText("October 2026")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
	});
});
