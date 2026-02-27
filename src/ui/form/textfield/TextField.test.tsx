import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TextField } from "./index";

describe("TextField", () => {
    it("renders with label", () => {
        render(<TextField label="Email" />);
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
        render(<TextField helperText="Enter your email address" />);
        expect(screen.getByText("Enter your email address")).toBeInTheDocument();
    });

    it("shows error state", () => {
        render(<TextField error helperText="Invalid email" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveClass("text_field_error");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("Invalid email")).toHaveClass("text_field_helper_error");
    });

    it("shows success state", () => {
        render(<TextField success helperText="Valid email" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveClass("text_field_success");
        expect(screen.getByText("Valid email")).toHaveClass("text_field_helper_success");
    });

    it("handles value changes", () => {
        const handleChange = vi.fn();
        render(<TextField onChangeAction={handleChange} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "test@example.com" } });

        expect(handleChange).toHaveBeenCalledWith("test@example.com");
    });

    it("transforms value", () => {
        const handleChange = vi.fn();
        render(
            <TextField
                onChangeAction={handleChange}
                transformValue={(v) => v.toUpperCase()}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "hello" } });

        expect(handleChange).toHaveBeenCalledWith("HELLO");
    });

    it("renders with different variants", () => {
        const { rerender } = render(<TextField variant="outline" />);
        expect(screen.getByRole("textbox")).toHaveClass("text_field_variant_outline");

        rerender(<TextField variant="filled" />);
        expect(screen.getByRole("textbox")).toHaveClass("text_field_variant_filled");

        rerender(<TextField variant="ghost" />);
        expect(screen.getByRole("textbox")).toHaveClass("text_field_variant_ghost");
    });

    it("renders with different sizes", () => {
        const { rerender } = render(<TextField size="sm" />);
        expect(screen.getByRole("textbox")).toHaveClass("text_field_size_sm");

        rerender(<TextField size="lg" />);
        expect(screen.getByRole("textbox")).toHaveClass("text_field_size_lg");
    });

    it("renders full width", () => {
        render(<TextField fullWidth />);
        expect(screen.getByRole("textbox").closest(".text_field")).toHaveClass(
            "text_field_full_width"
        );
    });

    it("can be disabled", () => {
        render(<TextField disabled />);
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("renders with left icon", () => {
        render(<TextField leftIcon={<span data-testid="left-icon">@</span>} />);
        expect(screen.getByTestId("left-icon")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveClass("text_field_with_left");
    });

    it("renders with right icon", () => {
        render(<TextField rightIcon={<span data-testid="right-icon">✓</span>} />);
        expect(screen.getByTestId("right-icon")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveClass("text_field_with_right");
    });

    it("supports controlled mode", () => {
        const { rerender } = render(<TextField value="initial" />);
        expect(screen.getByRole("textbox")).toHaveValue("initial");

        rerender(<TextField value="updated" />);
        expect(screen.getByRole("textbox")).toHaveValue("updated");
    });

    it("supports uncontrolled mode with defaultValue", () => {
        render(<TextField defaultValue="default" />);
        expect(screen.getByRole("textbox")).toHaveValue("default");
    });

    it("links helper text with aria-describedby", () => {
        render(<TextField label="Email" helperText="Required field" />);
        const input = screen.getByRole("textbox");
        const helperId = input.getAttribute("aria-describedby");
        expect(helperId).toBeTruthy();
        expect(document.getElementById(helperId!)).toHaveTextContent("Required field");
    });

    it("handles IME composition correctly", () => {
        const handleChange = vi.fn();
        render(<TextField onChangeAction={handleChange} />);

        const input = screen.getByRole("textbox");

        fireEvent.compositionStart(input);
        fireEvent.change(input, { target: { value: "중" } });
        expect(handleChange).not.toHaveBeenCalled();

        fireEvent.compositionEnd(input, { target: { value: "중간" } });
        expect(handleChange).toHaveBeenCalledWith("중간");
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("applies transform after IME composition ends", () => {
        const handleChange = vi.fn();
        render(
            <TextField
                onChangeAction={handleChange}
                transformValue={(v) => v.toUpperCase()}
            />
        );

        const input = screen.getByRole("textbox");

        fireEvent.compositionStart(input);
        fireEvent.change(input, { target: { value: "abc" } });
        fireEvent.compositionEnd(input, { target: { value: "abc" } });

        expect(handleChange).toHaveBeenCalledWith("ABC");
    });
});
