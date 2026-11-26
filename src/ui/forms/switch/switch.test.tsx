import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { Switch, Toggle } from "./index";

describe("Switch", () => {
	it("renders with aria-label", () => {
		render(<Switch ariaLabel="Dark mode" />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-label", "Dark mode");
	});

	it("renders in off state by default", () => {
		render(<Switch ariaLabel="Switch" />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
	});

	it("renders in on state when defaultChecked", () => {
		render(<Switch ariaLabel="Switch" defaultChecked />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("toggles on click", () => {
		const onChange = vi.fn();
		render(<Switch ariaLabel="Switch" onCheckedChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("toggles off when already on", () => {
		const onChange = vi.fn();
		render(<Switch ariaLabel="Switch" defaultChecked onCheckedChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).toHaveBeenCalledWith(false);
	});

	it("is disabled when disabled prop is true", () => {
		render(<Switch ariaLabel="Switch" disabled />);
		expect(screen.getByRole("switch")).toBeDisabled();
	});

	it("does not toggle when disabled", () => {
		const onChange = vi.fn();
		render(<Switch ariaLabel="Switch" disabled onCheckedChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).not.toHaveBeenCalled();
	});

	it("applies size class", () => {
		render(<Switch ariaLabel="Switch" size="md" />);
		expect(screen.getByRole("switch")).toHaveClass("toggle_size_md");
	});

	it("applies toggle_on class when checked", () => {
		render(<Switch ariaLabel="Switch" checked />);
		expect(screen.getByRole("switch")).toHaveClass("toggle_on");
	});

	it("controlled mode works correctly", () => {
		const { rerender } = render(<Switch ariaLabel="Switch" checked={false} />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

		rerender(<Switch ariaLabel="Switch" checked={true} />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("forwards ref correctly", () => {
		const ref = vi.fn();
		render(<Switch ariaLabel="Switch" ref={ref} />);
		expect(ref).toHaveBeenCalled();
	});

	it("calls onChange but keeps controlled value in controlled mode", () => {
		const onChange = vi.fn();
		render(<Switch ariaLabel="Switch" checked={false} onCheckedChange={onChange} />);

		fireEvent.click(screen.getByRole("switch"));

		expect(onChange).toHaveBeenCalledWith(true);
		// Controlled: aria-checked stays at the prop value (false)
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
	});

	it("calls onCheckedChange (canonical) on click", () => {
		const onCheckedChange = vi.fn();
		render(<Switch ariaLabel="Switch" onCheckedChange={onCheckedChange} />);
		fireEvent.click(screen.getByRole("switch"));
		expect(onCheckedChange).toHaveBeenCalledWith(true);
	});

	it("runs consumer onClick AND still toggles ({...props} spread must not replace toggle handler)", () => {
		const onClick = vi.fn();
		const onCheckedChange = vi.fn();
		render(<Switch ariaLabel="Switch" onClick={onClick} onCheckedChange={onCheckedChange} />);

		fireEvent.click(screen.getByRole("switch"));

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onCheckedChange).toHaveBeenCalledWith(true);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("skips toggling when consumer onClick calls preventDefault", () => {
		const onCheckedChange = vi.fn();
		render(
			<Switch
				ariaLabel="Switch"
				onClick={(e) => e.preventDefault()}
				onCheckedChange={onCheckedChange}
			/>,
		);

		fireEvent.click(screen.getByRole("switch"));

		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
	});

	it("announces the Field's required state", () => {
		// role="switch" 는 checkbox 의 하위 role 이라 aria-required 를 받는다
		// (axe 4.13 ariaRoles.switch.allowedAttrs).
		render(
			<Field name="alerts" label="알림" required>
				<Switch ariaLabel="알림" />
			</Field>,
		);

		expect(screen.getByRole("switch")).toHaveAttribute("aria-required", "true");
	});

	it("does not claim required when the Field is optional", () => {
		render(
			<Field name="alerts" label="알림">
				<Switch ariaLabel="알림" />
			</Field>,
		);

		expect(screen.getByRole("switch")).not.toHaveAttribute("aria-required");
	});

	it("Toggle 은 Switch 의 deprecated 별칭이다 - 같은 마크업 (#1167)", () => {
		const onCheckedChange = vi.fn();
		render(<Toggle ariaLabel="알림" onCheckedChange={onCheckedChange} />);
		fireEvent.click(screen.getByRole("switch", { name: "알림" }));
		expect(onCheckedChange).toHaveBeenCalledWith(true);
		expect(screen.getByRole("switch")).toHaveClass("toggle", "toggle_on");
	});
});
