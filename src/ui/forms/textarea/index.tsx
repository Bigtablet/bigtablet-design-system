"use client";

import * as React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { cn, useSafeLayoutEffect } from "../../../utils";
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
	 * 실시간 구독이 필요하면 "immediate" - 한글 조합 중에도 매 입력 즉시 반영.
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
	// 마지막으로 onChangeAction 에 방출한 값 - 중복 호출(특히 IME 종료 직후) 차단용.
	const lastEmittedValueRef = useRef(innerValue);
	const autoGrow = minRows !== undefined || maxRows !== undefined;

	// Controlled value 동기화 - useEffect 대신 "렌더 중 상태 조정"(React 공식 derived state).
	// paint 전 즉시 반영해 flicker 방지.
	// 조합 중에는 prevValue 까지 함께 보류 - 안 그러면 조합 중 value 변경 시 prevValue 만 갱신돼
	// 조합 종료 후 value===prevValue 가 되어 외부 value 가 영영 반영되지 않는 버그 발생.
	const [prevValue, setPrevValue] = useState(value);
	if (isControlled && value !== prevValue && !isComposingRef.current) {
		setPrevValue(value);
		const nextValue = applyTransform(value ?? "");
		setInnerValue(nextValue);
		lastEmittedValueRef.current = nextValue;
	}

	// 외부 ref + 내부 ref 병합 (auto-grow 측정용)
	const setRefs = useCallback(
		(node: HTMLTextAreaElement | null) => {
			innerRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
		},
		[ref],
	);

	// auto-grow - 내용 변할 때마다 scrollHeight 기준 높이 재계산.
	// textarea 자체엔 padding 없음 (wrapper 가 padding 담당) → scrollHeight 는 순수 콘텐츠 높이.
	// minH/maxH 도 padding 없이 line 높이만 - 안 그러면 wrapper padding 과 이중 적용됨.
	// useSafeLayoutEffect - SSR 경고 방지 (서버에선 useEffect fallback).
	useSafeLayoutEffect(() => {
		if (!autoGrow) return;
		const el = innerRef.current;
		if (!el) return;
		const lh = LINE_HEIGHT_PX[size];
		const minH = minRows ? minRows * lh : 0;
		const maxH = maxRows ? maxRows * lh : Number.POSITIVE_INFINITY;
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

	// 비조합(non-composition) 입력 또는 조합 종료 시 공통 - 중복 방출 차단 후 방출.
	const emit = (nextValue: string) => {
		setInnerValue(nextValue);
		if (nextValue !== lastEmittedValueRef.current) {
			lastEmittedValueRef.current = nextValue;
			onChangeAction?.(nextValue);
		}
	};

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
							// 조합 종료 직후 onChange 가 한 번 더 트리거되는 브라우저 대응 - emit 가 중복 차단.
							emit(applyTransform(event.currentTarget.value));
						}}
						onChange={(event) => {
							const rawValue = event.target.value;
							if (isComposingRef.current) {
								// 조합 중 - transform 보류(조합 깨짐 방지), raw 표시.
								setInnerValue(rawValue);
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
