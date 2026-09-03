"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import type { PolymorphicProps } from "../../../utils/polymorphic";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

export type SidebarMode = "auto" | "static";

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
	/**
	 * 반응형 모드 (기본 `"auto"`).
	 * - `"auto"`: viewport `< 600px` 에서 자동으로 하단 bar 로 변신.
	 * - `"static"`: 어떤 viewport 에서도 좌측 rail 유지 (admin desktop-only).
	 */
	mode?: SidebarMode;
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
	toggleLabel: toggleLabelProp,
	width = 240,
	collapsedWidth = 64,
	mode = "auto",
	className,
	children,
	style,
	...props
}: SidebarProps) => {
	const t = useLocaleText();
	const toggleLabel = toggleLabelProp ?? t("sidebar.toggle");
	const isControlled = collapsedProp !== undefined;
	const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
	const collapsed = isControlled ? (collapsedProp as boolean) : internalCollapsed;

	const toggle = React.useCallback(() => {
		const next = !collapsed;
		if (!isControlled) setInternalCollapsed(next);
		onCollapsedChange?.(next);
	}, [collapsed, isControlled, onCollapsedChange]);

	// `mode="static"` 일 때 SCSS 의 mobile media query 무효화 (admin/desktop-only)
	const isStatic = mode === "static";

	return (
		<aside
			className={cn(
				"sidebar",
				collapsed && "sidebar_collapsed",
				isStatic && "sidebar_static",
				className,
			)}
			// auto 모드 + mobile 일 때 SCSS 가 width 100% override 함. static / desktop 은 인라인 그대로.
			style={{ width: collapsed ? collapsedWidth : width, ...style }}
			{...props}
		>
			{(header || headerCollapsed) && (
				<div className="sidebar_header">
					<div className="sidebar_header_layers">
						{header && (
							<div className="sidebar_header_layer sidebar_header_layer_full">{header}</div>
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
					{collapsed ? <ChevronRight size={iconSize.xs} /> : <ChevronLeft size={iconSize.xs} />}
				</button>
			)}
		</aside>
	);
};

interface SidebarItemCommon {
	/**
	 * 비활성. `<button>` 은 native `disabled`, 그 밖의 요소(anchor·`Link` 등)는
	 * `aria-disabled` + `tabIndex={-1}` + 클릭 차단으로 처리한다 - native `disabled` 가 없는
	 * 요소에 그냥 넘기면 조용히 무시되고 비활성 항목이 눌린다.
	 */
	disabled?: boolean;
	/** 왼쪽 아이콘 */
	icon?: React.ReactNode;
	/** 현재 활성 상태 */
	active?: boolean;
	/** 오른쪽 trailing (Badge 등) */
	trailing?: React.ReactNode;
}

/**
 * SidebarItem props. `as` 로 렌더 요소를 바꾼다 - `"a"`, `Link`(Next.js) 등 무엇이든.
 *
 * 리터럴 유니온(`"button" | "a"`)이었을 때는 Next 앱에서 사이드바 항목을 라우터 링크로 만들
 * 방법이 없어, 소비자가 DS 를 우회해 자기 항목을 만들었다.
 *
 * `as="a"` 면 `href` 는 **필수**다 - 판별 유니온 시절 계약이고, `href` 없는 `<a>` 는 링크
 * 시맨틱이 없다(`AnchorHTMLAttributes.href` 가 옵션이라 그대로 두면 느슨해진다).
 */
export type SidebarItemProps<T extends React.ElementType = "button"> = PolymorphicProps<
	T,
	SidebarItemCommon
> &
	("button" extends T ? { href?: string } : Record<never, never>) &
	("a" extends T ? { href: string } : Record<never, never>);

export const SidebarItem = <T extends React.ElementType = "button">(props: SidebarItemProps<T>) => {
	const { icon, active, trailing, as, className, children, disabled, ref, ...rest } = props;
	const classes = cn(
		"sidebar_item",
		active && "sidebar_item_active",
		disabled && "sidebar_item_disabled",
		className,
	);
	const ariaCurrent = active ? "page" : undefined;

	// `as` 가 없고 `href` 만 있으면 anchor - 예전 판별 유니온과 같은 추론이다.
	const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
	const Tag = (as ?? (anchorRest.href != null ? "a" : "button")) as React.ElementType;

	const inner = (
		<>
			{icon && (
				<span className="sidebar_item_icon" aria-hidden="true">
					{icon}
				</span>
			)}
			<span className="sidebar_item_label">{children}</span>
			{trailing && <span className="sidebar_item_trailing">{trailing}</span>}
		</>
	);

	if (Tag === "button") {
		// `<button href>` 는 유효하지 않다 - 렌더 요소는 `as` 가 정하므로 여기서 href 는 버린다.
		const {
			type,
			href: _href,
			...buttonRest
		} = rest as React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string };
		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				type={type ?? "button"}
				className={classes}
				disabled={disabled}
				aria-current={ariaCurrent}
				{...buttonRest}
			>
				{inner}
			</button>
		);
	}

	// native `disabled` 가 없는 요소 - Button 과 같은 규칙으로 막는다.
	const { onClick, tabIndex, ...tagProps } = anchorRest;
	return (
		<Tag
			{...tagProps}
			ref={ref}
			className={classes}
			aria-current={ariaCurrent}
			aria-disabled={disabled || undefined}
			tabIndex={disabled ? -1 : tabIndex}
			onClick={(event: React.MouseEvent) => {
				if (disabled) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
			}}
		>
			{inner}
		</Tag>
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
