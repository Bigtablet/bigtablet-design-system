"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface ToggleProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
	/** 제어형 토글 상태 */
	checked?: boolean;
	/** 비제어형 초기 토글 상태 */
	defaultChecked?: boolean;
	/** 상태 변경 콜백 (canonical) */
	onCheckedChange?: (checked: boolean) => void;
	/** @deprecated `onCheckedChange` 를 사용하세요. */
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
	onCheckedChange,
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
	 * 소비자 onClick 을 먼저 실행하고 preventDefault 시 토글을 건너뛴다.
	 * @returns void
	 */
	const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		props.onClick?.(e);
		if (disabled || e.defaultPrevented) return;
		const next = !isOn;
		if (!isControlled) setInnerChecked(next);
		(onCheckedChange ?? onChange)?.(next);
	};

	const rootClassName = cn(
		"toggle",
		`toggle_size_${size}`,
		{ toggle_on: isOn, toggle_disabled: disabled },
		className,
	);

	return (
		<button
			// {...props} 를 먼저 펼쳐 data-*/aria-* 는 통과시키되, switch 동작에 필수인
			// role/aria-checked/onClick(소비자 onClick 은 handleToggle 안에서 합성 실행)은
			// 컴포넌트가 항상 이기도록 뒤에 둔다.
			{...props}
			ref={ref}
			type="button"
			role="switch"
			aria-checked={isOn}
			aria-label={ariaLabel}
			disabled={disabled}
			onClick={handleToggle}
			className={rootClassName}
		>
			<span className="toggle_thumb" />
		</button>
	);
};

Toggle.displayName = "Toggle";
