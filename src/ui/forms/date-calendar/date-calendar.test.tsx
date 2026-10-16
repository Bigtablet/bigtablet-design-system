import { fireEvent, render, screen, within } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../../system/locale-provider";
import { DateCalendar } from "./index";

const day = (n: number) =>
	screen.getAllByRole("gridcell").map((c) => within(c).getByRole("button"))[n - 1]!;
const title = () => document.querySelector(".date_calendar_title")?.textContent;

describe("DateCalendar", () => {
	it("shows the selected date's month and marks it selected", () => {
		render(<DateCalendar value="2026-10-16" today="2026-10-01" />);
		expect(title()).toBe("2026년 10월");
		const cell = screen.getByRole("button", { name: /2026년 10월 16일/ });
		expect(cell.closest("td")).toHaveAttribute("aria-selected", "true");
		expect(cell).toHaveAttribute("tabindex", "0");
		expect(screen.getByRole("button", { name: /2026년 10월 1일/ })).toHaveAttribute(
			"aria-current",
			"date",
		);
	});

	it("emits YYYY-MM-DD and stays controlled", () => {
		const onValueChange = vi.fn();
		render(<DateCalendar value="2026-10-16" today="2026-10-01" onValueChange={onValueChange} />);
		fireEvent.click(day(5));
		expect(onValueChange).toHaveBeenCalledWith("2026-10-05");
		expect(day(16).closest("td")).toHaveAttribute("aria-selected", "true");
	});

	it("tracks its own value when uncontrolled", () => {
		render(<DateCalendar defaultValue="2026-10-16" today="2026-10-01" />);
		fireEvent.click(day(3));
		expect(day(3).closest("td")).toHaveAttribute("aria-selected", "true");
		expect(day(16).closest("td")).toHaveAttribute("aria-selected", "false");
	});

	it("opens on today's month without a value and ignores malformed values", () => {
		render(<DateCalendar value="2026-13-40" today="2026-03-09" />);
		expect(title()).toBe("2026년 3월");
		expect(screen.queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
	});

	it("blocks days outside min/max and from isDateDisabled, and stops paging at the ends", () => {
		const onValueChange = vi.fn();
		render(
			<DateCalendar
				today="2026-10-10"
				min="2026-10-05"
				max="2026-10-20"
				isDateDisabled={(d) => d === "2026-10-12"}
				onValueChange={onValueChange}
			/>,
		);
		for (const n of [4, 12, 21]) {
			expect(day(n)).toHaveAttribute("aria-disabled", "true");
			fireEvent.click(day(n));
		}
		expect(onValueChange).not.toHaveBeenCalled();
		expect(day(5)).not.toHaveAttribute("aria-disabled");
		expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "다음 달" })).toBeDisabled();
	});

	it("starts the week on the given weekday", () => {
		render(<DateCalendar today="2026-10-01" weekStartsOn={1} />);
		const heads = screen.getAllByRole("columnheader").map((h) => h.getAttribute("abbr"));
		expect(heads[0]).toBe("월요일");
		expect(heads[6]).toBe("일요일");
		// 2026-10-01 은 목요일 - 월요일 시작이면 앞에 빈 칸 3개
		const firstRow = screen.getAllByRole("row")[1]!;
		expect(within(firstRow).getAllByRole("gridcell")[0]).toHaveTextContent("1");
		expect(firstRow.querySelectorAll("td:not([role])")).toHaveLength(3);
	});

	it("moves Home/End within the configured week", () => {
		render(<DateCalendar value="2026-10-15" today="2026-10-01" weekStartsOn={1} />);
		const d15 = screen.getByRole("button", { name: /15일/ });
		d15.focus();
		fireEvent.keyDown(d15, { key: "Home" });
		expect(screen.getByRole("button", { name: /12일/ })).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(screen.getByRole("button", { name: /12일/ }), { key: "End" });
		expect(screen.getByRole("button", { name: /18일/ })).toHaveAttribute("tabindex", "0");
	});

	it("draws decorations hidden from assistive tech and describes them in the name", () => {
		render(
			<DateCalendar
				today="2026-10-01"
				renderDay={(d, info) =>
					d === "2026-10-08" ? <i data-testid="dot" data-today={info.today} /> : null
				}
				describeDay={(d) => (d === "2026-10-08" ? "일정 2개" : undefined)}
			/>,
		);
		const dot = screen.getByTestId("dot");
		expect(dot.parentElement).toHaveAttribute("aria-hidden", "true");
		expect(dot).toHaveAttribute("data-today", "false");
		expect(screen.getByRole("button", { name: /10월 8일.*, 일정 2개$/ })).toBeInTheDocument();
		expect(document.querySelectorAll(".date_calendar_decoration")).toHaveLength(1);
	});

	it("reports month changes and follows a controlled month", () => {
		const onMonthChange = vi.fn();
		const Demo = () => {
			const [month, setMonth] = React.useState("2026-10");
			return (
				<DateCalendar
					today="2026-10-01"
					month={month}
					onMonthChange={(m) => {
						onMonthChange(m);
						setMonth(m);
					}}
				/>
			);
		};
		render(<Demo />);
		fireEvent.click(screen.getByRole("button", { name: "다음 달" }));
		expect(onMonthChange).toHaveBeenLastCalledWith("2026-11");
		expect(title()).toBe("2026년 11월");
		const focused = screen.getAllByRole("button").find((b) => b.getAttribute("tabindex") === "0")!;
		fireEvent.keyDown(focused, { key: "PageUp", shiftKey: true });
		expect(onMonthChange).toHaveBeenLastCalledWith("2025-11");
		expect(title()).toBe("2025년 11월");
	});

	it("does not move a controlled month the parent refuses to change", () => {
		const onMonthChange = vi.fn();
		render(<DateCalendar today="2026-10-01" month="2026-10" onMonthChange={onMonthChange} />);
		fireEvent.click(screen.getByRole("button", { name: "다음 달" }));
		expect(onMonthChange).toHaveBeenCalledWith("2026-11");
		expect(title()).toBe("2026년 10월");
	});

	it("reports month changes when uncontrolled too", () => {
		const onMonthChange = vi.fn();
		render(<DateCalendar value="2026-10-31" today="2026-10-01" onMonthChange={onMonthChange} />);
		fireEvent.keyDown(screen.getByRole("button", { name: /31일/ }), { key: "ArrowRight" });
		expect(onMonthChange).toHaveBeenCalledWith("2026-11");
		expect(title()).toBe("2026년 11월");
	});

	it("uses the locale for labels and names, and accepts overrides", () => {
		const { unmount } = render(
			<LocaleProvider locale="en">
				<DateCalendar today="2026-10-01" />
			</LocaleProvider>,
		);
		expect(title()).toBe("October 2026");
		expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
		unmount();
		render(
			<DateCalendar
				today="2026-10-01"
				prevMonthLabel="앞 달"
				nextMonthLabel="뒷 달"
				className="x"
			/>,
		);
		expect(screen.getByRole("button", { name: "앞 달" })).toBeInTheDocument();
		expect(document.querySelector(".date_calendar")).toHaveClass("x");
	});

	it("moves keyboard focus into the next month when the parent follows onMonthChange", () => {
		const Demo = () => {
			const [month, setMonth] = React.useState("2026-10");
			return (
				<DateCalendar
					today="2026-10-01"
					defaultValue="2026-10-31"
					month={month}
					onMonthChange={setMonth}
				/>
			);
		};
		render(<Demo />);
		const d31 = screen.getByRole("button", { name: /10월 31일/ });
		d31.focus();
		fireEvent.keyDown(d31, { key: "ArrowRight" });
		expect(title()).toBe("2026년 11월");
		expect(screen.getByRole("button", { name: /11월 1일/ })).toHaveFocus();
	});

	it("keeps focus where it is when the parent refuses a keyboard month change", () => {
		const { rerender } = render(
			<DateCalendar today="2026-10-01" defaultValue="2026-10-31" month="2026-10" />,
		);
		const d31 = screen.getByRole("button", { name: /10월 31일/ });
		d31.focus();
		fireEvent.keyDown(d31, { key: "ArrowRight" });
		const outside = document.createElement("button");
		document.body.appendChild(outside);
		outside.focus();
		rerender(
			<DateCalendar today="2026-10-01" defaultValue="2026-10-31" month="2026-10" className="y" />,
		);
		expect(outside).toHaveFocus();
		outside.remove();
	});
});
