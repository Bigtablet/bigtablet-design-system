"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface OtpInputProps {
	/** OTP 자릿수 (기본값: 6) */
	length?: 4 | 6;
	/** 제어형 값 */
	value?: string;
	/** 값 변경 콜백 (canonical) */
	onValueChange?: (value: string) => void;
	/** @deprecated `onValueChange` 를 사용하세요. */
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
	onValueChange,
	onChange,
	error = false,
	disabled = false,
	supportingText,
	autoFocus = false,
	ariaLabel = "OTP 입력",
	className,
}: OtpInputProps) => {
	const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
	// typing 직후 next box로 이동할 때 onFocus의 redirect 로직 잠시 비활성
	const isTypingRef = React.useRef(false);

	React.useEffect(() => {
		if (autoFocus) inputsRef.current[0]?.focus();
	}, [autoFocus]);

	const digits = React.useMemo(() => {
		const chars = value.split("").slice(0, length);
		while (chars.length < length) chars.push("");
		return chars;
	}, [value, length]);

	const focusInput = (index: number) => {
		inputsRef.current[index]?.focus();
	};

	const updateValue = (newDigits: string[]) => {
		(onValueChange ?? onChange)?.(newDigits.join(""));
	};

	const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
		const nextDigit = e.target.value;

		// SMS/키체인 자동입력(autocomplete="one-time-code")은 첫 박스의 onChange 로 전체 코드가
		// 한 번에 들어온다. 단일 숫자 정규식에 걸려 무시되지 않도록 handlePaste 처럼 각 자리에 분배.
		// index 0 에서만 처리 - 분배가 항상 0번부터 채우므로, 다른 박스에서 멀티문자 change 가
		// 발생해도(브라우저별 자동완성 차이 등) 기존 자릿수를 밀지 않도록 트리거 위치를 명시 가드.
		if (index === 0 && nextDigit.length > 1) {
			const filled = nextDigit.replace(/\D/g, "").slice(0, length);
			if (!filled) return;
			const newDigits = [...digits];
			for (let i = 0; i < filled.length; i++) newDigits[i] = filled[i];
			updateValue(newDigits);
			focusInput(Math.min(filled.length, length - 1));
			return;
		}

		if (nextDigit && !/^\d$/.test(nextDigit)) return;

		const newDigits = [...digits];
		newDigits[index] = nextDigit;
		updateValue(newDigits);

		if (nextDigit && index < length - 1) {
			// typing 후 next 칸 이동 - onFocus의 redirect 로직 잠시 비활성
			isTypingRef.current = true;
			focusInput(index + 1);
			// 부모의 controlled value 업데이트 + onFocus 사이클 완료 후 해제
			setTimeout(() => {
				isTypingRef.current = false;
			}, 50);
		}
	};

	const handleFocus = (index: number) => {
		// typing 자동 이동 중엔 redirect 안 함
		if (isTypingRef.current) return;
		const firstEmpty = digits.indexOf("");
		if (firstEmpty !== -1 && firstEmpty < index) {
			focusInput(firstEmpty);
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
	const supportingId = React.useId();

	return (
		// biome-ignore lint/a11y/useSemanticElements: <fieldset> would force border/legend styles; role=group is the WAI-ARIA equivalent for OTP grouping
		<div className={rootClassName} role="group" aria-label={ariaLabel}>
			<div className="otp_input_boxes">
				{digits.map((digit, i) => (
					<input
						// biome-ignore lint/suspicious/noArrayIndexKey: OTP slots are position-bound; index is the stable identity
						key={i}
						ref={(el) => {
							inputsRef.current[i] = el;
						}}
						type="text"
						inputMode="numeric"
						pattern="\d*"
						maxLength={1}
						// SMS/키체인의 OTP 자동입력 - 첫 입력에만 지정 (paste 핸들러가 전 자리 분배)
						autoComplete={i === 0 ? "one-time-code" : "off"}
						value={digit}
						onChange={(e) => handleChange(i, e)}
						onFocus={() => handleFocus(i)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						onPaste={handlePaste}
						disabled={disabled}
						aria-label={`${i + 1}번째 자리`}
						// error/supportingText 를 AT 에 전달 (시각 전용이던 문제 수정)
						aria-invalid={error || undefined}
						aria-describedby={supportingText ? supportingId : undefined}
						className={cn(
							"otp_input_box",
							error && "otp_input_box_error",
							disabled && "otp_input_box_disabled",
						)}
					/>
				))}
			</div>
			{supportingText && (
				<span
					id={supportingId}
					className={cn("otp_input_supporting", error && "otp_input_supporting_error")}
				>
					{supportingText}
				</span>
			)}
		</div>
	);
};

OtpInput.displayName = "OtpInput";
