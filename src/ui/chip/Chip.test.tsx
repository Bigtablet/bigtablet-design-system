import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./index";

describe("Chip", () => {
	it("renders label text", () => {
		render(<Chip label="Tag" />);
		expect(screen.getByText("Tag")).toBeInTheDocument();
	});

	it("applies type classes", () => {
		const { container, rerender } = render(<Chip label="Tag" type="basic" />);
		expect(container.firstChild).toHaveClass("chip_type_basic");

		rerender(<Chip label="Tag" type="input" />);
		expect(container.firstChild).toHaveClass("chip_type_input");

		rerender(<Chip label="Tag" type="filter" />);
		expect(container.firstChild).toHaveClass("chip_type_filter");
	});

	it("shows check icon when selected", () => {
		const { container } = render(<Chip label="Tag" selected />);
		expect(container.firstChild).toHaveClass("chip_selected", "chip_has_leading");
		expect(container.querySelector(".chip_icon svg polyline")).toBeInTheDocument();
	});

	it("shows close icon when removable", () => {
		render(<Chip label="Tag" type="input" removable />);
		expect(screen.getByLabelText("Remove")).toBeInTheDocument();
	});

	it("shows chevron for filter type", () => {
		const { container } = render(<Chip label="Tag" type="filter" />);
		expect(container.firstChild).toHaveClass("chip_has_trailing");
		expect(container.querySelector(".chip_trailing .chip_icon svg")).toBeInTheDocument();
	});

	it("handles disabled state", () => {
		const { container } = render(<Chip label="Tag" disabled />);
		expect(container.firstChild).toHaveClass("chip_disabled");

		const buttons = container.querySelectorAll("button");
		for (const button of buttons) {
			expect(button).toBeDisabled();
		}
	});

	it("calls onClick", () => {
		const handleClick = vi.fn();
		render(<Chip label="Tag" onClick={handleClick} />);

		fireEvent.click(screen.getByRole("button", { name: "Tag" }));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("calls onRemove", () => {
		const handleRemove = vi.fn();
		render(<Chip label="Tag" type="input" removable onRemove={handleRemove} />);

		fireEvent.click(screen.getByLabelText("Remove"));
		expect(handleRemove).toHaveBeenCalledTimes(1);
	});
});
