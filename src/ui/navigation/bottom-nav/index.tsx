"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";
import type { PolymorphicProps } from "../../../utils/polymorphic";

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
	ariaLabel: ariaLabelProp,
	className,
	children,
	...props
}: BottomNavProps) => {
	const t = useLocaleText();
	const ariaLabel = ariaLabelProp ?? t("bottomNav.label");
	return (
		<nav className={cn("bottom_nav", className)} aria-label={ariaLabel} {...props}>
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

/**
 * BottomNavItem props. `as` 로 렌더 요소를 바꾼다 - `"a"`, `Link`(Next.js) 등 무엇이든.
 *
 * `disabled` 는 여기 남는다 - anchor·커스텀 컴포넌트에는 native `disabled` 가 없어
 * `aria-disabled` + `tabIndex={-1}` + 클릭 차단으로 처리해야 하기 때문이다.
 *
 * `as="a"` 면 `href` 는 **필수**다 - 판별 유니온 시절 계약이고, `href` 없는 `<a>` 는 링크
 * 시맨틱이 없다(`AnchorHTMLAttributes.href` 가 옵션이라 그대로 두면 느슨해진다).
 */
export type BottomNavItemProps<T extends React.ElementType = "button"> = PolymorphicProps<
	T,
	BottomNavItemCommon & { disabled?: boolean }
> &
	("button" extends T ? { href?: string } : Record<never, never>) &
	("a" extends T ? { href: string } : Record<never, never>);

/**
 * `BottomNav` 의 항목. icon + label 수직 스택.
 * active 시 `aria-current="page"` 자동 부여.
 */
export const BottomNavItem = <T extends React.ElementType = "button">(
	props: BottomNavItemProps<T>,
) => {
	const { icon, label, active, badge, as, className, disabled, ref, ...rest } = props;

	const classes = cn(
		"bottom_nav_item",
		active && "bottom_nav_item_active",
		disabled && "bottom_nav_item_disabled",
		className,
	);
	const ariaCurrent = active ? "page" : undefined;

	// `as` 가 없고 `href` 만 있으면 anchor - 예전 판별 유니온과 같은 추론이다.
	const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
	const Tag = (as ?? (anchorRest.href != null ? "a" : "button")) as React.ElementType;

	const content = (
		<>
			<span className="bottom_nav_item_icon" aria-hidden="true">
				{icon}
				{badge && <span className="bottom_nav_item_badge">{badge}</span>}
			</span>
			<span className="bottom_nav_item_label">{label}</span>
		</>
	);

	if (Tag === "button") {
		// `<button href>` 는 유효하지 않다 - 렌더 요소는 `as` 가 정하므로 여기서 href 는 버린다.
		const {
			type,
			onClick,
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
				onClick={onClick}
				{...buttonRest}
			>
				{content}
			</button>
		);
	}

	// native `disabled` 가 없는 요소 - aria-disabled + tabIndex=-1 + 클릭 차단으로 비활성화한다.
	const { onClick, tabIndex, ...tagProps } = anchorRest;
	return (
		<Tag
			{...tagProps}
			ref={ref}
			className={classes}
			aria-current={ariaCurrent}
			aria-disabled={disabled ? "true" : undefined}
			tabIndex={disabled ? -1 : tabIndex}
			onClick={(event: React.MouseEvent) => {
				if (disabled) {
					// native disabled button 은 click 이 아예 발생하지 않는다. 전파를 막지 않으면
					// 비활성 항목 클릭이 상위 핸들러(행 클릭 등)를 실행한다.
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
			}}
		>
			{content}
		</Tag>
	);
};

/**
 * 페이지 본문 끝에 두면 `BottomNav` 가 콘텐츠를 가리지 않게 빈 공간 확보.
 * `--bt-bottom-nav-height` (+ safe-area) 만큼 height.
 */
export const BottomNavSpacer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	return <div className={cn("bottom_nav_spacer", className)} aria-hidden="true" {...props} />;
};
