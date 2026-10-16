"use client";

import * as React from "react";
import { cn, type SafeHTMLProps, splitAriaProps } from "../../../utils";
import { useFieldControl } from "../field";
import "./style.scss";

export type SegmentedControlSize = "sm" | "md";

export interface SegmentedControlItem<T extends string = string> {
	/** 이 칸의 값 */
	value: T;
	/** 칸에 보이는 라벨. 아이콘만 둘 때는 `ariaLabel` 을 함께 준다 */
	label?: React.ReactNode;
	/** 라벨 앞 아이콘 (장식 - 보조기기에는 숨긴다) */
	icon?: React.ReactNode;
	/** 접근성 이름. 라벨이 없거나 라벨만으로 뜻이 모자랄 때 */
	ariaLabel?: string;
	/** 이 칸만 비활성화 */
	disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string>
	extends Omit<
		SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>>,
		"onChange" | "defaultValue" | "children"
	> {
	/** 칸 목록 (2~5개 권장) */
	items: SegmentedControlItem<T>[];
	/** 제어형: 선택된 값 */
	value?: T;
	/** 비제어형: 초기 선택 값 */
	defaultValue?: T;
	/** 선택이 바뀔 때 */
	onValueChange?: (value: T) => void;
	/** 폼 제출용 name (미지정 시 자동 생성) */
	name?: string;
	/** 크기 (기본값: "md") */
	size?: SegmentedControlSize;
	/** 부모 폭을 채우고 칸을 균등 분배 */
	fullWidth?: boolean;
	/** 전체 비활성화 */
	disabled?: boolean;
	/** 필수 - 폼 제출 시 선택이 없으면 막는다 */
	required?: boolean;
}

/**
 * 서로 배타적인 짧은 옵션 중 **값 하나를 고르는** 컨트롤 (통화 USD/KRW, 로케일 KO/EN 등).
 *
 * 콘텐츠 패널을 바꾸면 `Tabs`, 입력 토큰·필터 칩이면 `Chip`, 긴 라벨·많은 옵션이면 `RadioGroup`.
 * native `input[type=radio]` 를 쓰므로 방향키 이동·선택과 폼 제출은 브라우저가 처리하고,
 * Home/End 만 더한다. 선택된 칸은 색과 함께 떠오른 표면(그림자)으로도 구분된다.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   aria-label="통화"
 *   value={currency}
 *   onValueChange={setCurrency}
 *   items={[
 *     { value: "USD", label: "USD" },
 *     { value: "KRW", label: "KRW" },
 *   ]}
 * />
 * ```
 */
export const SegmentedControl = <T extends string = string>({
	items,
	value: controlledValue,
	defaultValue,
	onValueChange,
	name: nameProp,
	size = "md",
	fullWidth = false,
	disabled = false,
	required = false,
	className,
	onKeyDown: onKeyDownProp,
	...props
}: SegmentedControlProps<T>) => {
	const isControlled = controlledValue !== undefined;
	const [internalValue, setInternalValue] = React.useState<T | undefined>(defaultValue);
	const value = isControlled ? controlledValue : internalValue;

	const generatedName = React.useId();
	const name = nameProp ?? generatedName;
	const field = useFieldControl();
	// 소비자 aria-* 는 래퍼가 아니라 role="radiogroup" 으로 - RadioGroup 과 같은 이유
	const { ariaProps, restProps } = splitAriaProps(props);
	const isRequired = required || !!field?.required;

	const select = (next: T) => {
		if (!isControlled) setInternalValue(next);
		onValueChange?.(next);
	};

	// 방향키는 native radio 가 처리한다. Home/End 는 radio 기본 동작에 없어 직접 더한다.
	// 소비자 onKeyDown 을 먼저 부르고, 거기서 preventDefault 했으면 Home/End 를 건너뛴다.
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDownProp?.(e);
		if (e.defaultPrevented || (e.key !== "Home" && e.key !== "End")) return;
		const enabled = items.filter((item) => !(disabled || item.disabled));
		const target = e.key === "Home" ? enabled[0] : enabled.at(-1);
		if (!target) return;
		e.preventDefault();
		select(target.value);
		const input = e.currentTarget.querySelector<HTMLInputElement>(
			`input[value="${CSS.escape(target.value)}"]`,
		);
		input?.focus();
	};

	return (
		<div
			role="radiogroup"
			{...restProps}
			{...ariaProps}
			aria-labelledby={field?.labelId ?? ariaProps["aria-labelledby"]}
			aria-describedby={field?.describedBy ?? ariaProps["aria-describedby"]}
			aria-invalid={field ? field.invalid || undefined : ariaProps["aria-invalid"]}
			aria-required={isRequired || undefined}
			aria-disabled={disabled || undefined}
			className={cn(
				"segmented_control",
				`segmented_control_size_${size}`,
				fullWidth && "segmented_control_full_width",
				disabled && "segmented_control_disabled",
				className,
			)}
			onKeyDown={onKeyDown}
		>
			{items.map((item) => {
				const selected = item.value === value;
				const itemDisabled = disabled || !!item.disabled;
				return (
					<label
						key={item.value}
						className={cn(
							"segmented_control_item",
							selected && "segmented_control_item_selected",
							itemDisabled && "segmented_control_item_disabled",
						)}
					>
						<input
							type="radio"
							className="segmented_control_input"
							name={name}
							value={item.value}
							checked={selected}
							disabled={itemDisabled}
							// 모든 칸에 건다 - 한 칸에만 걸면 그 칸이 disabled 일 때 제약 검증에서 빠져
							// 선택 없이 제출된다. radio 그룹은 하나만 골라도 충족된다.
							required={isRequired}
							aria-label={item.ariaLabel}
							onChange={() => select(item.value)}
						/>
						{item.icon && (
							<span className="segmented_control_icon" aria-hidden="true">
								{item.icon}
							</span>
						)}
						{item.label != null && <span className="segmented_control_label">{item.label}</span>}
					</label>
				);
			})}
		</div>
	);
};

SegmentedControl.displayName = "SegmentedControl";
