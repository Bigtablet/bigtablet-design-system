"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type ButtonVariant = "filled" | "tonal" | "outline" | "text";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

/** button/anchor 공통 스타일·콘텐츠 props */
interface ButtonBaseProps {
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
	/** border-radius 토큰 (기본값: "full") */
	radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";
	/**
	 * 위험한 액션 (삭제/취소 등) - 빨간 강조.
	 * filled: 빨간 bg, outline: 빨간 텍스트/border, tonal: 빨간 wash.
	 */
	danger?: boolean;
	/**
	 * 비활성화. button 은 native `disabled`, anchor 는 `aria-disabled`+`tabIndex=-1`+
	 * 클릭 차단으로 처리(anchor 엔 native disabled 가 없으므로).
	 */
	disabled?: boolean;
}

/** `<button>` 으로 렌더링 (기본) */
export interface ButtonAsButton
	extends ButtonBaseProps,
		Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
	/** 렌더링할 요소 (기본값: "button") */
	as?: "button";
	/** button 렌더 시엔 href 를 허용하지 않음 (href 만 주면 anchor 로 분기되도록) */
	href?: never;
	/** 루트 button 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLButtonElement>;
}

/** `<a>` 로 렌더링 - 링크 시맨틱(우클릭 새 탭·미들클릭·SR 링크 안내) */
export interface ButtonAsAnchor
	extends ButtonBaseProps,
		Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> {
	/** anchor 로 렌더링 - 생략 가능(href 만 줘도 anchor 로 분기) */
	as?: "a";
	/** 링크 대상 (anchor 필수) */
	href: string;
	/** 루트 anchor 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLAnchorElement>;
}

/**
 * Button props - `as`/`href` 에 따라 button 또는 anchor 로 렌더링되는 discriminated union.
 * `as` 미지정 시 기본 `<button>` (기존 동작과 100% 호환).
 */
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * 버튼을 렌더링한다.
 * Figma DS 기준 4가지 variant(filled/tonal/outline/text)와 4가지 size(sm/md/lg/xl)를 지원한다.
 * `as="a"` (또는 `href` 지정) 시 동일 스타일의 anchor 로 렌더링한다.
 * @param props 버튼 속성
 * @returns 렌더링된 button 또는 anchor 요소
 */
export const Button = (props: ButtonProps) => {
	const {
		variant = "filled",
		size = "md",
		leadingIcon,
		trailingIcon,
		fullWidth = false,
		radius,
		danger = false,
		disabled = false,
		as,
		className,
		children,
		ref,
		...rest
	} = props;

	const buttonClassName = cn(
		"button",
		`button_variant_${variant}`,
		`button_size_${size}`,
		fullWidth && "button_full_width",
		radius && `button_radius_${radius}`,
		danger && "button_danger",
		// anchor 엔 native :disabled 가 안 먹으므로 클래스로 비활성 스타일 적용 (button 도 무해)
		disabled && "button_disabled",
		className,
	);

	const content = (
		<>
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
		</>
	);

	// as="a" 또는 (as 미지정 + href 존재) 시 anchor 로 렌더링
	const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
	const renderAnchor = as === "a" || (as === undefined && anchorRest.href != null);

	if (renderAnchor) {
		// anchor 엔 native disabled 가 없어 aria-disabled + tabIndex=-1 + 클릭 차단으로 비활성
		// 처리 (BottomNavItem 과 동일 패턴). href 는 유지해 link 시맨틱을 보존하되 클릭 내비게이션은
		// preventDefault 로 막고, pointer-events:none(.button_disabled) 로 hover/포인터도 차단.
		const { onClick, tabIndex, ...anchorProps } = anchorRest;
		return (
			<a
				{...anchorProps}
				ref={ref as React.Ref<HTMLAnchorElement>}
				className={buttonClassName}
				aria-disabled={disabled || undefined}
				tabIndex={disabled ? -1 : tabIndex}
				onClick={
					disabled
						? (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault()
						: onClick
				}
			>
				{content}
			</a>
		);
	}

	const { type = "button", ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

	return (
		<button
			ref={ref as React.Ref<HTMLButtonElement>}
			type={type}
			disabled={disabled}
			className={buttonClassName}
			{...buttonRest}
		>
			{content}
		</button>
	);
};
