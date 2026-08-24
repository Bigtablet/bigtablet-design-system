"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/**
	 * 일러스트 영역 (아이콘/이미지 등). **장식 전용** - `aria-hidden="true"` 래퍼로 접근성 트리에서
	 * 제외된다. 포커스 가능한 요소(버튼/링크 등)를 넣으면 포커스는 가는데 보조기기엔 없는 요소가
	 * 되므로(WCAG 4.1.2) `action` 을 쓸 것.
	 */
	illustration?: React.ReactNode;
	/** 제목 */
	title?: React.ReactNode;
	/** 보조 설명 */
	description?: React.ReactNode;
	/** 액션 영역 (Button 등). `aria-hidden` 을 붙이지 않아 보조기기에 그대로 노출된다. */
	action?: React.ReactNode;
	/** 크기 (기본 "md") */
	size?: "sm" | "md" | "lg";
	/**
	 * 부모 높이를 채우고 내용을 세로 중앙에 둔다 (`flex: 1` + `justify-content: center`).
	 * 404 · 검색 결과 없음 · 빈 목록처럼 영역 한가운데 놓여야 하는 경우에 쓴다.
	 * **부모가 세로 flex 컨테이너여야 `flex: 1` 이 먹는다** - 아닌 경우 `height: 100%` 를 준 부모
	 * 안에 두거나 부모를 `display: flex; flex-direction: column` 으로 만들 것.
	 */
	fillHeight?: boolean;
}

/**
 * 빈 상태 표시 - 데이터 없음, 검색 결과 없음, 시작 가이드 등.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   illustration={<InboxIcon size={64} />}
 *   title="받은 메일이 없습니다"
 *   description="새 메일이 오면 여기 표시됩니다."
 *   action={<Button>새 메일 작성</Button>}
 * />
 * ```
 */
export const EmptyState = ({
	illustration,
	title,
	description,
	action,
	size = "md",
	fillHeight,
	className,
	...props
}: EmptyStateProps) => {
	return (
		<div
			className={cn(
				"empty_state",
				`empty_state_size_${size}`,
				fillHeight && "empty_state_fill_height",
				className,
			)}
			{...props}
		>
			{illustration && (
				<div className="empty_state_illustration" aria-hidden="true">
					{illustration}
				</div>
			)}
			{title && <h3 className="empty_state_title">{title}</h3>}
			{description && <p className="empty_state_description">{description}</p>}
			{action && <div className="empty_state_action">{action}</div>}
		</div>
	);
};
