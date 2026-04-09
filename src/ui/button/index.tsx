"use client";

import type * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export type ButtonVariant = "filled" | "tonal" | "outline" | "text";
export type ButtonSize = "sm" | "md" | "xl";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** 버튼 스타일 변형 (기본값: "filled") */
	variant?: ButtonVariant;
	/** 버튼 크기 (기본값: "md") */
	size?: ButtonSize;
	/** 버튼 앞에 표시할 아이콘 */
	leadingIcon?: React.ReactNode;
	/** 버튼 뒤에 표시할 아이콘 */
	trailingIcon?: React.ReactNode;
	/** 버튼이 컨테이너의 전체 너비를 차지할지 여부 */
	fullWidth?: boolean;
}

/**
 * 버튼을 렌더링한다.
 * Figma DS 기준 4가지 variant(filled/tonal/outline/text)와 3가지 size(sm/md/xl)를 지원한다.
 * @param props 버튼 속성
 * @returns 렌더링된 버튼 요소
 */
export const Button = ({
	variant = "filled",
	size = "md",
	leadingIcon,
	trailingIcon,
	fullWidth = false,
	className,
	children,
	...props
}: ButtonProps) => {
	const buttonClassName = cn(
		"button",
		`button_variant_${variant}`,
		`button_size_${size}`,
		fullWidth && "button_full_width",
		className,
	);

	return (
		<button className={buttonClassName} {...props}>
			{leadingIcon && (
				<span className="button_icon" aria-hidden="true">
					{leadingIcon}
				</span>
			)}
			{children && <span className="button_label">{children}</span>}
			{trailingIcon && (
				<span className="button_icon" aria-hidden="true">
					{trailingIcon}
				</span>
			)}
		</button>
	);
};
