"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface TextFieldProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"size" | "onChange" | "value" | "defaultValue"
	> {
	/** 입력 필드 위에 표시할 라벨 텍스트 */
	label?: string;
	/** 라벨 표시 여부 (기본값: true) */
	showLabel?: boolean;
	/** 입력 필드 아래에 표시할 도움말 텍스트 */
	supportingText?: string;
	/** 에러 상태 여부 */
	error?: boolean;
	/** 입력 필드 왼쪽에 표시할 아이콘 */
	leadingIcon?: React.ReactNode;
	/** 입력 필드 오른쪽에 표시할 아이콘 */
	trailingIcon?: React.ReactNode;
	/** 컨테이너 전체 너비 차지 여부 */
	fullWidth?: boolean;
	/** 값 변경 시 호출되는 콜백 (IME 조합 완료 후 실행) */
	onChangeAction?: (value: string) => void;
	/** 제어형 입력 값 */
	value?: string;
	/** 비제어형 초기 입력 값 */
	defaultValue?: string;
	/** 입력값 변환 함수 (예: 숫자만 허용, 대문자 변환) */
	transformValue?: (value: string) => string;
	/** 입력 요소 참조 */
	ref?: React.Ref<HTMLInputElement>;
}

/**
 * 텍스트 필드를 렌더링한다.
 * Figma DS 기준 outlined 스타일 + floating label을 지원한다.
 * @param props 텍스트 필드 속성
 * @returns 렌더링된 텍스트 필드 UI
 */
export const TextField = ({
	id,
	label,
	showLabel = true,
	supportingText,
	error,
	leadingIcon,
	trailingIcon,
	fullWidth,
	className,
	onChangeAction,
	value,
	defaultValue,
	transformValue,
	ref,
	...props
}: TextFieldProps) => {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const helperId = supportingText ? `${inputId}-help` : undefined;

	const isControlled = value !== undefined;
	const applyTransform = (nextValue: string) =>
		transformValue ? transformValue(nextValue) : nextValue;

	const [innerValue, setInnerValue] = React.useState(() =>
		applyTransform(value ?? defaultValue ?? ""),
	);

	const isComposingRef = React.useRef(false);

	React.useEffect(() => {
		if (!isControlled) return;
		const nextValue = value ?? "";
		setInnerValue(transformValue ? transformValue(nextValue) : nextValue);
	}, [isControlled, value, transformValue]);

	const rootClassName = cn(
		"text_field",
		fullWidth && "text_field_full_width",
		error && "text_field_error",
		props.disabled && "text_field_disabled",
		className,
	);

	return (
		<div className={rootClassName}>
			<div className="text_field_container">
				{leadingIcon && (
					<span className="text_field_icon" aria-hidden="true">
						{leadingIcon}
					</span>
				)}

				<div className="text_field_input_wrap">
					<input
						id={inputId}
						ref={ref}
						className="text_field_input"
						aria-invalid={!!error}
						aria-describedby={helperId}
						aria-label={!showLabel ? label : undefined}
						{...props}
						value={innerValue}
						onCompositionStart={() => {
							isComposingRef.current = true;
						}}
						onCompositionEnd={(event) => {
							isComposingRef.current = false;
							const rawValue = event.currentTarget.value;
							const nextValue = applyTransform(rawValue);
							setInnerValue(nextValue);
							onChangeAction?.(nextValue);
						}}
						onChange={(event) => {
							const rawValue = event.target.value;
							if (isComposingRef.current) {
								setInnerValue(rawValue);
								return;
							}
							const nextValue = applyTransform(rawValue);
							setInnerValue(nextValue);
							onChangeAction?.(nextValue);
						}}
					/>
				</div>

				{trailingIcon && (
					<span className="text_field_icon" aria-hidden="true">
						{trailingIcon}
					</span>
				)}

				{label && showLabel && (
					<label className="text_field_label" htmlFor={inputId}>
						{label}
					</label>
				)}
			</div>

			{supportingText && (
				<div id={helperId} className="text_field_helper">
					{supportingText}
				</div>
			)}
		</div>
	);
};

TextField.displayName = "TextField";
