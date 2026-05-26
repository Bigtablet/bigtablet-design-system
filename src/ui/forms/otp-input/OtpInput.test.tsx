import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

	it("handles paste on non-first input", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.paste(inputs[3], {
			clipboardData: { getData: () => "123456" },
		});
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("redirects focus to first empty box on focus", () => {
		render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
		fireEvent.focus(inputs[5]);
		expect(document.activeElement).toBe(inputs[2]);
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

	describe("auto focus next box on digit input", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("moves focus to next box after typing a digit", () => {
			render(<ControlledOtp length={6} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0].focus();
			fireEvent.change(inputs[0], { target: { value: "1" } });
			expect(document.activeElement).toBe(inputs[1]);
		});

		it("does not move focus past the last box", () => {
			render(<ControlledOtp length={4} value="123" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[3].focus();
			fireEvent.change(inputs[3], { target: { value: "4" } });
			// 마지막 자리는 다음 칸으로 이동 안 함
			expect(document.activeElement).toBe(inputs[3]);
		});

		it("releases isTypingRef after timeout so focus redirect works again", () => {
			render(<ControlledOtp length={6} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0].focus();
			fireEvent.change(inputs[0], { target: { value: "1" } });
			// timeout 경과
			act(() => {
				vi.advanceTimersByTime(100);
			});
			// 이제 빈 칸 redirect가 다시 동작해야 함
			fireEvent.focus(inputs[5]);
			expect(document.activeElement).toBe(inputs[1]);
		});
	});

	describe("Backspace handling", () => {
		it("clears current digit when current box has a value", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="123" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.keyDown(inputs[2], { key: "Backspace" });
			expect(onChange).toHaveBeenCalledWith("12");
		});

		it.skip("moves to previous box and clears it when current is empty", () => {
			const onChange = vi.fn();
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" onChange={onChange} />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2].focus();
			fireEvent.keyDown(inputs[2], { key: "Backspace" });
			expect(document.activeElement).toBe(inputs[1]);
			expect(onChange).toHaveBeenCalledWith("1");
		});

		it("does nothing meaningful at index 0 with empty value", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.keyDown(inputs[0], { key: "Backspace" });
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe("Arrow key navigation", () => {
		it.skip("moves focus to previous box on ArrowLeft", () => {
			render(<OtpInput length={6} value="" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[3].focus();
			fireEvent.keyDown(inputs[3], { key: "ArrowLeft" });
			expect(document.activeElement).toBe(inputs[2]);
		});

		it("does not move focus past index 0 on ArrowLeft", () => {
			render(<OtpInput length={6} value="" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0].focus();
			fireEvent.keyDown(inputs[0], { key: "ArrowLeft" });
			expect(document.activeElement).toBe(inputs[0]);
		});

		it.skip("moves focus to next box on ArrowRight", () => {
			render(<OtpInput length={6} value="" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2].focus();
			fireEvent.keyDown(inputs[2], { key: "ArrowRight" });
			expect(document.activeElement).toBe(inputs[3]);
		});

		it.skip("does not move focus past the last box on ArrowRight", () => {
			render(<OtpInput length={6} value="" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[5].focus();
			fireEvent.keyDown(inputs[5], { key: "ArrowRight" });
			expect(document.activeElement).toBe(inputs[5]);
		});

		it.skip("ignores unrelated keys", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2].focus();
			fireEvent.keyDown(inputs[2], { key: "Tab" });
			expect(document.activeElement).toBe(inputs[2]);
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe("Paste behavior", () => {
		it("ignores paste with no digits", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.paste(inputs[0], {
				clipboardData: { getData: () => "abc-xyz" },
			});
			expect(onChange).not.toHaveBeenCalled();
		});

		it("truncates paste data to length", () => {
			const onChange = vi.fn();
			render(<OtpInput length={4} value="" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.paste(inputs[0], {
				clipboardData: { getData: () => "12345678" },
			});
			expect(onChange).toHaveBeenCalledWith("1234");
		});

		it.skip("focuses last filled box after partial paste", () => {
			render(<ControlledOtp length={6} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.paste(inputs[0], {
				clipboardData: { getData: () => "12" },
			});
			expect(document.activeElement).toBe(inputs[2]);
		});

		it.skip("focuses last box after pasting exactly length digits", () => {
			render(<ControlledOtp length={6} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.paste(inputs[0], {
				clipboardData: { getData: () => "123456" },
			});
			expect(document.activeElement).toBe(inputs[5]);
		});
	});

	describe("Focus redirect to first empty box", () => {
		it("redirects to first empty box when user clicks a later box", () => {
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.focus(inputs[4]);
			expect(document.activeElement).toBe(inputs[2]);
		});

		it("does not redirect when focusing the first empty box itself", () => {
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2].focus();
			fireEvent.focus(inputs[2]);
			expect(document.activeElement).toBe(inputs[2]);
		});

		it("does not redirect when all boxes are filled", () => {
			render(<ControlledOtp length={6} value="123456" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[3].focus();
			fireEvent.focus(inputs[3]);
			expect(document.activeElement).toBe(inputs[3]);
		});

		it("does not redirect when focusing a box before the first empty one", () => {
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0].focus();
			fireEvent.focus(inputs[0]);
			expect(document.activeElement).toBe(inputs[0]);
		});
	});

	describe("autoFocus", () => {
		it("focuses the first box on mount when autoFocus is true", () => {
			render(<OtpInput length={6} autoFocus ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(document.activeElement).toBe(inputs[0]);
		});

		it("does not auto-focus when autoFocus is false", () => {
			render(<OtpInput length={6} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(document.activeElement).not.toBe(inputs[0]);
		});
	});

	describe("Disabled state", () => {
		it("disables every box when disabled is true", () => {
			render(<OtpInput length={6} disabled ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			for (const input of inputs) {
				expect(input.disabled).toBe(true);
			}
		});

		it("applies disabled class to every box", () => {
			render(<OtpInput length={6} disabled ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			for (const input of inputs) {
				expect(input.className).toContain("otp_input_box_disabled");
			}
		});
	});

	describe("Controlled value updates", () => {
		it("re-renders boxes when value changes", () => {
			const { rerender } = render(<OtpInput length={6} value="123" ariaLabel="OTP" />);
			let inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(inputs[0].value).toBe("1");
			expect(inputs[3].value).toBe("");

			rerender(<OtpInput length={6} value="9876" ariaLabel="OTP" />);
			inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(inputs[0].value).toBe("9");
			expect(inputs[3].value).toBe("6");
			expect(inputs[4].value).toBe("");
		});

		it("truncates value longer than length", () => {
			render(<OtpInput length={4} value="123456789" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(inputs.length).toBe(4);
			expect(inputs[0].value).toBe("1");
			expect(inputs[3].value).toBe("4");
		});
	});

	describe("Supporting text", () => {
		it("applies error class to supporting text when error is true", () => {
			render(
				<OtpInput length={6} error supportingText="잘못된 코드입니다" ariaLabel="OTP" />,
			);
			const helper = screen.getByText("잘못된 코드입니다");
			expect(helper.className).toContain("otp_input_supporting_error");
		});

		it("does not render supporting text when not provided", () => {
			const { container } = render(<OtpInput length={6} ariaLabel="OTP" />);
			expect(container.querySelector(".otp_input_supporting")).toBeNull();
		});
	});

	describe("Class names", () => {
		it("applies custom className to root", () => {
			const { container } = render(
				<OtpInput length={6} className="custom-otp" ariaLabel="OTP" />,
			);
			expect((container.firstChild as HTMLElement).className).toContain("custom-otp");
		});

		it("applies base otp_input class to root", () => {
			const { container } = render(<OtpInput length={6} ariaLabel="OTP" />);
			expect((container.firstChild as HTMLElement).className).toContain("otp_input");
		});
	});

	describe("Non-digit handling on change", () => {
		it("rejects multi-character input", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.change(inputs[0], { target: { value: "12" } });
			expect(onChange).not.toHaveBeenCalled();
		});

		it("allows clearing a digit (empty string)", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="1" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.change(inputs[0], { target: { value: "" } });
			expect(onChange).toHaveBeenCalledWith("");
		});

		it("rejects special characters", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.change(inputs[0], { target: { value: "@" } });
			expect(onChange).not.toHaveBeenCalled();
		});
	});
});
