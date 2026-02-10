import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Radio } from "./index";

describe("Radio", () => {
    it("renders with label", () => {
        render(<Radio label="Option A" name="test" />);
        expect(screen.getByText("Option A")).toBeInTheDocument();
    });

    it("renders without label", () => {
        render(<Radio name="test" />);
        expect(screen.getByRole("radio")).toBeInTheDocument();
    });

    it("handles checked state", () => {
        render(<Radio name="test" defaultChecked />);
        expect(screen.getByRole("radio")).toBeChecked();
    });

    it("calls onChange when clicked", () => {
        const onChange = vi.fn();
        render(<Radio name="test" onChange={onChange} />);

        fireEvent.click(screen.getByRole("radio"));
        expect(onChange).toHaveBeenCalled();
    });

    it("is disabled when disabled prop is true", () => {
        render(<Radio name="test" disabled />);
        expect(screen.getByRole("radio")).toBeDisabled();
    });

    it("applies size class", () => {
        render(<Radio name="test" size="sm" />);
        const label = screen.getByRole("radio").closest("label");
        expect(label).toHaveClass("radio_size_sm");
    });

    it("applies custom className", () => {
        render(<Radio name="test" className="custom-radio" />);
        const label = screen.getByRole("radio").closest("label");
        expect(label).toHaveClass("custom-radio");
    });

    it("works in a group", () => {
        render(
            <>
                <Radio name="group" value="a" label="A" />
                <Radio name="group" value="b" label="B" />
            </>
        );

        const radios = screen.getAllByRole("radio");
        expect(radios).toHaveLength(2);

        fireEvent.click(radios[0]);
        expect(radios[0]).toBeChecked();
        expect(radios[1]).not.toBeChecked();
    });

    it("forwards ref correctly", () => {
        const ref = vi.fn();
        render(<Radio name="test" ref={ref} />);
        expect(ref).toHaveBeenCalled();
    });
});
