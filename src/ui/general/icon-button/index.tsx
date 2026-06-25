"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** 아이콘 버튼 스타일 변형 (기본값: "standard") */
	variant?: IconButtonVariant;
	/** 아이콘 버튼 크기 (기본값: "md") */
	size?: IconButtonSize;
	/** 표시할 아이콘 */
	icon: React.ReactNode;
	/** 루트 button 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLButtonElement>;
}

/**
 * 아이콘만 표시하는 버튼을 렌더링한다.
 * Figma DS 기준 4가지 variant(standard/filled/tonal/outlined)와 2가지 size(sm/md)를 지원한다.
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
