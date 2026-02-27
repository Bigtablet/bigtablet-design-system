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

    it("opens on Space key when closed", () => {
        render(<Select options={options} />);
        const button = screen.getByRole("button");

        fireEvent.keyDown(button, { key: " " });

        expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("commits active option on Enter key when open", () => {
        const onChange = vi.fn();
        render(<Select options={options} onChange={onChange} />);
        const button = screen.getByRole("button");

        // click opens and sets activeIndex to first non-disabled option (Option 1)
        fireEvent.click(button);
        fireEvent.keyDown(button, { key: "Enter" });

        expect(onChange).toHaveBeenCalledWith("1", options[0]);
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("navigates to first non-disabled option with Home key", () => {
        render(<Select options={options} />);
        const button = screen.getByRole("button");

        // open first so the init effect won't override the Home key's activeIndex
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
        render(<Select options={allEnabled} />);
        const button = screen.getByRole("button");

        // open first so the init effect won't override the End key's activeIndex
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
        render(<Select options={endDisabled} />);
        const button = screen.getByRole("button");

        // open first so the init effect won't override the End key's activeIndex
        fireEvent.click(button);
        fireEvent.keyDown(button, { key: "End" });

        const secondOption = screen.getByText("Opt 2").closest("[role='option']");
        expect(secondOption).toHaveClass("is_active");
    });

    it("does not change active index on mouse enter over disabled option", () => {
        render(<Select options={options} />);
        const button = screen.getByRole("button");

        // click opens and sets activeIndex to first non-disabled option (Option 1)
        fireEvent.click(button);

        const disabledOption = screen.getByText("Option 3").closest("[role='option']")!;
        fireEvent.mouseEnter(disabledOption);

        expect(screen.getByText("Option 1").closest("[role='option']")).toHaveClass("is_active");
        expect(disabledOption).not.toHaveClass("is_active");
    });
});
