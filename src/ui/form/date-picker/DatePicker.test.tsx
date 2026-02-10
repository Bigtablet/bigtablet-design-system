import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatePicker } from "./index";

describe("DatePicker", () => {
    it("renders with label", () => {
        render(<DatePicker label="Birth Date" onChange={() => {}} />);
        expect(screen.getByText("Birth Date")).toBeInTheDocument();
    });

    it("renders year select with placeholder", () => {
        render(<DatePicker onChange={() => {}} />);
        expect(screen.getByText("연도")).toBeInTheDocument();
    });

    it("renders month select with placeholder", () => {
        render(<DatePicker onChange={() => {}} />);
        expect(screen.getByText("월")).toBeInTheDocument();
    });

    it("renders day select in year-month-day mode", () => {
        render(<DatePicker mode="year-month-day" onChange={() => {}} />);
        expect(screen.getByText("일")).toBeInTheDocument();
    });

    it("does not render day select in year-month mode", () => {
        render(<DatePicker mode="year-month" onChange={() => {}} />);
        expect(screen.queryByText("일")).not.toBeInTheDocument();
    });

    it("calls onChange when year is selected", () => {
        const onChange = vi.fn();
        render(<DatePicker onChange={onChange} />);

        const selects = screen.getAllByRole("combobox");
        fireEvent.change(selects[0], { target: { value: "2024" } });

        expect(onChange).toHaveBeenCalled();
    });

    it("shows selected year", () => {
        render(<DatePicker value="2024-06-15" onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        expect(selects[0]).toHaveValue("2024");
    });

    it("shows selected month", () => {
        render(<DatePicker value="2024-06-15" onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        expect(selects[1]).toHaveValue("6");
    });

    it("shows selected day", () => {
        render(<DatePicker value="2024-06-15" onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        expect(selects[2]).toHaveValue("15");
    });

    it("disables all selects when disabled", () => {
        render(<DatePicker disabled onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        selects.forEach(select => {
            expect(select).toBeDisabled();
        });
    });

    it("disables month select when year is not selected", () => {
        render(<DatePicker onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        expect(selects[1]).toBeDisabled();
    });

    it("disables day select when month is not selected", () => {
        render(<DatePicker value="2024" onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        expect(selects[2]).toBeDisabled();
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

    it("generates year options from startYear to endYear", () => {
        render(<DatePicker startYear={2020} endYear={2025} onChange={() => {}} />);
        const selects = screen.getAllByRole("combobox");
        const yearSelect = selects[0];

        expect(yearSelect.querySelectorAll("option").length).toBe(7); // 6년 + 플레이스홀더
    });
});
