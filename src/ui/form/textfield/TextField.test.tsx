import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./index";

describe("TextField", () => {
	it("renders with label", () => {
		render(<TextField label="Email" />);
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});

	it("renders with helper text", () => {
		render(<TextField supportingText="Enter your email address" />);
		expect(screen.getByText("Enter your email address")).toBeInTheDocument();
	});

	it("shows error state", () => {
		render(<TextField error supportingText="Invalid email" />);
		const root = screen.getByRole("textbox").closest(".text_field");
		expect(root).toHaveClass("text_field_error");
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
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
		render(<TextField onChangeAction={handleChange} transformValue={(v) => v.toUpperCase()} />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "hello" } });

		expect(handleChange).toHaveBeenCalledWith("HELLO");
	});

	it("renders with leading and trailing icons", () => {
		render(
			<TextField
				leadingIcon={<span data-testid="lead">Q</span>}
				trailingIcon={<span data-testid="trail">X</span>}
			/>,
		);
		expect(screen.getByTestId("lead")).toBeInTheDocument();
		expect(screen.getByTestId("trail")).toBeInTheDocument();
	});

	it("hides label when showLabel is false", () => {
		render(<TextField label="Email" showLabel={false} />);
		expect(screen.queryByText("Email")).not.toBeInTheDocument();
	});

	it("sets aria-label when showLabel is false", () => {
		render(<TextField label="Email" showLabel={false} />);
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-label", "Email");
	});

	it("does not set aria-label when showLabel is true", () => {
		render(<TextField label="Email" />);
		expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-label");
	});

	it("renders full width", () => {
		render(<TextField fullWidth />);
		expect(screen.getByRole("textbox").closest(".text_field")).toHaveClass("text_field_full_width");
	});

	it("can be disabled", () => {
		render(<TextField disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
		expect(screen.getByRole("textbox").closest(".text_field")).toHaveClass("text_field_disabled");
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
		render(<TextField label="Email" supportingText="Required field" />);
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
		render(<TextField onChangeAction={handleChange} transformValue={(v) => v.toUpperCase()} />);

		const input = screen.getByRole("textbox");

		fireEvent.compositionStart(input);
		fireEvent.change(input, { target: { value: "abc" } });
		fireEvent.compositionEnd(input, { target: { value: "abc" } });

		expect(handleChange).toHaveBeenCalledWith("ABC");
	});
});
