"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface ToggleProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
	/** 제어형 토글 상태 */
	checked?: boolean;
	/** 비제어형 초기 토글 상태 */
	defaultChecked?: boolean;
	/** 상태 변경 시 호출되는 콜백 */
	onChange?: (checked: boolean) => void;
	/** 토글 크기 (기본값: "sm") */
	size?: "sm" | "md";
	/** 비활성화 여부 */
	disabled?: boolean;
	/** 토글 접근성 레이블(스크린 리더용) */
	ariaLabel: string;
	/** 버튼 요소 참조 */
	ref?: React.Ref<HTMLButtonElement>;
}

/**
 * 토글을 렌더링한다.
 * 제어형/비제어형 상태를 판별해 토글 로직을 수행하고 버튼 형태의 토글 UI를 반환한다.
 * @param props 토글 속성
 * @returns 렌더링된 토글 요소
 */
export const Toggle = ({
	checked,
	defaultChecked,
	onChange,
	size = "sm",
	disabled,
	className,
	ariaLabel,
	ref,
	...props
}: ToggleProps) => {
	const isControlled = checked !== undefined;
	const [innerChecked, setInnerChecked] = React.useState(!!defaultChecked);
	const isOn = isControlled ? !!checked : innerChecked;

	/**
	 * 현재 상태를 토글하고 변경 콜백을 호출한다.
	 * @returns void
	 */
	const handleToggle = () => {
		if (disabled) return;
		const next = !isOn;
		if (!isControlled) setInnerChecked(next);
		onChange?.(next);
	};

	const rootClassName = cn(
		"toggle",
		`toggle_size_${size}`,
		{ toggle_on: isOn, toggle_disabled: disabled },
		className,
	);

	return (
		<button
			ref={ref}
			type="button"
			role="switch"
			aria-checked={isOn}
			aria-label={ariaLabel}
			disabled={disabled}
			onClick={handleToggle}
			className={rootClassName}
			{...props}
		>
			<span className="toggle_thumb" />
		</button>
	);
};

Toggle.displayName = "Toggle";
