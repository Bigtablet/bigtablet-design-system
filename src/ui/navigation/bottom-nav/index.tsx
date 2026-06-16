"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface BottomNavProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
	/** 스크린 리더 레이블 (기본 "주요 메뉴") */
	ariaLabel?: string;
	/** 2–5 개의 `BottomNavItem` */
	children: React.ReactNode;
}

/**
 * 모바일 하단 네비게이션 바.
 *
 * `position: fixed; bottom: 0` 으로 viewport 하단 고정. iOS 홈 인디케이터 영역
 * (`env(safe-area-inset-bottom)`) 자동 패딩. 본문이 가려지지 않게 페이지 끝에
 * `<BottomNavSpacer />` 를 깔거나 `--bt-bottom-nav-height` CSS 변수로 padding 계산.
 *
 * @example
 * ```tsx
 * <BottomNav>
 *   <BottomNavItem icon={<Home />} label="주문" active />
 *   <BottomNavItem icon={<Menu />} label="메뉴" />
 *   <BottomNavItem icon={<Chart />} label="매출" />
 * </BottomNav>
 * <BottomNavSpacer />
 * ```
 */
export const BottomNav = ({
	ariaLabel = "주요 메뉴",
	className,
	children,
	...props
}: BottomNavProps) => {
	return (
		<nav
			className={cn("bottom_nav", className)}
			aria-label={ariaLabel}
			{...props}
		>
			{children}
		</nav>
	);
};

interface BottomNavItemCommon {
	/** 아이콘 (필수) */
	icon: React.ReactNode;
	/** 라벨 텍스트 (필수, 짧게 - 2–4자) */
	label: string;
	/** 활성 상태 */
	active?: boolean;
	/** 아이콘 우상단 dot/카운트 (Badge 등) */
	badge?: React.ReactNode;
}

// Discriminated union - `as` 값에 따라 허용되는 HTML attribute 가 동적으로 결정됨.
// `target` / `rel` / `download` 는 anchor 에만, `type` / `form` 등은 button 에만 허용.
type BottomNavItemButton = BottomNavItemCommon & {
	as?: "button";
	href?: never;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type BottomNavItemAnchor = BottomNavItemCommon & {
	as: "a";
	href: string;
	/** anchor 에 native `disabled` 없음 - `aria-disabled` + `preventDefault` 로 처리. */
	disabled?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "type">;

export type BottomNavItemProps = BottomNavItemButton | BottomNavItemAnchor;

/**
 * `BottomNav` 의 항목. icon + label 수직 스택.
 * active 시 `aria-current="page"` 자동 부여.
 */
export const BottomNavItem = (props: BottomNavItemProps) => {
	const {
		icon,
		label,
		active,
		badge,
		as = "button",
		className,
		disabled,
		...rest
	} = props;

	const classes = cn(
		"bottom_nav_item",
		active && "bottom_nav_item_active",
		disabled && "bottom_nav_item_disabled",
		className,
	);
	const ariaCurrent = active ? "page" : undefined;

	const content = (
		<>
			<span className="bottom_nav_item_icon" aria-hidden="true">
				{icon}
				{badge && <span className="bottom_nav_item_badge">{badge}</span>}
			</span>
			<span className="bottom_nav_item_label">{label}</span>
		</>
	);

	if (as === "a") {
		// HTML 의 `<a disabled>` 는 무효 - `aria-disabled` + `tabIndex={-1}` + `preventDefault` 로 접근성 있게 비활성화.
		const { href, onClick, ...anchorRest } = rest as Omit<
			BottomNavItemAnchor,
			"icon" | "label" | "active" | "badge" | "as" | "className" | "disabled"
		>;
		return (
			// biome-ignore lint/a11y/useValidAnchor: navigation link with optional active state
			<a
				className={classes}
				href={href}
				aria-current={ariaCurrent}
				aria-disabled={disabled ? "true" : undefined}
				tabIndex={disabled ? -1 : undefined}
				onClick={(e) => {
					if (disabled) {
						e.preventDefault();
						return;
					}
					onClick?.(e);
				}}
				{...anchorRest}
			>
				{content}
			</a>
		);
	}

	const { type, onClick, ...buttonRest } = rest as Omit<
		BottomNavItemButton,
		"icon" | "label" | "active" | "badge" | "as" | "className" | "disabled"
	>;
	return (
		<button
			type={type ?? "button"}
			className={classes}
			disabled={disabled}
			aria-current={ariaCurrent}
			onClick={onClick}
			{...buttonRest}
		>
			{content}
		</button>
	);
};

/**
 * 페이지 본문 끝에 두면 `BottomNav` 가 콘텐츠를 가리지 않게 빈 공간 확보.
 * `--bt-bottom-nav-height` (+ safe-area) 만큼 height.
 */
export const BottomNavSpacer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	return <div className={cn("bottom_nav_spacer", className)} aria-hidden="true" {...props} />;
};
