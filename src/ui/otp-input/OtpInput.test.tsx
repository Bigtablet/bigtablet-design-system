import { fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./index";

function ControlledOtp(props: Partial<React.ComponentProps<typeof OtpInput>>) {
	const [val, setVal] = React.useState(props.value ?? "");
	return <OtpInput length={6} {...props} value={val} onChange={setVal} />;
}

describe("OtpInput", () => {
	it("renders correct number of inputs for length=6", () => {
		render(<OtpInput length={6} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		expect(inputs.length).toBe(6);
	});

	it("renders correct number of inputs for length=4", () => {
		render(<OtpInput length={4} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		expect(inputs.length).toBe(4);
	});

	it("displays value across inputs", () => {
		render(<OtpInput length={6} value="123456" ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
		expect(inputs[0].value).toBe("1");
		expect(inputs[5].value).toBe("6");
	});

	it("calls onChange when digit is entered", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.change(inputs[0], { target: { value: "5" } });
		expect(onChange).toHaveBeenCalledWith("5");
	});

	it("rejects non-numeric input", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.change(inputs[0], { target: { value: "a" } });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("handles paste", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.paste(inputs[0], {
			clipboardData: { getData: () => "123456" },
		});
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("handles paste with non-numeric characters", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.paste(inputs[0], {
			clipboardData: { getData: () => "12-34-56" },
		});
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("renders supporting text", () => {
		render(<OtpInput length={6} supportingText="인증 코드를 입력하세요" ariaLabel="OTP" />);
		expect(screen.getByText("인증 코드를 입력하세요")).toBeDefined();
	});

	it("applies error class when error is true", () => {
		render(<OtpInput length={6} error ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		expect(inputs[0].className).toContain("otp_input_box_error");
	});

	it("applies disabled attribute when disabled", () => {
		render(<OtpInput length={6} disabled ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
		expect(inputs[0].disabled).toBe(true);
	});

	it("has correct aria-label on group", () => {
		render(<OtpInput length={6} ariaLabel="인증 코드" />);
		expect(screen.getByRole("group")).toBeDefined();
		expect(screen.getByRole("group").getAttribute("aria-label")).toBe("인증 코드");
	});
});
