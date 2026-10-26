import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { OtpInput } from "./index";

function ControlledOtp(props: Partial<React.ComponentProps<typeof OtpInput>>) {
	const [val, setVal] = React.useState(props.value ?? "");
	return <OtpInput length={6} {...props} value={val} onValueChange={setVal} />;
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
		expect(inputs[0]!.value).toBe("1");
		expect(inputs[5]!.value).toBe("6");
	});

	it("calls onChange when digit is entered", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.change(inputs[0]!, { target: { value: "5" } });
		expect(onChange).toHaveBeenCalledWith("5");
	});

	it("rejects non-numeric input", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.change(inputs[0]!, { target: { value: "a" } });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("handles paste", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.paste(inputs[0]!, {
			clipboardData: { getData: () => "123456" },
		});
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("distributes a multi-char value from SMS autofill (onChange with full code)", () => {
		// autocomplete="one-time-code" 자동입력은 첫 박스 onChange 로 전체 코드가 한 번에 들어옴
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.change(inputs[0]!, { target: { value: "123456" } });
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("handles paste with non-numeric characters", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.paste(inputs[0]!, {
			clipboardData: { getData: () => "12-34-56" },
		});
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("handles paste on non-first input", () => {
		const onChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		fireEvent.paste(inputs[3]!, {
			clipboardData: { getData: () => "123456" },
		});
		expect(onChange).toHaveBeenCalledWith("123456");
	});

	it("redirects focus to first empty box on focus", () => {
		render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
		fireEvent.focus(inputs[5]!);
		expect(document.activeElement).toBe(inputs[2]);
	});

	// 모든 칸이 탭 가능하면 빈 상태에서 Tab 이 redirect 에 붙잡혀 그룹을 못 빠져나간다
	it.each([
		["", 0],
		["12", 2],
		["123456", 5],
	])("keeps only one box in the tab order (value=%j → box %i)", (value, stop) => {
		render(<ControlledOtp length={6} value={value} ariaLabel="OTP" />);
		const tabIndexes = (screen.getAllByRole("textbox") as HTMLInputElement[]).map(
			(el) => el.tabIndex,
		);
		expect(tabIndexes).toEqual(tabIndexes.map((_, i) => (i === stop ? 0 : -1)));
	});

	it("renders supporting text", () => {
		render(<OtpInput length={6} supportingText="인증 코드를 입력하세요" ariaLabel="OTP" />);
		expect(screen.getByText("인증 코드를 입력하세요")).toBeDefined();
	});

	it("applies error class when error is true", () => {
		render(<OtpInput length={6} error ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox");
		expect(inputs[0]!.className).toContain("otp_input_box_error");
	});

	it("applies disabled attribute when disabled", () => {
		render(<OtpInput length={6} disabled ariaLabel="OTP" />);
		const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
		expect(inputs[0]!.disabled).toBe(true);
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
			inputs[0]!.focus();
			fireEvent.change(inputs[0]!, { target: { value: "1" } });
			expect(document.activeElement).toBe(inputs[1]);
		});

		it("does not move focus past the last box", () => {
			render(<ControlledOtp length={4} value="123" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[3]!.focus();
			fireEvent.change(inputs[3]!, { target: { value: "4" } });
			// 마지막 자리는 다음 칸으로 이동 안 함
			expect(document.activeElement).toBe(inputs[3]);
		});

		it("releases isTypingRef after timeout so focus redirect works again", () => {
			render(<ControlledOtp length={6} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0]!.focus();
			fireEvent.change(inputs[0]!, { target: { value: "1" } });
			// 타이핑 자동 이동으로 이미 2번 칸에 있다.
			expect(document.activeElement).toBe(inputs[1]);

			act(() => {
				vi.advanceTimersByTime(100);
			});

			// 뒷칸을 실제로 눌러 포커스를 옮긴 뒤에야 redirect 가 도는지 알 수 있다.
			// fireEvent.focus 만 쏘면 activeElement 는 그대로 2번 칸이라, redirect 가 죽어도
			// 단정이 통과한다(이전 판이 그랬다).
			inputs[5]!.focus();
			fireEvent.focus(inputs[5]!);
			expect(document.activeElement).toBe(inputs[1]);
		});
	});

	describe("Backspace handling", () => {
		it("clears current digit when current box has a value", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="123" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.keyDown(inputs[2]!, { key: "Backspace" });
			expect(onChange).toHaveBeenCalledWith("12");
		});

		it("moves to previous box and clears it when current is empty", () => {
			// ControlledOtp 는 onChange 를 자기 setState 로 덮어 spy 가 불리지 않는다 - 직접 렌더한다
			const onChange = vi.fn();
			render(<OtpInput length={6} value="12" ariaLabel="OTP" onValueChange={onChange} />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2]!.focus();
			fireEvent.keyDown(inputs[2]!, { key: "Backspace" });
			expect(document.activeElement).toBe(inputs[1]);
			expect(onChange).toHaveBeenCalledWith("1");
		});

		it("does nothing meaningful at index 0 with empty value", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.keyDown(inputs[0]!, { key: "Backspace" });
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe("Arrow key navigation", () => {
		// 빈 값이면 onFocus 가 첫 빈 칸으로 되돌리므로, 이동을 보려면 칸을 채워 둔다
		it("moves focus to previous box on ArrowLeft", () => {
			render(<OtpInput length={6} value="123456" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[3]!.focus();
			fireEvent.keyDown(inputs[3]!, { key: "ArrowLeft" });
			expect(document.activeElement).toBe(inputs[2]);
		});

		it("does not move focus past index 0 on ArrowLeft", () => {
			render(<OtpInput length={6} value="" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0]!.focus();
			fireEvent.keyDown(inputs[0]!, { key: "ArrowLeft" });
			expect(document.activeElement).toBe(inputs[0]);
		});

		it("moves focus to next box on ArrowRight", () => {
			render(<OtpInput length={6} value="123456" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2]!.focus();
			fireEvent.keyDown(inputs[2]!, { key: "ArrowRight" });
			expect(document.activeElement).toBe(inputs[3]);
		});

		it("does not move focus past the last box on ArrowRight", () => {
			render(<OtpInput length={6} value="123456" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[5]!.focus();
			fireEvent.keyDown(inputs[5]!, { key: "ArrowRight" });
			expect(document.activeElement).toBe(inputs[5]);
		});

		it("ignores unrelated keys", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="123456" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2]!.focus();
			fireEvent.keyDown(inputs[2]!, { key: "Tab" });
			expect(document.activeElement).toBe(inputs[2]);
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe("Paste behavior", () => {
		it("ignores paste with no digits", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.paste(inputs[0]!, {
				clipboardData: { getData: () => "abc-xyz" },
			});
			expect(onChange).not.toHaveBeenCalled();
		});

		it("truncates paste data to length", () => {
			const onChange = vi.fn();
			render(<OtpInput length={4} value="" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.paste(inputs[0]!, {
				clipboardData: { getData: () => "12345678" },
			});
			expect(onChange).toHaveBeenCalledWith("1234");
		});

		// 부분 붙여넣기 뒤 포커스는 아래 "focuses after the pasted digits" 가 본다.
		// ControlledOtp 는 focus 시점에 아직 빈 값이라 onFocus 가 첫 칸으로 되돌린다 - 칸을 채워 둔다.
		it("focuses last box after pasting exactly length digits", () => {
			render(<OtpInput length={6} value="999999" ariaLabel="OTP" onValueChange={vi.fn()} />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.paste(inputs[0]!, {
				clipboardData: { getData: () => "123456" },
			});
			expect(document.activeElement).toBe(inputs[5]);
		});
	});

	describe("Focus redirect to first empty box", () => {
		it("redirects to first empty box when user clicks a later box", () => {
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			fireEvent.focus(inputs[4]!);
			expect(document.activeElement).toBe(inputs[2]);
		});

		it("does not redirect when focusing the first empty box itself", () => {
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[2]!.focus();
			fireEvent.focus(inputs[2]!);
			expect(document.activeElement).toBe(inputs[2]);
		});

		it("does not redirect when all boxes are filled", () => {
			render(<ControlledOtp length={6} value="123456" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[3]!.focus();
			fireEvent.focus(inputs[3]!);
			expect(document.activeElement).toBe(inputs[3]);
		});

		it("does not redirect when focusing a box before the first empty one", () => {
			render(<ControlledOtp length={6} value="12" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			inputs[0]!.focus();
			fireEvent.focus(inputs[0]!);
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
			expect(inputs[0]!.value).toBe("1");
			expect(inputs[3]!.value).toBe("");

			rerender(<OtpInput length={6} value="9876" ariaLabel="OTP" />);
			inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(inputs[0]!.value).toBe("9");
			expect(inputs[3]!.value).toBe("6");
			expect(inputs[4]!.value).toBe("");
		});

		it("truncates value longer than length", () => {
			render(<OtpInput length={4} value="123456789" ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
			expect(inputs.length).toBe(4);
			expect(inputs[0]!.value).toBe("1");
			expect(inputs[3]!.value).toBe("4");
		});
	});

	describe("Supporting text", () => {
		it("applies error class to supporting text when error is true", () => {
			render(<OtpInput length={6} error supportingText="잘못된 코드입니다" ariaLabel="OTP" />);
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
			const { container } = render(<OtpInput length={6} className="custom-otp" ariaLabel="OTP" />);
			expect((container.firstChild as HTMLElement).className).toContain("custom-otp");
		});

		it("applies base otp_input class to root", () => {
			const { container } = render(<OtpInput length={6} ariaLabel="OTP" />);
			expect((container.firstChild as HTMLElement).className).toContain("otp_input");
		});
	});

	describe("Non-digit handling on change", () => {
		it("distributes multi-character input across boxes (SMS autofill)", () => {
			// 이전엔 멀티문자를 거부했으나, SMS 자동입력이 첫 박스에 전체 코드를 넣으므로
			// handlePaste 처럼 각 자리에 분배하도록 변경됨.
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.change(inputs[0]!, { target: { value: "12" } });
			expect(onChange).toHaveBeenCalledWith("12");
		});

		it("allows clearing a digit (empty string)", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="1" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.change(inputs[0]!, { target: { value: "" } });
			expect(onChange).toHaveBeenCalledWith("");
		});

		it("rejects special characters", () => {
			const onChange = vi.fn();
			render(<OtpInput length={6} value="" onValueChange={onChange} ariaLabel="OTP" />);
			const inputs = screen.getAllByRole("textbox");
			fireEvent.change(inputs[0]!, { target: { value: "@" } });
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	it("calls onValueChange (canonical) when digit entered", () => {
		const onValueChange = vi.fn();
		render(<OtpInput length={6} value="" onValueChange={onValueChange} ariaLabel="OTP" />);
		fireEvent.change(screen.getAllByRole("textbox")[0]!, { target: { value: "5" } });
		expect(onValueChange).toHaveBeenCalledWith("5");
	});

	it("marks every digit required from a surrounding Field", () => {
		// role="group" 은 aria-required 를 허용하지 않는다(axe aria-allowed-attr). 한 자리만
		// 비어도 코드가 완성되지 않으므로 자리마다 붙인다.
		render(
			<Field name="code" label="인증번호" required>
				<OtpInput length={4} />
			</Field>,
		);

		const inputs = screen.getAllByRole("textbox");
		expect(inputs).toHaveLength(4);
		for (const input of inputs) {
			expect(input).toHaveAttribute("aria-required", "true");
		}
		expect(screen.getByRole("group")).not.toHaveAttribute("aria-required");
	});

	// ── 뮤테이션 테스트(`pnpm test:mutation`)에서 살아남은 분기 ──────────────────────

	const boxes = () => screen.getAllByRole("textbox") as HTMLInputElement[];

	it("prevents the default action of Backspace and the arrows, but not of other keys", () => {
		render(<OtpInput length={6} value="123456" ariaLabel="OTP" onValueChange={vi.fn()} />);
		boxes()[2]!.focus();
		expect(fireEvent.keyDown(boxes()[2]!, { key: "ArrowLeft" })).toBe(false);
		expect(fireEvent.keyDown(boxes()[1]!, { key: "ArrowRight" })).toBe(false);
		expect(fireEvent.keyDown(boxes()[2]!, { key: "Backspace" })).toBe(false);
		expect(fireEvent.keyDown(boxes()[2]!, { key: "Tab" })).toBe(true);
		expect(fireEvent.keyDown(boxes()[0]!, { key: "ArrowLeft" })).toBe(true);
		expect(fireEvent.keyDown(boxes()[5]!, { key: "ArrowRight" })).toBe(true);
	});

	it("ignores multi-character input outside the first box and malformed single values", () => {
		const onValueChange = vi.fn();
		render(<OtpInput length={6} value="" ariaLabel="OTP" onValueChange={onValueChange} />);
		fireEvent.change(boxes()[2]!, { target: { value: "123" } });
		fireEvent.change(boxes()[1]!, { target: { value: "a1" } });
		fireEvent.change(boxes()[1]!, { target: { value: "1a" } });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("ignores autofill without digits, truncates long autofill and focuses after the filled part", () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<OtpInput length={6} value="" ariaLabel="OTP" onValueChange={onValueChange} />,
		);
		fireEvent.change(boxes()[0]!, { target: { value: "ab" } });
		expect(onValueChange).not.toHaveBeenCalled();

		fireEvent.change(boxes()[0]!, { target: { value: "12345678" } });
		expect(onValueChange).toHaveBeenLastCalledWith("123456");

		// 칸이 차 있어야 onFocus 가 첫 빈 칸으로 되돌리지 않는다
		rerender(<OtpInput length={6} value="999999" ariaLabel="OTP" onValueChange={onValueChange} />);
		fireEvent.change(boxes()[0]!, { target: { value: "123" } });
		expect(document.activeElement).toBe(boxes()[3]);
	});

	it("focuses after the pasted digits and blocks the native paste", () => {
		render(<OtpInput length={6} value="999999" ariaLabel="OTP" onValueChange={vi.fn()} />);
		const notPrevented = fireEvent.paste(boxes()[0]!, {
			clipboardData: { getData: () => "123" },
		});
		expect(notPrevented).toBe(false);
		expect(document.activeElement).toBe(boxes()[3]);
	});

	it("keeps focus when a digit is cleared", () => {
		render(<OtpInput length={6} value="123456" ariaLabel="OTP" onValueChange={vi.fn()} />);
		boxes()[2]!.focus();
		fireEvent.change(boxes()[2]!, { target: { value: "" } });
		expect(document.activeElement).toBe(boxes()[2]);
	});

	it("works without any change handler", () => {
		render(<OtpInput length={6} value="" ariaLabel="OTP" />);
		expect(() => {
			fireEvent.change(boxes()[0]!, { target: { value: "1" } });
			fireEvent.paste(boxes()[0]!, { clipboardData: { getData: () => "123" } });
		}).not.toThrow();
	});

	it("labels each box by position and offers OTP autofill on the first only", () => {
		render(<OtpInput length={4} value="" />);
		expect(boxes().map((b) => b.getAttribute("aria-label"))).toEqual([
			"1번째 자리",
			"2번째 자리",
			"3번째 자리",
			"4번째 자리",
		]);
		expect(boxes().map((b) => b.getAttribute("autocomplete"))).toEqual([
			"one-time-code",
			"off",
			"off",
			"off",
		]);
	});

	it("marks invalid from error or an invalid Field, and links the supporting text", () => {
		const { rerender, container } = render(<OtpInput length={4} value="" />);
		expect(boxes()[0]).not.toHaveAttribute("aria-invalid");
		expect(boxes()[0]).not.toHaveAttribute("aria-required");
		expect(boxes()[0]).not.toHaveAttribute("aria-describedby");

		rerender(<OtpInput length={4} value="" error supportingText="코드가 틀렸어요" />);
		expect(boxes()[0]).toHaveAttribute("aria-invalid", "true");
		const supportingId = container.querySelector(".otp_input_supporting")?.id;
		expect(boxes()[0]).toHaveAttribute("aria-describedby", supportingId);

		rerender(
			<Field name="otp" label="인증 코드" error="필수" help="문자로 받은 코드">
				<OtpInput length={4} value="" supportingText="도움말" />
			</Field>,
		);
		expect(boxes()[0]).toHaveAttribute("aria-invalid", "true");
		expect(boxes()[0]?.getAttribute("aria-describedby")?.split(" ").length).toBe(2);
	});
});
