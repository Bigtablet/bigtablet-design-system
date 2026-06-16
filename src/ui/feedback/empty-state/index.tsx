"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** 일러스트 영역 (아이콘/이미지 등) */
	illustration?: React.ReactNode;
	/** 제목 */
	title?: React.ReactNode;
	/** 보조 설명 */
	description?: React.ReactNode;
	/** 액션 영역 (Button 등) */
	action?: React.ReactNode;
	/** 크기 (기본 "md") */
	size?: "sm" | "md" | "lg";
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
	className,
	...props
}: EmptyStateProps) => {
	return (
		<div className={cn("empty_state", `empty_state_size_${size}`, className)} {...props}>
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
