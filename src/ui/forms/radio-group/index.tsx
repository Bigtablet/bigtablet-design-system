"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type RadioGroupSize = "sm" | "md" | "lg";
export type RadioGroupOrientation = "vertical" | "horizontal";

export interface RadioGroupContextValue {
	/** 그룹 라디오들이 공유하는 name (브라우저 그룹핑) */
	name: string;
	/** 현재 선택된 value (없으면 미선택) */
	value: string | undefined;
	/** 라디오 선택 시 호출 */
	onChange: (value: string) => void;
	/** 그룹 사이즈 — 개별 Radio 의 size 미지정 시 적용 */
	size: RadioGroupSize;
	/** 그룹 전체 비활성화 */
	disabled: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

/**
 * `Radio` 가 상위 `RadioGroup` 의 컨텍스트를 optional 하게 소비하기 위한 hook.
 * `RadioGroup` 밖에서 쓰이면 `null` 을 반환 — 이 경우 Radio 는 standalone 으로 동작.
 */
export function useRadioGroupContext(): RadioGroupContextValue | null {
	return React.useContext(RadioGroupContext);
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** 제어형: 선택된 value */
	value?: string;
	/** 비제어형: 초기 선택 value */
	defaultValue?: string;
	/** value 변경 콜백 */
	onValueChange?: (value: string) => void;
	/** 라디오 그룹 name (미지정 시 자동 생성) */
	name?: string;
	/** 그룹 라벨 (radiogroup 의 접근성 레이블) */
	label?: React.ReactNode;
	/** 라벨/옵션 아래 보조 설명. error 일 때 에러 색 */
	supportingText?: React.ReactNode;
	/** 에러 상태 */
	error?: boolean;
	/** 그룹 사이즈 — 자식 Radio 에 전파 (기본값: "md") */
	size?: RadioGroupSize;
	/** 배치 방향 (기본값: "vertical") */
	orientation?: RadioGroupOrientation;
	/** 그룹 전체 비활성화 */
	disabled?: boolean;
	/** `Radio` 들 */
	children: React.ReactNode;
}

/**
 * `Radio` 들을 묶는 합성 래퍼. Context 로 name/value/size/disabled 를 공유한다.
 * native `input[type=radio]` 라 같은 name 공유 시 브라우저가 방향키 이동을 기본 제공한다.
 *
 * - 제어형: `value` + `onValueChange`
 * - 비제어형: `defaultValue`
 *
 * @example
 * ```tsx
 * <RadioGroup label="크기" defaultValue="md" onValueChange={setSize}>
 *   <Radio value="sm" label="작게" />
 *   <Radio value="md" label="보통" />
 *   <Radio value="lg" label="크게" />
 * </RadioGroup>
 * ```
 */
export const RadioGroup = ({
	value: controlledValue,
	defaultValue,
	onValueChange,
	name: nameProp,
	label,
	supportingText,
	error = false,
	size = "md",
	orientation = "vertical",
	disabled = false,
	className,
	children,
	...props
}: RadioGroupProps) => {
	const isControlled = controlledValue !== undefined;
	const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
	const value = isControlled ? controlledValue : internalValue;

	const generatedName = React.useId();
	const name = nameProp ?? generatedName;
	const idPrefix = React.useId();
	const labelId = label ? `${idPrefix}-label` : undefined;
	const helperId = supportingText ? `${idPrefix}-help` : undefined;

	const onChange = React.useCallback(
		(next: string) => {
			if (!isControlled) setInternalValue(next);
			onValueChange?.(next);
		},
		[isControlled, onValueChange],
	);

	const ctx = React.useMemo<RadioGroupContextValue>(
		() => ({ name, value, onChange, size, disabled }),
		[name, value, onChange, size, disabled],
	);

	return (
		<RadioGroupContext.Provider value={ctx}>
			<div
				className={cn(
					"radio_group",
					`radio_group_orientation_${orientation}`,
					error && "radio_group_error",
					className,
				)}
				{...props}
			>
				{label && (
					<span id={labelId} className="radio_group_label">
						{label}
					</span>
				)}
				<div
					role="radiogroup"
					aria-labelledby={labelId}
					aria-describedby={helperId}
					aria-invalid={error || undefined}
					className="radio_group_options"
				>
					{children}
				</div>
				{supportingText && (
					<div id={helperId} className="radio_group_helper">
						{supportingText}
					</div>
				)}
			</div>
		</RadioGroupContext.Provider>
	);
};

RadioGroup.displayName = "RadioGroup";
