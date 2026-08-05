"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";
export type IconButtonSize = "sm" | "md";

/** 접근성 이름을 제외한 IconButton 공통 props */
interface IconButtonBaseProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "aria-labelledby"> {
	/** 아이콘 버튼 스타일 변형 (기본값: "standard") */
	variant?: IconButtonVariant;
	/** 아이콘 버튼 크기 (기본값: "md") */
	size?: IconButtonSize;
	/** 표시할 아이콘 */
	icon: React.ReactNode;
	/** 루트 button 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLButtonElement>;
}

/** `aria-label` 로 접근성 이름을 직접 지정 */
export interface IconButtonWithAriaLabel extends IconButtonBaseProps {
	/** 아이콘 버튼의 접근성 이름 (필수) */
	"aria-label": string;
	/** 접근성 이름을 제공하는 요소 id (선택) */
	"aria-labelledby"?: string;
}

/** `aria-labelledby` 로 외부 요소를 참조해 접근성 이름을 지정 */
export interface IconButtonWithAriaLabelledBy extends IconButtonBaseProps {
	/** 아이콘 버튼의 접근성 이름 (선택) */
	"aria-label"?: string;
	/** 접근성 이름을 제공하는 요소 id (필수) */
	"aria-labelledby": string;
}

/**
 * IconButton props - 접근성 이름을 타입 레벨에서 강제하는 union.
 * `icon` 은 항상 `aria-hidden` 으로 감싸지므로 `aria-label` 또는 `aria-labelledby` 중
 * 최소 하나를 반드시 지정해야 한다 (WCAG 2.1 SC 4.1.2 Name, Role, Value).
 *
 * @deprecated 형태의 주의 - v3.7.0 이하에서는 두 속성 모두 optional 이었다.
 * 접근성 이름 없이 `<IconButton icon={<X />} />` 로 사용하던 코드는 이제 **타입 에러**가 난다.
 * 런타임 렌더링은 바뀌지 않았으므로 `aria-label`(또는 `aria-labelledby`)만 추가하면 된다.
 * ```tsx
 * // before (타입 에러 - 접근성 이름 없음)
 * <IconButton icon={<X />} />
 * // after
 * <IconButton icon={<X />} aria-label="닫기" />
 * ```
 */
export type IconButtonProps = IconButtonWithAriaLabel | IconButtonWithAriaLabelledBy;

/**
 * 아이콘만 표시하는 버튼을 렌더링한다.
 * Figma DS 기준 4가지 variant(standard/filled/tonal/outlined)와 2가지 size(sm/md)를 지원한다.
 * 아이콘은 `aria-hidden` 이므로 `aria-label` 또는 `aria-labelledby` 가 타입 레벨에서 필수다.
 * @param props 아이콘 버튼 속성
 * @returns 렌더링된 아이콘 버튼 요소
 */
export const IconButton = ({
	variant = "standard",
	size = "md",
	icon,
	type = "button",
	ref,
	className,
	...props
}: IconButtonProps) => {
	const buttonClassName = cn(
		"icon_button",
		`icon_button_variant_${variant}`,
		`icon_button_size_${size}`,
		className,
	);

	return (
		<button ref={ref} type={type} className={buttonClassName} {...props}>
			<span className="icon_button_icon" aria-hidden="true">
				{icon}
			</span>
		</button>
	);
};
