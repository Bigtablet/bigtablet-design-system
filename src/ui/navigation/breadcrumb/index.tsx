"use client";

import { ChevronRight } from "lucide-react";
import type * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import "./style.scss";

export interface BreadcrumbItem {
	/** 표시 텍스트 */
	label: React.ReactNode;
	/** 클릭 시 이동할 URL. 없으면 현재 페이지로 간주 */
	href?: string;
	/** 클릭 콜백 (href 없이 사용 가능) */
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
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
	navLabel = "현재 위치",
	className,
	...props
}: BreadcrumbProps) => {
	const sep = separator ?? <ChevronRight size={iconSize.xs} aria-hidden="true" />;

	return (
		<nav aria-label={navLabel} className={cn("breadcrumb", className)} {...props}>
			<ol className="breadcrumb_list">
				{items.map((item, idx) => {
					const isLast = idx === items.length - 1;
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: breadcrumb items have stable order
						<li key={idx} className="breadcrumb_item">
							{isLast ? (
								<span className="breadcrumb_current" aria-current="page">
									{item.label}
								</span>
							) : item.href ? (
								<a className="breadcrumb_link" href={item.href} onClick={item.onClick}>
									{item.label}
								</a>
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
