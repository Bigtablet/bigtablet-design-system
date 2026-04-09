import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FAB } from "./index";

describe("FAB", () => {
	it("renders icon", () => {
		render(<FAB icon={<svg data-testid="icon" />} />);
		expect(screen.getByTestId("icon")).toBeInTheDocument();
	});

	it("renders with default variant class", () => {
		render(<FAB icon={<svg />} />);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("fab", "fab_variant_primary");
	});

	it("applies variant classes", () => {
		const { rerender } = render(<FAB variant="primary" icon={<svg />} />);
		expect(screen.getByRole("button")).toHaveClass("fab_variant_primary");

		rerender(<FAB variant="additive" icon={<svg />} />);
		expect(screen.getByRole("button")).toHaveClass("fab_variant_additive");
	});

	it("handles disabled state", () => {
		const handleClick = vi.fn();
		render(<FAB icon={<svg />} disabled onClick={handleClick} />);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();

		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("calls onClick", () => {
		const handleClick = vi.fn();
		render(<FAB icon={<svg />} onClick={handleClick} />);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("applies custom className", () => {
		render(<FAB icon={<svg />} className="custom-class" />);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});
});
