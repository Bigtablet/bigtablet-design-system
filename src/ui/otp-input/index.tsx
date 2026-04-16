"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface OtpInputProps {
	/** OTP 자릿수 (기본값: 6) */
	length?: 4 | 6;
	/** 제어형 값 */
	value?: string;
	/** 값 변경 콜백 */
	onChange?: (value: string) => void;
	/** 에러 상태 */
	error?: boolean;
	/** 비활성화 */
	disabled?: boolean;
	/** 하단 도움말 텍스트 */
	supportingText?: string;
	/** 첫 번째 입력에 자동 포커스 */
	autoFocus?: boolean;
	/** 접근성 레이블 */
	ariaLabel?: string;
	/** 추가 className */
	className?: string;
}

/**
 * OTP 입력 컴포넌트를 렌더링한다.
 * 각 자리를 개별 입력으로 분리하고, 자동 포커스 이동·붙여넣기를 지원한다.
 * @param props OTP 입력 속성
 * @returns 렌더링된 OTP 입력 요소
 */
export const OtpInput = ({
	length = 6,
	value = "",
	onChange,
	error = false,
	disabled = false,
	supportingText,
	autoFocus = false,
	ariaLabel = "OTP 입력",
	className,
}: OtpInputProps) => {
	const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

	const digits = React.useMemo(() => {
		const arr = value.split("").slice(0, length);
		while (arr.length < length) arr.push("");
		return arr;
	}, [value, length]);

	const focusInput = (index: number) => {
		inputsRef.current[index]?.focus();
	};

	const updateValue = (newDigits: string[]) => {
		onChange?.(newDigits.join(""));
	};

	const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		if (val && !/^\d$/.test(val)) return;

		const newDigits = [...digits];
		newDigits[index] = val;
		updateValue(newDigits);

		if (val && index < length - 1) {
			focusInput(index + 1);
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace") {
			if (digits[index]) {
				const newDigits = [...digits];
				newDigits[index] = "";
				updateValue(newDigits);
			} else if (index > 0) {
				focusInput(index - 1);
				const newDigits = [...digits];
				newDigits[index - 1] = "";
				updateValue(newDigits);
			}
			e.preventDefault();
		}

		if (e.key === "ArrowLeft" && index > 0) {
			focusInput(index - 1);
			e.preventDefault();
		}
		if (e.key === "ArrowRight" && index < length - 1) {
			focusInput(index + 1);
			e.preventDefault();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
		if (!pasted) return;

		const newDigits = [...digits];
		for (let i = 0; i < pasted.length; i++) {
			newDigits[i] = pasted[i];
		}
		updateValue(newDigits);

		const nextIndex = Math.min(pasted.length, length - 1);
		focusInput(nextIndex);
	};

	const rootClassName = cn("otp_input", className);

	return (
		<div className={rootClassName} role="group" aria-label={ariaLabel}>
			<div className="otp_input_boxes">
				{digits.map((digit, i) => (
					<input
						key={i}
						ref={(el) => { inputsRef.current[i] = el; }}
						type="text"
						inputMode="numeric"
						pattern="\d*"
						maxLength={1}
						value={digit}
						onChange={(e) => handleChange(i, e)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						onPaste={i === 0 ? handlePaste : undefined}
						disabled={disabled}
						autoFocus={autoFocus && i === 0}
						aria-label={`${i + 1}번째 자리`}
						className={cn(
							"otp_input_box",
							error && "otp_input_box_error",
							disabled && "otp_input_box_disabled",
						)}
					/>
				))}
			</div>
			{supportingText && (
				<span className={cn("otp_input_supporting", error && "otp_input_supporting_error")}>
					{supportingText}
				</span>
			)}
		</div>
	);
};

OtpInput.displayName = "OtpInput";
