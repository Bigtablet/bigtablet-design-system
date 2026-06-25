"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type * as React from "react";
import { cn, useSafeLayoutEffect } from "../../../utils";
import "./style.scss";

export type NavBarVariant = "default" | "transparent" | "accent";
export type NavBarLayout = "contained" | "fluid";

export interface NavBarLocaleOption {
	value: string;
	label: string;
}

export interface NavBarLocaleConfig {
	/** 현재 선택된 locale 값 (예: "ko") */
	current: string;
	/** 가능한 옵션 */
	options: NavBarLocaleOption[];
	/** locale 변경 콜백 */
	onChange: (next: string) => void;
	/** 표시 라벨 - 기본은 옵션의 label, 미지정 시 short code 표시 */
	hideLabel?: boolean;
}

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
	/** 왼쪽 brand/로고 영역 */
	brand?: React.ReactNode;
	/** 중앙 또는 우측의 검색 영역 (TextField 등) */
	searchSlot?: React.ReactNode;
	/** 오른쪽 액션 영역 (IconButton, primary CTA Button 등) */
	actions?: React.ReactNode;
	/** i18n locale switcher (Globe 아이콘 + 드롭다운) */
	locale?: NavBarLocaleConfig;
	/** 우측 프로필 영역 (Avatar/ProfileButton) */
	profile?: React.ReactNode;
	/** actions / locale 와 profile 사이 수직 divider 표시 (기본 true, profile 있을 때만 표시) */
	divider?: boolean;
	/** 시각 variant - default(흰 bg + 회색 border), transparent(투명, hero 위에), accent(검정 bg) */
	variant?: NavBarVariant;
	/** 레이아웃 - contained(max 1200, marketing) / fluid(full width, admin/dashboard) */
	layout?: NavBarLayout;
	/** sticky 고정 여부 */
	sticky?: boolean;
}

/**
 * 페이지 상단 네비게이션 바. 마케팅/B2C 헤더 + admin/dashboard 헤더 둘 다 지원.
 *
 * @example marketing
 * ```tsx
 * <NavBar brand={<Logo />} actions={<Button>로그인</Button>}>
 *   <NavLink href="/about">About</NavLink>
 *   <NavLink href="/blog" active>Blog</NavLink>
 * </NavBar>
 * ```
 *
 * @example admin/dashboard
 * ```tsx
 * <NavBar
 *   brand={<OrgButton />}
 *   searchSlot={<TextField placeholder="검색" />}
 *   actions={<IconButton icon={Calendar} aria-label="캘린더" />}
 *   locale={{ current: "ko", options: [...], onChange: setLocale }}
 *   profile={<Avatar name="박상민" />}
 * />
 * ```
 */
export const NavBar = ({
	brand,
	searchSlot,
	actions,
	locale,
	profile,
	divider = true,
	variant = "default",
	layout = "contained",
	sticky = false,
	className,
	children,
	...props
}: NavBarProps) => {
	const showDivider = divider && !!profile && (!!actions || !!locale || !!searchSlot);

	// active underline indicator - children NavLink의 active 위치/너비를 측정해서 sliding bar로 표시
	const linksRef = useRef<HTMLElement>(null);
	const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
	const [hasMounted, setHasMounted] = useState(false);

	useSafeLayoutEffect(() => {
		const links = linksRef.current;
		if (!links) return;

		const update = () => {
			const active = links.querySelector<HTMLElement>(".nav_bar_link_active");
			if (active) {
				setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
			} else {
				setIndicator(null);
			}
		};

		update();
		// 첫 mount는 transition 없이 즉시 위치 (깜빡임 방지)
		const mountTimer = setTimeout(() => setHasMounted(true), 50);

		const mo = new MutationObserver(update);
		mo.observe(links, {
			subtree: true,
			attributes: true,
			attributeFilter: ["class", "aria-current"],
		});

		// jsdom 등 ResizeObserver 미지원 환경 안전 처리
		const ro =
			typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
		ro?.observe(links);

		const handleResize = () => update();
		window.addEventListener("resize", handleResize);

		return () => {
			clearTimeout(mountTimer);
			mo.disconnect();
			ro?.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<header
			className={cn(
				"nav_bar",
				`nav_bar_variant_${variant}`,
				`nav_bar_layout_${layout}`,
				sticky && "nav_bar_sticky",
				className,
			)}
			{...props}
		>
			<div className="nav_bar_inner">
				{brand && <div className="nav_bar_brand">{brand}</div>}
				{children && (
					<nav ref={linksRef} className="nav_bar_links">
						{children}
						{indicator && (
							<span
								aria-hidden="true"
								className={cn(
									"nav_bar_indicator",
									hasMounted && "nav_bar_indicator_animated",
								)}
								style={{ left: indicator.left, width: indicator.width }}
							/>
						)}
					</nav>
				)}
				{searchSlot && <div className="nav_bar_search">{searchSlot}</div>}
				<div className="nav_bar_right">
					{actions && <div className="nav_bar_actions">{actions}</div>}
					{locale && <LocaleSwitcher locale={locale} />}
					{showDivider && <span aria-hidden="true" className="nav_bar_divider" />}
					{profile && <div className="nav_bar_profile">{profile}</div>}
				</div>
			</div>
		</header>
	);
};

// ── LocaleSwitcher (내장 i18n 드롭다운) ────────────────────────────────────

const LocaleSwitcher = ({ locale }: { locale: NavBarLocaleConfig }) => {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const menuId = useId();

	const currentOption = locale.options.find((o) => o.value === locale.current);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const escHandler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		document.addEventListener("keydown", escHandler);
		return () => {
			document.removeEventListener("mousedown", handler);
			document.removeEventListener("keydown", escHandler);
		};
	}, [open]);

	const handleSelect = (value: string) => {
		locale.onChange(value);
		setOpen(false);
	};

	return (
		<div ref={wrapperRef} className="nav_bar_locale">
			<button
				type="button"
				className="nav_bar_locale_trigger"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={() => setOpen((p) => !p)}
			>
				<Globe size={16} aria-hidden="true" />
				{!locale.hideLabel && (
					<span className="nav_bar_locale_label">
						{currentOption?.label ?? locale.current.toUpperCase()}
					</span>
				)}
				<ChevronDown size={14} aria-hidden="true" className="nav_bar_locale_chevron" />
			</button>
			{open && (
				<ul id={menuId} role="menu" className="nav_bar_locale_menu">
					{locale.options.map((opt) => (
						<li key={opt.value} role="none">
							<button
								type="button"
								role="menuitem"
								className={cn(
									"nav_bar_locale_item",
									opt.value === locale.current && "nav_bar_locale_item_active",
								)}
								onClick={() => handleSelect(opt.value)}
							>
								{opt.label}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
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
