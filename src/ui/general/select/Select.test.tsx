import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "./index";

const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3", disabled: true },
];

describe("Select", () => {
    it("renders with placeholder", () => {
        render(<Select options={options} placeholder="Select an option" />);
        expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("renders with label", () => {
        render(<Select options={options} label="Choose" />);
        expect(screen.getByText("Choose")).toBeInTheDocument();
    });

    it("opens dropdown on click", () => {
        render(<Select options={options} />);
        const button = screen.getByRole("button");
        fireEvent.click(button);
        expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("selects option on click", () => {
        const onChange = vi.fn();
        render(<Select options={options} onChange={onChange} />);

        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText("Option 1"));

        expect(onChange).toHaveBeenCalledWith("1", options[0]);
    });

    it("shows selected value", () => {
        render(<Select options={options} value="2" />);
        expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("does not select disabled option", () => {
        const onChange = vi.fn();
        render(<Select options={options} onChange={onChange} />);

        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText("Option 3"));

        expect(onChange).not.toHaveBeenCalled();
    });

    it("closes on Escape key", () => {
        render(<Select options={options} />);
        const button = screen.getByRole("button");

        fireEvent.click(button);
        expect(screen.getByRole("listbox")).toBeInTheDocument();

        fireEvent.keyDown(button, { key: "Escape" });
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("navigates with arrow keys", () => {
        render(<Select options={options} />);
        const button = screen.getByRole("button");

        fireEvent.click(button);
        fireEvent.keyDown(button, { key: "ArrowDown" });

        const activeOption = document.querySelector(".is_active");
        expect(activeOption).toBeInTheDocument();
    });

    it("is disabled when disabled prop is true", () => {
        render(<Select options={options} disabled />);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("applies fullWidth style", () => {
        render(<Select options={options} fullWidth />);
        const wrapper = screen.getByRole("button").parentElement;
        expect(wrapper).toHaveStyle({ width: "100%" });
    });
});
