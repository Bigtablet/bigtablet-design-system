import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./index";

describe("DatePicker", () => {
	it("renders with label", () => {
		render(<DatePicker label="Birth Date" onChange={() => {}} />);
		expect(screen.getByText("Birth Date")).toBeInTheDocument();
	});

	it("renders year/month selects by default", () => {
		render(<DatePicker onChange={() => {}} />);
		// label + placeholder 로 각 Select 에 두 번씩 "Year"/"Month" 나타남
		expect(screen.getAllByText("Year").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Month").length).toBeGreaterThan(0);
	});

	it("renders day select in year-month-day mode", () => {
		render(<DatePicker mode="year-month-day" onChange={() => {}} />);
		expect(screen.getAllByText("Day").length).toBeGreaterThan(0);
	});

	it("does not render day select in year-month mode", () => {
		render(<DatePicker mode="year-month" onChange={() => {}} />);
		expect(screen.queryByText("Day")).not.toBeInTheDocument();
	});

	it("renders 3 select buttons in year-month-day mode", () => {
		render(<DatePicker mode="year-month-day" onChange={() => {}} />);
		expect(screen.getAllByRole("button")).toHaveLength(3);
	});

	it("renders 2 select buttons in year-month mode", () => {
		render(<DatePicker mode="year-month" onChange={() => {}} />);
		expect(screen.getAllByRole("button")).toHaveLength(2);
	});

	it("calls onChange when year is selected (year-month mode)", () => {
		const onChange = vi.fn();
		render(
			<DatePicker mode="year-month" startYear={2020} endYear={2025} onChange={onChange} />,
		);

		// 첫 Select 버튼(연도) 열고 "2024" 클릭
		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[0]);
		fireEvent.click(screen.getByText("2024"));

		expect(onChange).toHaveBeenCalledWith("2024-01");
	});

	it("calls onChange when month is changed", () => {
		const onChange = vi.fn();
		render(<DatePicker value="2024" onChange={onChange} />);

		const buttons = screen.getAllByRole("button");
		// month = buttons[1]
		fireEvent.click(buttons[1]);
		fireEvent.click(screen.getByText("06"));

		expect(onChange).toHaveBeenCalledWith("2024-06-01");
	});

	it("calls onChange when day is changed", () => {
		const onChange = vi.fn();
		render(<DatePicker value="2024-06" onChange={onChange} />);

		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[2]);
		fireEvent.click(screen.getByText("15"));

		expect(onChange).toHaveBeenCalledWith("2024-06-15");
	});

	it("shows selected year in button label", () => {
		render(<DatePicker value="2024-06-15" onChange={() => {}} />);
		const buttons = screen.getAllByRole("button");
		expect(buttons[0]).toHaveTextContent("2024");
	});

	it("shows selected month in button label", () => {
		render(<DatePicker value="2024-06-15" onChange={() => {}} />);
		const buttons = screen.getAllByRole("button");
		expect(buttons[1]).toHaveTextContent("06");
	});

	it("shows selected day in button label", () => {
		render(<DatePicker value="2024-06-15" onChange={() => {}} />);
		const buttons = screen.getAllByRole("button");
		expect(buttons[2]).toHaveTextContent("15");
	});

	it("disables all selects when disabled", () => {
		render(<DatePicker disabled onChange={() => {}} />);
		const buttons = screen.getAllByRole("button");
		buttons.forEach((btn) => {
			expect(btn).toBeDisabled();
		});
	});

	it("disables month select when year is not selected", () => {
		render(<DatePicker onChange={() => {}} />);
		const buttons = screen.getAllByRole("button");
		expect(buttons[1]).toBeDisabled();
	});

	it("disables day select when month is not selected", () => {
		render(<DatePicker value="2024" onChange={() => {}} />);
		const buttons = screen.getAllByRole("button");
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
		expect(screen.getByText(/Minimum date: 2020-01-01/)).toBeInTheDocument();
	});

	it("renders sr-only constraint description when selectableRange is until-today", () => {
		render(<DatePicker selectableRange="until-today" onChange={() => {}} />);
		expect(screen.getByText(/Selectable up to today/)).toBeInTheDocument();
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
});
