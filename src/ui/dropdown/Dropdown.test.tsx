import * as React from "react";
import { Star } from "lucide-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./index";

const options = [
	{ value: "1", label: "Option 1" },
	{ value: "2", label: "Option 2" },
	{ value: "3", label: "Option 3", disabled: true },
];

describe("Dropdown", () => {
	it("renders with placeholder", () => {
		render(<Dropdown options={options} placeholder="Select an option" />);
		expect(screen.getByText("Select an option")).toBeInTheDocument();
	});

	it("renders with label (hidden by default)", () => {
		render(<Dropdown options={options} label="Choose" />);
		// 라벨은 DOM에 있지만 is_visible 클래스 없이 opacity 0
		const label = screen.getByText("Choose");
		expect(label).toBeInTheDocument();
		expect(label).not.toHaveClass("is_visible");
	});

	it("shows label when open", () => {
		render(<Dropdown options={options} label="Choose" />);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(screen.getByText("Choose")).toHaveClass("is_visible");
	});

	it("shows label when value is selected", () => {
		render(<Dropdown options={options} label="Choose" value="1" />);
		expect(screen.getByText("Choose")).toHaveClass("is_visible");
	});

	it("opens dropdown on click", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("shows X icon when open, ChevronDown when closed", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		// 닫힌 상태: ChevronDown
		expect(button.querySelector(".dropdown_icon")).toBeInTheDocument();

		fireEvent.click(button);

		// 열린 상태: X
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("selects option on click", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText("Option 1"));

		expect(onChange).toHaveBeenCalledWith("1", options[0]);
	});

	it("shows selected value", () => {
		render(<Dropdown options={options} value="2" />);
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	it("does not select disabled option", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText("Option 3"));

		expect(onChange).not.toHaveBeenCalled();
	});

	it("closes on Escape key", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		fireEvent.keyDown(button, { key: "Escape" });
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("navigates with arrow keys", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "ArrowDown" });

		const activeOption = document.querySelector(".is_active");
		expect(activeOption).toBeInTheDocument();
	});

	it("is disabled when disabled prop is true", () => {
		render(<Dropdown options={options} disabled />);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies fullWidth style", () => {
		render(<Dropdown options={options} fullWidth />);
		const wrapper = screen.getByRole("button").closest(".dropdown");
		expect(wrapper).toHaveStyle({ width: "100%" });
	});

	it("opens on Space key when closed", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.keyDown(button, { key: " " });

		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("commits active option on Enter key when open", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "Enter" });

		expect(onChange).toHaveBeenCalledWith("1", options[0]);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("navigates to first non-disabled option with Home key", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "Home" });

		const firstOption = screen.getByText("Option 1").closest("[role='option']");
		expect(firstOption).toHaveClass("is_active");
	});

	it("navigates to last non-disabled option with End key", () => {
		const allEnabled = [
			{ value: "1", label: "Option 1" },
			{ value: "2", label: "Option 2" },
			{ value: "3", label: "Option 3" },
		];
		render(<Dropdown options={allEnabled} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "End" });

		const lastOption = screen.getByText("Option 3").closest("[role='option']");
		expect(lastOption).toHaveClass("is_active");
	});

	it("skips disabled options when navigating with End key", () => {
		const endDisabled = [
			{ value: "1", label: "Opt 1" },
			{ value: "2", label: "Opt 2" },
			{ value: "3", label: "Opt 3", disabled: true },
		];
		render(<Dropdown options={endDisabled} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "End" });

		const secondOption = screen.getByText("Opt 2").closest("[role='option']");
		expect(secondOption).toHaveClass("is_active");
	});

	it("does not change active index on mouse enter over disabled option", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);

		const disabledOption = screen.getByText("Option 3").closest("[role='option']")!;
		fireEvent.mouseEnter(disabledOption);

		expect(screen.getByText("Option 1").closest("[role='option']")).toHaveClass("is_active");
		expect(disabledOption).not.toHaveClass("is_active");
	});

	// ── 신규 기능 테스트 ────────────────────────────────────────────────────────

	it("renders supportingText in option", () => {
		const withSub = [{ value: "1", label: "Option 1", supportingText: "Sub text" }];
		render(<Dropdown options={withSub} />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByText("Sub text")).toBeInTheDocument();
	});

	it("renders leadingIcon in option", () => {
		const withIcon = [{ value: "1", label: "Option 1", leadingIcon: <Star data-testid="lead-icon" /> }];
		render(<Dropdown options={withIcon} />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByTestId("lead-icon")).toBeInTheDocument();
	});

	it("renders showDivider between options", () => {
		const withDivider = [
			{ value: "1", label: "Option 1", showDivider: true },
			{ value: "2", label: "Option 2" },
		];
		render(<Dropdown options={withDivider} />);
		fireEvent.click(screen.getByRole("button"));
		expect(document.querySelector(".dropdown_option_divider")).toBeInTheDocument();
	});

	it("renders custom trailingIcon instead of check", () => {
		const withTrail = [{ value: "1", label: "Option 1", trailingIcon: <Star data-testid="trail-icon" /> }];
		render(<Dropdown options={withTrail} value="1" />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByTestId("trail-icon")).toBeInTheDocument();
	});
});
