"use client";

import { X } from "lucide-react";
import * as React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type TextFieldSize = "sm" | "md" | "lg";

/**
 * IME 조합(한글/일본어/중국어) 중 외부 콜백 처리 전략.
 * - `delayed`: 조합 완료 후에만 `onChangeAction` 호출 (기본 — 폼 제출/검증용).
 * - `immediate`: 조합 중에도 매 입력마다 즉시 호출 (실시간 검색/필터/미리보기용).
 */
export type ImeStrategy = "delayed" | "immediate";

export interface TextFieldProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"size" | "onChange" | "value" | "defaultValue"
	> {
	/** 입력 필드 크기 (기본값: "md") */
	size?: TextFieldSize;
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
	/** 값이 있을 때 오른쪽에 지우기(X) 버튼 표시 여부 */
	clearable?: boolean;
	/** 컨테이너 전체 너비 차지 여부 */
	fullWidth?: boolean;
	/** 값 변경 시 호출되는 콜백. 호출 시점은 `imeStrategy` 에 따름 (기본: 조합 완료 후) */
	onChangeAction?: (value: string) => void;
	/**
	 * IME 조합 중 콜백 전략 (기본값: "delayed").
	 * 실시간 구독(검색/필터) 이 필요하면 "immediate" — 한글 조합 중에도 매 입력 즉시 반영.
	 */
	imeStrategy?: ImeStrategy;
	/** 제어형 입력 값 */
	value?: string;
	/** 비제어형 초기 입력 값 */
	defaultValue?: string;
	/** 입력값 변환 함수 (예: 숫자만 허용, 대문자 변환) */
	transformValue?: (value: string) => string;
	/** 입력 요소 참조 */
	ref?: React.Ref<HTMLInputElement>;
}

// X 아이콘 — lucide-react
const ClearIcon = () => <X size={20} aria-hidden="true" />;

/**
 * 텍스트 필드를 렌더링한다.
 * Figma DS 기준 outlined 스타일 + floating label을 지원한다.
 * fieldset + legend 구조로 배경색 없이 border notch를 자연스럽게 처리한다.
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
	clearable,
	fullWidth,
	size = "md",
	className,
	onChangeAction,
	imeStrategy = "delayed",
	value,
	defaultValue,
	transformValue,
	ref,
	...props
}: TextFieldProps) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const helperId = supportingText ? `${inputId}-help` : undefined;

	const isControlled = value !== undefined;
	const applyTransform = (nextValue: string) =>
		transformValue ? transformValue(nextValue) : nextValue;

	const [innerValue, setInnerValue] = useState(() =>
		applyTransform(value ?? defaultValue ?? ""),
	);

	const isComposingRef = useRef(false);
	// 마지막으로 onChangeAction 에 방출한 값 — 중복 호출(특히 IME 종료 직후) 차단용.
	const lastEmittedValueRef = useRef(innerValue);

	// Controlled value 동기화 — useEffect 대신 "렌더 중 상태 조정"(React 공식 derived state).
	// paint 전 즉시 반영해 flicker 방지.
	// 조합 중에는 prevValue 까지 함께 보류 — 안 그러면 조합 중 value 변경 시 prevValue 만 갱신돼
	// 조합 종료 후 value===prevValue 가 되어 외부 value 가 영영 반영되지 않는 버그 발생.
	const [prevValue, setPrevValue] = useState(value);
	if (isControlled && value !== prevValue && !isComposingRef.current) {
		setPrevValue(value);
		const nextValue = applyTransform(value ?? "");
		setInnerValue(nextValue);
		lastEmittedValueRef.current = nextValue;
	}

	// 비조합 입력 / 조합 종료 / clear 공통 — 중복 방출 차단 후 방출.
	const emit = useCallback(
		(nextValue: string) => {
			setInnerValue(nextValue);
			if (nextValue !== lastEmittedValueRef.current) {
				lastEmittedValueRef.current = nextValue;
				onChangeAction?.(nextValue);
			}
		},
		[onChangeAction],
	);

	const handleClear = useCallback(() => {
		emit("");
	}, [emit]);

	const rootClassName = cn(
		"text_field",
		size === "sm" && "text_field_size_sm",
		size === "lg" && "text_field_size_lg",
		fullWidth && "text_field_full_width",
		error && "text_field_error",
		props.disabled && "text_field_disabled",
		className,
	);

	// clearable이 켜져 있고 값이 있으면 X 버튼, 없으면 trailingIcon
	const resolvedTrailing =
		clearable && innerValue ? (
			<button type="button" className="text_field_clear" onClick={handleClear} aria-label="Clear">
				<ClearIcon />
			</button>
		) : trailingIcon ? (
			<span className="text_field_icon" aria-hidden="true">
				{trailingIcon}
			</span>
		) : null;

	return (
		<div className={rootClassName}>
			{label && showLabel && (
				<label htmlFor={inputId} className="text_field_label">
					{label}
				</label>
			)}

			<div className="text_field_container">
				<div className="text_field_inner">
					{leadingIcon && (
						<span className="text_field_icon" aria-hidden="true">
							{leadingIcon}
						</span>
					)}

					<div
						className={cn(
							"text_field_input_wrap",
							resolvedTrailing && "text_field_input_wrap_no_pad_right",
						)}
					>
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
								// 조합 종료 직후 onChange 가 한 번 더 트리거되는 브라우저 대응 — emit 가 중복 차단.
								emit(applyTransform(event.currentTarget.value));
							}}
							onChange={(event) => {
								const rawValue = event.target.value;
								// 조합 중 — transform 은 조합 깨짐 방지 위해 보류, raw 로 표시.
								if (isComposingRef.current) {
									setInnerValue(rawValue);
									// immediate: 조합 중에도 외부 구독 즉시 반영 (raw value).
									if (imeStrategy === "immediate" && rawValue !== lastEmittedValueRef.current) {
										lastEmittedValueRef.current = rawValue;
										onChangeAction?.(rawValue);
									}
									return;
								}
								emit(applyTransform(rawValue));
							}}
						/>
					</div>

					{resolvedTrailing}
				</div>
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
