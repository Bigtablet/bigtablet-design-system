import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./index";

describe("Button", () => {
	it("renders with default props", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: "Click me" });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass("button", "button_variant_filled", "button_size_md");
	});

	it("renders with different variants", () => {
		const { rerender } = render(<Button variant="tonal">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_variant_tonal");

		rerender(<Button variant="outline">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_variant_outline");

		rerender(<Button variant="text">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_variant_text");
	});

	it("renders with different sizes", () => {
		const { rerender } = render(<Button size="sm">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_size_sm");

		rerender(<Button size="xl">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_size_xl");
	});

	it("renders with leading and trailing icons", () => {
		render(
			<Button leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
				Button
			</Button>,
		);

		expect(screen.getByTestId("lead")).toBeInTheDocument();
		expect(screen.getByTestId("trail")).toBeInTheDocument();
	});

	it("handles click events", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Click me
			</Button>,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();

		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("applies custom className", () => {
		render(<Button className="custom-class">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});

	it("applies fullWidth", () => {
		render(<Button fullWidth>Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_full_width");
	});

	it("does not apply fullWidth by default", () => {
		render(<Button>Button</Button>);
		expect(screen.getByRole("button")).not.toHaveClass("button_full_width");
	});
});
