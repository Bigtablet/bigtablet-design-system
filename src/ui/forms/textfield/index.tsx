"use client";

import { Eye, EyeOff, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import { useFieldControl } from "../field";
import "./style.scss";

export type TextFieldSize = "sm" | "md" | "lg";

/**
 * 입력 필드 시각 변형.
 * - `outline`: 테두리로 입력 영역을 구분 (기본).
 * - `filled`: 테두리 대신 채워진 배경으로 구분, 포커스 시 배경이 solid 로 돌아오며 테두리가 드러남.
 */
export type TextFieldVariant = "outline" | "filled";

/**
 * IME 조합(한글/일본어/중국어) 중 외부 콜백 처리 전략.
 * - `delayed`: 조합 완료 후에만 `onChangeAction` 호출 (기본 - 폼 제출/검증용).
 * - `immediate`: 조합 중에도 매 입력마다 즉시 호출 (실시간 검색/필터/미리보기용).
 */
export type ImeStrategy = "delayed" | "immediate";

export interface TextFieldProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"size" | "onChange" | "value" | "defaultValue"
	> {
	/** 입력 필드 크기 */
	size?: TextFieldSize;
	/** 입력 필드 시각 변형 */
	variant?: TextFieldVariant;
	/** 입력 필드 위에 표시할 라벨 텍스트 */
	label?: string;
	/** 라벨 표시 여부 (기본값: true) */
	showLabel?: boolean;
	/** 입력 필드 아래에 표시할 도움말 텍스트 */
	supportingText?: string;
	/** 에러 상태 여부. `success` 와 동시에 지정되면 `error` 가 우선한다. */
	error?: boolean;
	/** 성공(검증 통과) 상태 여부. `error` 가 true 면 무시된다. */
	success?: boolean;
	/**
	 * 식별자(아이디·인증코드·시리얼·사업자번호)를 담는 칸인지. 켜면 `l`/`I`/`1` 과 `0`/`O` 를
	 * 구분되게 렌더한다 — 사용자가 한 글자씩 옮겨 적는 값의 오탈자를 줄인다.
	 */
	identifier?: boolean;
	/**
	 * 입력 필드 왼쪽에 표시할 **장식** 아이콘. `aria-hidden` 으로 접근성 트리에서 제외된다.
	 * 포커스 가능한 요소(버튼 등)를 넣어야 하면 `leadingAction` 을 쓸 것.
	 */
	leadingIcon?: React.ReactNode;
	/**
	 * 입력 필드 오른쪽에 표시할 **장식** 아이콘. `aria-hidden` 으로 접근성 트리에서 제외된다.
	 * 포커스 가능한 요소(버튼 등)를 넣어야 하면 `trailingAction` 을 쓸 것.
	 */
	trailingIcon?: React.ReactNode;
	/**
	 * 입력 필드 왼쪽 조작 요소(버튼 등). `aria-hidden` 을 붙이지 않아 보조기기에 그대로 노출된다.
	 * 아이콘 칸의 위치·크기 CSS 를 재사용하고, 넘긴 요소가 40x40 히트 영역을 채운다(WCAG 2.5.8).
	 */
	leadingAction?: React.ReactNode;
	/**
	 * 입력 필드 오른쪽 조작 요소(버튼 등). `aria-hidden` 을 붙이지 않아 보조기기에 그대로 노출된다.
	 * 아이콘 칸의 위치·크기 CSS 를 재사용하고, 넘긴 요소가 40x40 히트 영역을 채운다(WCAG 2.5.8).
	 */
	trailingAction?: React.ReactNode;
	/**
	 * 비밀번호 표시/숨기기 토글 버튼을 오른쪽에 내장한다.
	 * 켜면 `type` 을 토글이 직접 관리한다 - 숨김 상태는 넘긴 `type`(보통 `"password"`), 표시 상태는 `"text"`.
	 */
	showPasswordToggle?: boolean;
	/** 토글 버튼의 `aria-label` (기본값: "비밀번호 표시" / "비밀번호 숨기기"). 다국어 앱은 주입할 것 */
	passwordToggleLabels?: { show: string; hide: string };
	/** 값이 있을 때 오른쪽에 지우기(X) 버튼 표시 여부 */
	clearable?: boolean;
	/** 지우기(X) 버튼의 `aria-label` */
	clearLabel?: string;
	/** 컨테이너 전체 너비 차지 여부 */
	fullWidth?: boolean;
	/** 값 변경 콜백 (canonical). 호출 시점은 `imeStrategy` 에 따름 (기본: 조합 완료 후) */
	onValueChange?: (value: string) => void;
	/** @deprecated `onValueChange` 를 사용하세요. (Next 서버액션 전달용으로 `Action` 접미사가 필요하면 그대로 사용 가능) */
	onChangeAction?: (value: string) => void;
	/**
	 * IME 조합 중 콜백 전략 (기본값: "delayed").
	 * 실시간 구독(검색/필터) 이 필요하면 "immediate" - 한글 조합 중에도 매 입력 즉시 반영.
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

// X 아이콘 - lucide-react
const ClearIcon = () => <X size={iconSize.lg} aria-hidden="true" />;

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
	success,
	identifier,
	leadingIcon,
	trailingIcon,
	leadingAction,
	trailingAction,
	showPasswordToggle,
	passwordToggleLabels,
	clearable,
	clearLabel: clearLabelProp,
	type,
	fullWidth,
	size = "md",
	variant = "outline",
	className,
	onValueChange,
	onChangeAction,
	imeStrategy = "delayed",
	value,
	defaultValue,
	transformValue,
	ref,
	...props
}: TextFieldProps) => {
	const t = useLocaleText();
	const clearLabel = clearLabelProp ?? t("textField.clear");
	const generatedId = useId();
	// Field 안에서는 Field 가 id·설명 연결·에러를 소유한다. 밖에서는 undefined 라 기존 동작 그대로.
	const field = useFieldControl();
	const inputId = id ?? field?.inputId ?? generatedId;
	const helperId = supportingText ? `${inputId}-help` : undefined;
	const describedBy = field?.describedBy ?? helperId;

	const isControlled = value !== undefined;
	const applyTransform = (nextValue: string) =>
		transformValue ? transformValue(nextValue) : nextValue;

	const [innerValue, setInnerValue] = useState(() => applyTransform(value ?? defaultValue ?? ""));

	const isComposingRef = useRef(false);
	// 마지막으로 onChangeAction 에 방출한 값 - 중복 호출(특히 IME 종료 직후) 차단용.
	const lastEmittedValueRef = useRef(innerValue);

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

	// 비조합 입력 / 조합 종료 / clear 공통 - 중복 방출 차단 후 방출.
	const emit = useCallback(
		(nextValue: string) => {
			setInnerValue(nextValue);
			if (nextValue !== lastEmittedValueRef.current) {
				lastEmittedValueRef.current = nextValue;
				(onValueChange ?? onChangeAction)?.(nextValue);
			}
		},
		[onValueChange, onChangeAction],
	);

	const handleClear = useCallback(() => {
		emit("");
	}, [emit]);

	const [passwordRevealed, setPasswordRevealed] = useState(false);
	const togglePassword = useCallback(() => {
		setPasswordRevealed((revealed) => !revealed);
	}, []);
	// showPasswordToggle 과 type 은 별개 prop 이라 type 을 빠뜨리기 쉽다. 보정이 없으면 값이 이미
	// 평문인데 눈 아이콘만 달린, 아무 효과 없는 버튼이 된다 - 토글을 켰으면 password 가 기본이다.
	let resolvedType = type;
	if (showPasswordToggle) {
		resolvedType = passwordRevealed ? "text" : (type ?? "password");
	}

	// error 가 success 를 이긴다 - 둘 다 켜진 건 대개 검증 상태 전환 중인 순간이고,
	// 그때 실패를 성공처럼 보여주면 사용자가 잘못된 값을 그대로 제출하게 된다.
	const isError = !!error || !!field?.invalid;
	const isSuccess = !!success && !isError;

	const rootClassName = cn(
		"text_field",
		`text_field_variant_${variant}`,
		size === "sm" && "text_field_size_sm",
		size === "lg" && "text_field_size_lg",
		fullWidth && "text_field_full_width",
		isError && "text_field_error",
		isSuccess && "text_field_success",
		props.disabled && "text_field_disabled",
		className,
	);

	// 내장 버튼(토글·clear)에는 disabled 를 직접 넘긴다 - `_disabled` 스타일은 컨테이너 자식에
	// opacity 만 걸고 pointer-events 는 건드리지 않아, 없으면 비활성 필드에서도 포커스·클릭이 된다.
	// leadingAction/trailingAction 은 앱이 넘긴 임의 요소라 강제하지 않는다(앱 책임).
	// 오른쪽 칸은 하나뿐이라 우선순위가 필요하다. 토글이 최우선 - 켠 쪽은 값이 있을 때도 계속 보여야 하고,
	// 비밀번호 칸의 clear 는 잃어도 무해하다. 그 아래는 clear > trailingAction > trailingIcon.
	const passwordToggleLabel = passwordRevealed
		? (passwordToggleLabels?.hide ?? t("textField.passwordHide"))
		: (passwordToggleLabels?.show ?? t("textField.passwordShow"));

	const resolvedTrailing = showPasswordToggle ? (
		<span className="text_field_icon text_field_action">
			<button
				type="button"
				onClick={togglePassword}
				aria-label={passwordToggleLabel}
				disabled={props.disabled}
			>
				{passwordRevealed ? (
					<EyeOff size={iconSize.lg} aria-hidden="true" />
				) : (
					<Eye size={iconSize.lg} aria-hidden="true" />
				)}
			</button>
		</span>
	) : clearable && innerValue ? (
		<button
			type="button"
			className="text_field_clear"
			onClick={handleClear}
			aria-label={clearLabel}
			disabled={props.disabled}
		>
			<ClearIcon />
		</button>
	) : trailingAction ? (
		<span className="text_field_icon text_field_action">{trailingAction}</span>
	) : trailingIcon ? (
		<span className="text_field_icon" aria-hidden="true">
			{trailingIcon}
		</span>
	) : null;

	// 왼쪽 칸도 같은 규칙 - action 이 icon 을 이긴다.
	const resolvedLeading = leadingAction ? (
		<span className="text_field_icon text_field_action">{leadingAction}</span>
	) : leadingIcon ? (
		<span className="text_field_icon" aria-hidden="true">
			{leadingIcon}
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
					{resolvedLeading}

					<div
						className={cn(
							"text_field_input_wrap",
							resolvedTrailing && "text_field_input_wrap_no_pad_right",
						)}
					>
						<input
							id={inputId}
							ref={ref}
							className={cn("text_field_input", identifier && "text_field_input_identifier")}
							aria-invalid={isError}
							aria-describedby={describedBy}
							aria-required={field?.required || undefined}
							aria-label={!showLabel ? label : undefined}
							{...props}
							type={resolvedType}
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
								// 조합 중 - transform 은 조합 깨짐 방지 위해 보류, raw 로 표시.
								if (isComposingRef.current) {
									setInnerValue(rawValue);
									// immediate: 조합 중에도 외부 구독 즉시 반영 (raw value).
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
