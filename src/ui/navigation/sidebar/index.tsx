"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
	/** 상단 brand 영역 (펼친 상태 로고) */
	header?: React.ReactNode;
	/** collapsed 상태 헤더 (보통 favicon). 미지정 시 collapsed 에서도 `header` 사용. */
	headerCollapsed?: React.ReactNode;
	/** 하단 영역 (사용자/설정/로그아웃 등) */
	footer?: React.ReactNode;
	/** collapsed 상태 (controlled) */
	collapsed?: boolean;
	/** collapsed 초기값 (uncontrolled). `collapsed` 미지정 시 사용. */
	defaultCollapsed?: boolean;
	/** collapsed 변경 콜백 (controlled/uncontrolled 모두에서 호출) */
	onCollapsedChange?: (collapsed: boolean) => void;
	/** 내장 collapse 토글 버튼 표시 (기본 true) */
	collapsible?: boolean;
	/** 토글 버튼 a11y label (기본 "사이드바 토글") */
	toggleLabel?: string;
	/** 너비 (기본 240px) */
	width?: number;
	/** collapsed 너비 (기본 64px) */
	collapsedWidth?: number;
}

/**
 * admin/dashboard 좌측 네비게이션.
 * `SidebarItem` + `SidebarSection` 과 함께 사용.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   header={<Logo />}
 *   headerCollapsed={<Favicon />}
 *   defaultCollapsed={false}
 * >
 *   <SidebarItem icon={<HomeIcon />} active>홈</SidebarItem>
 * </Sidebar>
 * ```
 */
export const Sidebar = ({
	header,
	headerCollapsed,
	footer,
	collapsed: collapsedProp,
	defaultCollapsed = false,
	onCollapsedChange,
	collapsible = true,
	toggleLabel = "사이드바 토글",
	width = 240,
	collapsedWidth = 64,
	className,
	children,
	style,
	...props
}: SidebarProps) => {
	const isControlled = collapsedProp !== undefined;
	const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
	const collapsed = isControlled ? (collapsedProp as boolean) : internalCollapsed;

	const toggle = React.useCallback(() => {
		const next = !collapsed;
		if (!isControlled) setInternalCollapsed(next);
		onCollapsedChange?.(next);
	}, [collapsed, isControlled, onCollapsedChange]);

	return (
		<aside
			className={cn("sidebar", collapsed && "sidebar_collapsed", className)}
			style={{ width: collapsed ? collapsedWidth : width, ...style }}
			{...props}
		>
			{(header || headerCollapsed) && (
				<div className="sidebar_header">
					<div className="sidebar_header_layers">
						{header && (
							<div className="sidebar_header_layer sidebar_header_layer_full">
								{header}
							</div>
						)}
						{headerCollapsed && (
							<div className="sidebar_header_layer sidebar_header_layer_mark">
								{headerCollapsed}
							</div>
						)}
					</div>
				</div>
			)}
			<nav className="sidebar_nav">{children}</nav>
			{footer && <div className="sidebar_footer">{footer}</div>}
			{collapsible && (
				<button
					type="button"
					className="sidebar_collapse_btn"
					onClick={toggle}
					aria-label={toggleLabel}
					aria-expanded={!collapsed}
				>
					{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
				</button>
			)}
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
