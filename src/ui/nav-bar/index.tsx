"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export type NavBarVariant = "default" | "transparent" | "accent";

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
	/** 왼쪽 brand/로고 영역 */
	brand?: React.ReactNode;
	/** 오른쪽 액션 영역 (Button/Avatar 등) */
	actions?: React.ReactNode;
	/** 시각 variant — default(흰 bg + 회색 border), transparent(투명, hero 위에), accent(navy bg) */
	variant?: NavBarVariant;
	/** sticky 고정 여부 */
	sticky?: boolean;
}

/**
 * 페이지 상단 네비게이션 바. 마케팅/B2C 페이지의 헤더.
 *
 * @example
 * ```tsx
 * <NavBar brand={<Logo />} actions={<Button>로그인</Button>}>
 *   <NavLink href="/about">About</NavLink>
 *   <NavLink href="/blog" active>Blog</NavLink>
 * </NavBar>
 * ```
 */
export const NavBar = ({
	brand,
	actions,
	variant = "default",
	sticky = false,
	className,
	children,
	...props
}: NavBarProps) => {
	return (
		<header
			className={cn(
				"nav_bar",
				`nav_bar_variant_${variant}`,
				sticky && "nav_bar_sticky",
				className,
			)}
			{...props}
		>
			<div className="nav_bar_inner">
				{brand && <div className="nav_bar_brand">{brand}</div>}
				<nav className="nav_bar_links">{children}</nav>
				{actions && <div className="nav_bar_actions">{actions}</div>}
			</div>
		</header>
	);
};

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	/** 현재 활성 페이지 여부 */
	active?: boolean;
}

export const NavLink = ({ active, className, children, ...props }: NavLinkProps) => {
	return (
		// biome-ignore lint/a11y/useValidAnchor: navigation link
		<a
			className={cn("nav_bar_link", active && "nav_bar_link_active")}
			aria-current={active ? "page" : undefined}
			{...props}
		>
			{children}
		</a>
	);
};
