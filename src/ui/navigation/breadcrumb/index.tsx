"use client";

import { ChevronRight } from "lucide-react";
import type * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

export interface BreadcrumbItem {
	/** 표시 텍스트 */
	label: React.ReactNode;
	/** 클릭 시 이동할 URL. 없으면 현재 페이지로 간주 */
	href?: string;
	/** 클릭 콜백 (href 없이 사용 가능) */
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
	/**
	 * 링크를 렌더할 요소. 라우터 `Link`(`next/link` 등)를 끼울 때 쓴다.
	 *
	 * `onClick` 에서 `preventDefault` + `router.push` 로도 되지만, 그러면 수정자 클릭
	 * (`cmd`/`ctrl`/`shift`)과 새 탭 열기가 죽어 소비처마다 그 검사를 다시 써야 하고
	 * 프리페치·이동 가드처럼 `Link` 만 아는 것들은 표현할 수 없다.
	 *
	 * 마지막 항목(현재 페이지)에는 적용되지 않는다 - 그건 링크가 아니라 `aria-current` 텍스트다.
	 * `href` 없이 주면 무시된다(그 항목은 `<button>` 이다).
	 */
	as?: React.ElementType;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
	/** 경로 아이템 배열. 마지막은 현재 페이지로 간주 */
	items: BreadcrumbItem[];
	/** 구분자 (기본값: ChevronRight 아이콘) */
	separator?: React.ReactNode;
	/** `<nav>` 랜드마크 이름 (기본값: "현재 위치"). 스크린리더의 리전 목록에 그대로 뜬다 */
	navLabel?: string;
}

/**
 * 페이지 위계 네비게이션. 마지막 아이템은 현재 페이지로 표시.
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: "홈", href: "/" },
 *   { label: "블로그", href: "/blog" },
 *   { label: "글 제목" },
 * ]} />
 * ```
 */
export const Breadcrumb = ({
	items,
	separator,
	navLabel: navLabelProp,
	className,
	...props
}: BreadcrumbProps) => {
	const t = useLocaleText();
	const navLabel = navLabelProp ?? t("breadcrumb.label");
	const sep = separator ?? <ChevronRight size={iconSize.xs} aria-hidden="true" />;

	return (
		<nav aria-label={navLabel} className={cn("breadcrumb", className)} {...props}>
			<ol className="breadcrumb_list">
				{items.map((item, idx) => {
					const isLast = idx === items.length - 1;
					// `as` 가 있으면 그 요소로 렌더한다 - NavLink 와 같은 `const Tag` 패턴.
					const Tag = item.as ?? "a";
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: breadcrumb items have stable order
						<li key={idx} className="breadcrumb_item">
							{isLast ? (
								<span className="breadcrumb_current" aria-current="page">
									{item.label}
								</span>
							) : item.href ? (
								// `href`·`className`·`onClick` 을 그대로 넘긴다 - 라우터 `Link` 가 수정자
								// 클릭·프리페치를 자기 방식대로 처리한다.
								<Tag className="breadcrumb_link" href={item.href} onClick={item.onClick}>
									{item.label}
								</Tag>
							) : (
								<button type="button" className="breadcrumb_link" onClick={item.onClick}>
									{item.label}
								</button>
							)}
							{!isLast && (
								<span className="breadcrumb_separator" aria-hidden="true">
									{sep}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
