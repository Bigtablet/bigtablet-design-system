"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
	/** 상단 brand 영역 (로고/타이틀) */
	header?: React.ReactNode;
	/** 하단 영역 (사용자/설정/로그아웃 등) */
	footer?: React.ReactNode;
	/** collapsed 상태 — 너비 축소, 아이콘만 표시 */
	collapsed?: boolean;
	/** 너비 (기본 240px, collapsed 시 64px) */
	width?: number;
	/** collapsed 너비 (기본 64px) */
	collapsedWidth?: number;
}

/**
 * admin/dashboard 좌측 네비게이션. navy bg + 흰 텍스트.
 * SidebarItem 컴포넌트와 함께 사용.
 *
 * @example
 * ```tsx
 * <Sidebar header={<Logo />}>
 *   <SidebarItem icon={<HomeIcon />} active>홈</SidebarItem>
 *   <SidebarItem icon={<UsersIcon />}>사용자</SidebarItem>
 * </Sidebar>
 * ```
 */
export const Sidebar = ({
	header,
	footer,
	collapsed = false,
	width = 240,
	collapsedWidth = 64,
	className,
	children,
	style,
	...props
}: SidebarProps) => {
	return (
		<aside
			className={cn("sidebar", collapsed && "sidebar_collapsed", className)}
			style={{ width: collapsed ? collapsedWidth : width, ...style }}
			{...props}
		>
			{header && <div className="sidebar_header">{header}</div>}
			<nav className="sidebar_nav">{children}</nav>
			{footer && <div className="sidebar_footer">{footer}</div>}
		</aside>
	);
};

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** 왼쪽 아이콘 */
	icon?: React.ReactNode;
	/** 현재 활성 상태 */
	active?: boolean;
	/** 오른쪽 trailing (Badge 등) */
	trailing?: React.ReactNode;
	/** 링크 컴포넌트 (Next Link 등). `asChild` 패턴 — `as="a" href="..."` */
	as?: "button" | "a";
	/** as="a"일 때 사용 */
	href?: string;
}

export const SidebarItem = ({
	icon,
	active,
	trailing,
	as = "button",
	href,
	className,
	children,
	type,
	...props
}: SidebarItemProps) => {
	const classes = cn("sidebar_item", active && "sidebar_item_active", className);
	const ariaCurrent = active ? "page" : undefined;

	if (as === "a" && href) {
		return (
			// biome-ignore lint/a11y/useValidAnchor: navigation link with optional active state
			<a className={classes} href={href} aria-current={ariaCurrent} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
				{icon && <span className="sidebar_item_icon" aria-hidden="true">{icon}</span>}
				<span className="sidebar_item_label">{children}</span>
				{trailing && <span className="sidebar_item_trailing">{trailing}</span>}
			</a>
		);
	}

	return (
		<button
			type={type ?? "button"}
			className={classes}
			aria-current={ariaCurrent}
			{...props}
		>
			{icon && <span className="sidebar_item_icon" aria-hidden="true">{icon}</span>}
			<span className="sidebar_item_label">{children}</span>
			{trailing && <span className="sidebar_item_trailing">{trailing}</span>}
		</button>
	);
};

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 섹션 라벨 (collapsed 상태에선 hidden) */
	label?: string;
}

/** SidebarItem 그룹 라벨. collapsed에선 sr-only로 숨김. */
export const SidebarSection = ({ label, className, children, ...props }: SidebarSectionProps) => {
	return (
		<div className={cn("sidebar_section", className)} {...props}>
			{label && <div className="sidebar_section_label">{label}</div>}
			{children}
		</div>
	);
};
