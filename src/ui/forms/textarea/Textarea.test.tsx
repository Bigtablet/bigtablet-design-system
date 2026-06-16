import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./index";

describe("Textarea", () => {
	it("renders label + textarea", () => {
		render(<Textarea label="내용" />);
		expect(screen.getByText("내용")).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("calls onChangeAction on input (uncontrolled)", () => {
		const onChange = vi.fn();
		render(<Textarea label="내용" onChangeAction={onChange} />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
		expect(onChange).toHaveBeenCalledWith("hello");
	});

	it("controlled value reflects prop", () => {
		const { rerender } = render(<Textarea value="a" onChangeAction={() => {}} />);
		expect(screen.getByRole("textbox")).toHaveValue("a");
		rerender(<Textarea value="ab" onChangeAction={() => {}} />);
		expect(screen.getByRole("textbox")).toHaveValue("ab");
	});

	it("applies error class + aria-invalid", () => {
		const { container } = render(<Textarea label="내용" error />);
		expect(container.firstChild).toHaveClass("textarea_error");
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
	});

	it("links supportingText via aria-describedby", () => {
		render(<Textarea label="내용" supportingText="도움말" />);
		const ta = screen.getByRole("textbox");
		const helpId = ta.getAttribute("aria-describedby");
		expect(helpId).toBeTruthy();
		expect(screen.getByText("도움말")).toHaveAttribute("id", helpId as string);
	});

	it("renders counter when showCounter + maxLength", () => {
		render(<Textarea label="내용" showCounter maxLength={100} defaultValue="abc" />);
		expect(screen.getByText("3/100")).toBeInTheDocument();
	});

	it("counter updates on input", () => {
		render(<Textarea label="내용" showCounter maxLength={10} />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "hey" } });
		expect(screen.getByText("3/10")).toBeInTheDocument();
	});

	it("respects rows prop", () => {
		render(<Textarea label="내용" rows={5} />);
		expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
	});

	it("disabled state", () => {
		const { container } = render(<Textarea label="내용" disabled />);
		expect(container.firstChild).toHaveClass("textarea_disabled");
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("delayed IME — onChangeAction NOT called during composition", () => {
		const onChange = vi.fn();
		render(<Textarea label="내용" onChangeAction={onChange} />);
		const ta = screen.getByRole("textbox");
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "ㅎ" } });
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.compositionEnd(ta, { target: { value: "한" } });
		expect(onChange).toHaveBeenCalledWith("한");
	});

	it("immediate IME — onChangeAction called during composition", () => {
		const onChange = vi.fn();
		render(<Textarea label="내용" imeStrategy="immediate" onChangeAction={onChange} />);
		const ta = screen.getByRole("textbox");
		fireEvent.compositionStart(ta);
		fireEvent.change(ta, { target: { value: "ㅎ" } });
		expect(onChange).toHaveBeenCalledWith("ㅎ");
	});

	it("transformValue applied (non-composition)", () => {
		const onChange = vi.fn();
		render(
			<Textarea
				label="내용"
				transformValue={(v) => v.toUpperCase()}
				onChangeAction={onChange}
			/>,
		);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
		expect(onChange).toHaveBeenCalledWith("ABC");
	});
});
