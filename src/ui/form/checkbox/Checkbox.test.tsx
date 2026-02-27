import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./index";

describe("Checkbox", () => {
    it("renders with label", () => {
        render(<Checkbox label="Accept terms" />);
        expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("renders without label", () => {
        render(<Checkbox />);
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("handles checked state", () => {
        render(<Checkbox defaultChecked />);
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("calls onChange when clicked", () => {
        const onChange = vi.fn();
        render(<Checkbox onChange={onChange} />);

        fireEvent.click(screen.getByRole("checkbox"));
        expect(onChange).toHaveBeenCalled();
    });

    it("is disabled when disabled prop is true", () => {
        render(<Checkbox disabled />);
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("applies size class", () => {
        render(<Checkbox size="lg" />);
        const label = screen.getByRole("checkbox").closest("label");
        expect(label).toHaveClass("checkbox_size_lg");
    });

    it("applies custom className", () => {
        render(<Checkbox className="custom-class" />);
        const label = screen.getByRole("checkbox").closest("label");
        expect(label).toHaveClass("custom-class");
    });

    it("supports indeterminate state", () => {
        render(<Checkbox indeterminate />);
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
        expect(checkbox.indeterminate).toBe(true);
    });

    it("forwards ref correctly", () => {
        const ref = vi.fn();
        render(<Checkbox ref={ref} />);
        expect(ref).toHaveBeenCalled();
    });

    it("updates indeterminate state dynamically on rerender", () => {
        const { rerender } = render(<Checkbox indeterminate={false} />);
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
        expect(checkbox.indeterminate).toBe(false);

        rerender(<Checkbox indeterminate={true} />);
        expect(checkbox.indeterminate).toBe(true);

        rerender(<Checkbox indeterminate={false} />);
        expect(checkbox.indeterminate).toBe(false);
    });
});
