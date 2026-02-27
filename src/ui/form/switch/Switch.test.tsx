import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "./index";

describe("Switch", () => {
    it("renders with aria-label", () => {
        render(<Switch ariaLabel="Dark mode" />);
        expect(screen.getByRole("switch")).toHaveAttribute("aria-label", "Dark mode");
    });

    it("renders in off state by default", () => {
        render(<Switch ariaLabel="Toggle" />);
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });

    it("renders in on state when defaultChecked", () => {
        render(<Switch ariaLabel="Toggle" defaultChecked />);
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    });

    it("toggles on click", () => {
        const onChange = vi.fn();
        render(<Switch ariaLabel="Toggle" onChange={onChange} />);

        fireEvent.click(screen.getByRole("switch"));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("toggles off when already on", () => {
        const onChange = vi.fn();
        render(<Switch ariaLabel="Toggle" defaultChecked onChange={onChange} />);

        fireEvent.click(screen.getByRole("switch"));
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it("is disabled when disabled prop is true", () => {
        render(<Switch ariaLabel="Toggle" disabled />);
        expect(screen.getByRole("switch")).toBeDisabled();
    });

    it("does not toggle when disabled", () => {
        const onChange = vi.fn();
        render(<Switch ariaLabel="Toggle" disabled onChange={onChange} />);

        fireEvent.click(screen.getByRole("switch"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("applies size class", () => {
        render(<Switch ariaLabel="Toggle" size="lg" />);
        expect(screen.getByRole("switch")).toHaveClass("switch_size_lg");
    });

    it("applies switch_on class when checked", () => {
        render(<Switch ariaLabel="Toggle" checked />);
        expect(screen.getByRole("switch")).toHaveClass("switch_on");
    });

    it("controlled mode works correctly", () => {
        const { rerender } = render(<Switch ariaLabel="Toggle" checked={false} />);
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

        rerender(<Switch ariaLabel="Toggle" checked={true} />);
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    });

    it("forwards ref correctly", () => {
        const ref = vi.fn();
        render(<Switch ariaLabel="Toggle" ref={ref} />);
        expect(ref).toHaveBeenCalled();
    });

    it("calls onChange but keeps controlled value in controlled mode", () => {
        const onChange = vi.fn();
        render(<Switch ariaLabel="Toggle" checked={false} onChange={onChange} />);

        fireEvent.click(screen.getByRole("switch"));

        expect(onChange).toHaveBeenCalledWith(true);
        // Controlled: aria-checked stays at the prop value (false)
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });
});
