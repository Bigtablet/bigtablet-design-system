"use client";

import * as React from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../../utils";
import type { ImeStrategy, TextFieldSize } from "../textfield";
import "./style.scss";

export type TextareaSize = TextFieldSize;
export type TextareaResize = "none" | "vertical" | "both";

export interface TextareaProps
	extends Omit<
		React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		"size" | "onChange" | "value" | "defaultValue" | "rows"
	> {
	/** 입력 필드 크기 (기본값: "md") */
	size?: TextareaSize;
	/** 입력 필드 위에 표시할 라벨 텍스트 */
	label?: string;
	/** 라벨 표시 여부 (기본값: true) */
	showLabel?: boolean;
	/** 입력 필드 아래에 표시할 도움말 텍스트 */
	supportingText?: string;
	/** 에러 상태 여부 */
	error?: boolean;
	/** 컨테이너 전체 너비 차지 여부 */
	fullWidth?: boolean;
	/** 값 변경 시 호출되는 콜백. 호출 시점은 `imeStrategy` 에 따름 (기본: 조합 완료 후) */
	onChangeAction?: (value: string) => void;
	/**
	 * IME 조합 중 콜백 전략 (기본값: "delayed").
	 * 실시간 구독이 필요하면 "immediate" — 한글 조합 중에도 매 입력 즉시 반영.
	 */
	imeStrategy?: ImeStrategy;
	/** 제어형 입력 값 */
	value?: string;
	/** 비제어형 초기 입력 값 */
	defaultValue?: string;
	/** 입력값 변환 함수 */
	transformValue?: (value: string) => string;
	/**
	 * 고정 행 수 (기본 3). `minRows`/`maxRows` 미지정 시 고정 높이.
	 * auto-grow 를 원하면 `minRows`/`maxRows` 사용.
	 */
	rows?: number;
	/** auto-grow 최소 행 수. 지정 시 내용에 따라 높이 자동 증가 */
	minRows?: number;
	/** auto-grow 최대 행 수. 초과 시 스크롤 */
	maxRows?: number;
	/** 글자 수 카운터 표시 (maxLength 와 함께 사용 권장) */
	showCounter?: boolean;
	/** resize 핸들 제어 (기본 "vertical") */
	resize?: TextareaResize;
	/** textarea 요소 참조 */
	ref?: React.Ref<HTMLTextAreaElement>;
}

const LINE_HEIGHT_PX: Record<TextareaSize, number> = {
	sm: 20,
	md: 20,
	lg: 24,
};
// container vertical padding (위/아래 합) — size 별 input_wrap padding 과 일치
const VERTICAL_PAD_PX: Record<TextareaSize, number> = {
	sm: 16, // 8*2
	md: 16,
	lg: 24, // 12*2
};

/**
 * 멀티라인 텍스트 입력. `TextField` 와 동일한 시각/토큰 + textarea 특화 기능.
 * auto-grow (`minRows`/`maxRows`), 글자 수 카운터, resize 제어, 한글 IME 정책 지원.
 *
 * @example
 * ```tsx
 * <Textarea label="내용" minRows={3} maxRows={8} maxLength={500} showCounter
 *   onChangeAction={(v) => setContent(v)} />
 * ```
 */
export const Textarea = ({
	id,
	label,
	showLabel = true,
	supportingText,
	error,
	fullWidth,
	size = "md",
	className,
	onChangeAction,
	imeStrategy = "delayed",
	value,
	defaultValue,
	transformValue,
	rows = 3,
	minRows,
	maxRows,
	showCounter,
	resize = "vertical",
	maxLength,
	ref,
	...props
}: TextareaProps) => {
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
	const innerRef = useRef<HTMLTextAreaElement | null>(null);
	const autoGrow = minRows !== undefined || maxRows !== undefined;

	// 외부 ref + 내부 ref 병합 (auto-grow 측정용)
	const setRefs = useCallback(
		(node: HTMLTextAreaElement | null) => {
			innerRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
		},
		[ref],
	);

	useEffect(() => {
		if (!isControlled) return;
		const nextValue = value ?? "";
		setInnerValue(transformValue ? transformValue(nextValue) : nextValue);
	}, [isControlled, value, transformValue]);

	// auto-grow — 내용 변할 때마다 scrollHeight 기준 높이 재계산
	useLayoutEffect(() => {
		if (!autoGrow) return;
		const el = innerRef.current;
		if (!el) return;
		const lh = LINE_HEIGHT_PX[size];
		const pad = VERTICAL_PAD_PX[size];
		const minH = minRows ? minRows * lh + pad : 0;
		const maxH = maxRows ? maxRows * lh + pad : Number.POSITIVE_INFINITY;
		el.style.height = "auto";
		const next = Math.min(Math.max(el.scrollHeight, minH), maxH);
		el.style.height = `${next}px`;
		el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
	}, [innerValue, autoGrow, size, minRows, maxRows]);

	const rootClassName = cn(
		"textarea",
		size === "sm" && "textarea_size_sm",
		size === "lg" && "textarea_size_lg",
		fullWidth && "textarea_full_width",
		error && "textarea_error",
		props.disabled && "textarea_disabled",
		className,
	);

	const counterText =
		showCounter && maxLength !== undefined
			? `${innerValue.length}/${maxLength}`
			: showCounter
				? String(innerValue.length)
				: null;

	return (
		<div className={rootClassName}>
			{label && showLabel && (
				<label htmlFor={inputId} className="textarea_label">
					{label}
				</label>
			)}

			<div className="textarea_container">
				<div className="textarea_input_wrap">
					<textarea
						id={inputId}
						ref={setRefs}
						className="textarea_input"
						style={{ resize: autoGrow ? "none" : resize }}
						rows={autoGrow ? (minRows ?? rows) : rows}
						maxLength={maxLength}
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
							const nextValue = applyTransform(event.currentTarget.value);
							setInnerValue(nextValue);
							onChangeAction?.(nextValue);
						}}
						onChange={(event) => {
							const rawValue = event.target.value;
							if (isComposingRef.current) {
								setInnerValue(rawValue);
								if (imeStrategy === "immediate") onChangeAction?.(rawValue);
								return;
							}
							const nextValue = applyTransform(rawValue);
							setInnerValue(nextValue);
							onChangeAction?.(nextValue);
						}}
					/>
				</div>
			</div>

			{(supportingText || counterText) && (
				<div className="textarea_footer">
					{supportingText ? (
						<div id={helperId} className="textarea_helper">
							{supportingText}
						</div>
					) : (
						<span />
					)}
					{counterText && (
						<div className="textarea_counter" aria-hidden="true">
							{counterText}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

Textarea.displayName = "Textarea";
