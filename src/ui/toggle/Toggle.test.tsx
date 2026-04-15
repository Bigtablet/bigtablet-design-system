import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./index";

describe("Toggle", () => {
	it("renders with aria-label", () => {
		render(<Toggle ariaLabel="Dark mode" />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-label", "Dark mode");
	});

	it("renders in off state by default", () => {
		render(<Toggle ariaLabel="Toggle" />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
	});

	it("renders in on state when defaultChecked", () => {
		render(<Toggle ariaLabel="Toggle" defaultChecked />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("toggles on click", () => {
		const onChange = vi.fn();
		render(<Toggle ariaLabel="Toggle" onChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("toggles off when already on", () => {
		const onChange = vi.fn();
		render(<Toggle ariaLabel="Toggle" defaultChecked onChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).toHaveBeenCalledWith(false);
	});

	it("is disabled when disabled prop is true", () => {
		render(<Toggle ariaLabel="Toggle" disabled />);
		expect(screen.getByRole("switch")).toBeDisabled();
	});

	it("does not toggle when disabled", () => {
		const onChange = vi.fn();
		render(<Toggle ariaLabel="Toggle" disabled onChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).not.toHaveBeenCalled();
	});

	it("applies size class", () => {
		render(<Toggle ariaLabel="Toggle" size="md" />);
		expect(screen.getByRole("switch")).toHaveClass("toggle_size_md");
	});

	it("applies toggle_on class when checked", () => {
		render(<Toggle ariaLabel="Toggle" checked />);
		expect(screen.getByRole("switch")).toHaveClass("toggle_on");
	});

	it("controlled mode works correctly", () => {
		const { rerender } = render(<Toggle ariaLabel="Toggle" checked={false} />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

		rerender(<Toggle ariaLabel="Toggle" checked={true} />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("forwards ref correctly", () => {
		const ref = vi.fn();
		render(<Toggle ariaLabel="Toggle" ref={ref} />);
		expect(ref).toHaveBeenCalled();
	});

	it("calls onChange but keeps controlled value in controlled mode", () => {
		const onChange = vi.fn();
		render(<Toggle ariaLabel="Toggle" checked={false} onChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));

		expect(onChange).toHaveBeenCalledWith(true);
		// Controlled: aria-checked stays at the prop value (false)
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
	});
});
