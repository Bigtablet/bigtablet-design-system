"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

// HTML 의 `title` 속성(툴팁 문자열)과 이름이 겹친다. 화면 제목은 ReactNode 를 받으므로
// 그쪽을 뺀다 - 툴팁이 필요하면 안쪽 요소에 직접 준다.
export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** 화면 제목. `h1` 로 렌더된다 */
	title: React.ReactNode;
	/** 제목 아래 한 줄 설명 */
	description?: React.ReactNode;
	/** 제목 위 경로. 보통 `Breadcrumb` */
	breadcrumb?: React.ReactNode;
	/** 우측 액션. 보통 `Button` 하나 또는 둘 */
	actions?: React.ReactNode;
	/** 제목 줄 아래에 붙는 영역. 보통 `TabList` */
	tabs?: React.ReactNode;
}

/**
 * 화면 제목 줄. 경로 · 제목 · 설명 · 액션 · 탭을 한 규약으로 묶는다.
 *
 * 화면마다 `<h1 style={{ fontSize: 20, fontWeight: 600 }}>` 로 다시 만들던 층이다.
 * 제목 크기와 설명 색을 화면마다 정하면 같은 제품 안에서 제목이 서로 다른 크기로 보인다.
 *
 * 제목은 `h1` 이다 - 화면의 제목이므로 문서에 하나만 있어야 한다.
 *
 * 겉은 `<header>` 가 아니라 `<div>` 다. `<header>` 는 `<main>` 안에 있어도 banner landmark 로
 * 계산되므로(`main` 은 sectioning content 가 아니다), `NavBar` 의 `<header>` 와 banner 가 둘이
 * 되어 landmark 목록이 망가진다.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   breadcrumb={<Breadcrumb items={…} />}
 *   title="주문 관리"
 *   description="최근 30일 주문을 봅니다"
 *   actions={<Button>주문 추가</Button>}
 * />
 * ```
 */
export const PageHeader = ({
	title,
	description,
	breadcrumb,
	actions,
	tabs,
	className,
	...props
}: PageHeaderProps) => (
	<div className={cn("page_header", className)} {...props}>
		{breadcrumb && <div className="page_header_breadcrumb">{breadcrumb}</div>}
		<div className="page_header_bar">
			<div className="page_header_titles">
				<h1 className="page_header_title">{title}</h1>
				{description && <p className="page_header_description">{description}</p>}
			</div>
			{actions && <div className="page_header_actions">{actions}</div>}
		</div>
		{tabs && <div className="page_header_tabs">{tabs}</div>}
	</div>
);
