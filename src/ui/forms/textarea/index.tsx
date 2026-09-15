"use client";

import type * as React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { cn, useSafeLayoutEffect } from "../../../utils";
import { useFieldControl } from "../field";
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
	/** 값 변경 콜백 (canonical). 호출 시점은 `imeStrategy` 에 따름 (기본: 조합 완료 후) */
	onValueChange?: (value: string) => void;
	/** @deprecated `onValueChange` 를 사용하세요. (Next 서버액션 전달용으로 `Action` 접미사가 필요하면 그대로 사용 가능) */
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
	/**
	 * 입력 영역 위, **테두리 안쪽**에 붙는 슬롯. 서식 툴바처럼 입력과 한 박스로 보여야 하는
	 * 컨트롤을 넣는다. 컨테이너가 품으므로 `:focus-within` 테두리가 툴바까지 감싸고, 모서리와
	 * 구분선을 DS 가 처리한다. 미지정 시 DOM·스타일이 이전과 동일하다.
	 */
	toolbar?: React.ReactNode;
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
	onValueChange,
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
	toolbar,
	maxLength,
	ref,
	...props
}: TextareaProps) => {
	const generatedId = useId();
	// Field 안에서는 Field 가 id·설명 연결·에러를 소유한다. 밖에서는 undefined 라 기존 동작 그대로.
	const field = useFieldControl();
	// Field 안에서는 Field 의 id 가 이긴다 - TextField 와 같은 계약.
	const inputId = field?.inputId ?? id ?? generatedId;
	// 자체 도움말 id 는 **자기 useId** 에서 만든다. `inputId` 는 Field 안에서 Field 가 준 값이라
	// `${inputId}-help` 로 만들면 Field 의 도움말 id 와 **글자까지 같아진다** - 한 문서에 같은
	// id 가 둘이 되고 aria-describedby 가 둘 다 같은 요소로 풀린다.
	const helperId = supportingText ? `${generatedId}-help` : undefined;
	// 둘 다 있으면 **둘 다** 가리킨다. Field 의 도움말·에러만 가리키면 입력이 화면에 그린
	// supportingText 를 스크린리더 사용자가 못 듣는다 - 눈으로 보이는 제약이 귀로는 안 온다.
	const describedBy =
		[field?.describedBy, helperId, props["aria-describedby"]].filter(Boolean).join(" ") ||
		undefined;

	const isControlled = value !== undefined;
	const applyTransform = (nextValue: string) =>
		transformValue ? transformValue(nextValue) : nextValue;

	const [innerValue, setInnerValue] = useState(() => applyTransform(value ?? defaultValue ?? ""));

	const isComposingRef = useRef(false);
	const innerRef = useRef<HTMLTextAreaElement | null>(null);
	// 마지막으로 onChangeAction 에 방출한 값 - 중복 호출(특히 IME 종료 직후) 차단용.
	const lastEmittedValueRef = useRef(innerValue);
	const autoGrow = minRows !== undefined || maxRows !== undefined;

	// Controlled value 동기화 - useEffect 대신 "렌더 중 상태 조정"(React 공식 derived state).
	// paint 전 즉시 반영해 flicker 방지.
	// 비교 대상은 **현재 화면 값(innerValue)** 이다. 예전처럼 "value 가 직전 value 와 달라졌는가"
	// 로 보면, 부모가 입력을 **거절**했을 때(길이 제한·검증 실패로 setState 를 안 하는 경우)
	// value 가 그대로라 아무도 화면을 되돌리지 않는다. 화면엔 거절된 글자가 남고 부모 상태는
	// 예전 값이라 둘이 영영 갈린다. 내부 버퍼는 조합(IME)을 살리기 위한 것이지 controlled 계약을
	// 느슨하게 하려는 것이 아니다 - 조합 중이 아니면 화면은 언제나 value 를 따른다.
	const nextControlledValue = applyTransform(value ?? "");
	if (isControlled && !isComposingRef.current && nextControlledValue !== innerValue) {
		setInnerValue(nextControlledValue);
		// 되돌린 값을 "마지막으로 방출한 값" 으로도 기록한다. 안 하면 사용자가 같은 글자를 다시
		// 쳤을 때 중복 방출 가드에 걸려 콜백이 아예 불리지 않는다.
		lastEmittedValueRef.current = nextControlledValue;
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
			(onValueChange ?? onChangeAction)?.(nextValue);
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
				{/* 비활성 필드의 툴바는 상호작용도 막는다 - `_disabled` 스타일은 컨테이너 자식에
				    opacity 만 걸고 pointer-events 는 건드리지 않아(TextField 와 동일), 없으면
				    비활성 상태에서도 툴바 버튼이 포커스·클릭된다. `toolbar` 는 임의 ReactNode 라
				    개별 컨트롤에 disabled 를 주입할 수 없으므로 서브트리를 inert 로 막는다. */}
				{toolbar && (
					<div className="textarea_toolbar" inert={props.disabled || undefined}>
						{toolbar}
					</div>
				)}
				<div className="textarea_input_wrap">
					{/* `{...props}` 를 **먼저** 펼친다 - TextField 와 같은 이유(소비자 값이 Field 배선을
					    덮지 않게). Field 밖에서는 소비자 aria 값이 그대로 남는다. */}
					<textarea
						{...props}
						id={inputId}
						ref={setRefs}
						className="textarea_input"
						style={{ resize: autoGrow ? "none" : resize }}
						rows={autoGrow ? (minRows ?? rows) : rows}
						maxLength={maxLength}
						aria-invalid={field ? !!error || field.invalid : (props["aria-invalid"] ?? !!error)}
						aria-describedby={describedBy}
						// Field 밖에서는 소비자 값이 남는다 - `{...props}` 를 앞으로 옮긴 뒤로는 계산값이
						// undefined 여도 뒤에서 덮으므로 각 속성이 직접 되돌려 줘야 한다.
						aria-required={field ? field.required || undefined : props["aria-required"]}
						aria-label={(!showLabel ? label : undefined) ?? props["aria-label"]}
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
									(onValueChange ?? onChangeAction)?.(rawValue);
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
