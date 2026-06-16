"use client";

import { TriangleAlert } from "lucide-react";
import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type ErrorStateVariant = "page" | "widget";

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** 제목 (기본 "문제가 발생했습니다") */
	title?: React.ReactNode;
	/** 보조 설명 */
	description?: React.ReactNode;
	/** 아이콘/일러스트 (미지정 시 기본 경고 아이콘. `null` 로 숨김) */
	icon?: React.ReactNode;
	/** 액션 영역 (재시도 버튼 등) */
	action?: React.ReactNode;
	/**
	 * 레이아웃 모드 (기본 "page").
	 * - `page`: 전체 화면/영역 채움 — error boundary fallback. 큰 아이콘 + 넉넉한 패딩 + min-height.
	 * - `widget`: 인라인 컴팩트 — 위젯/카드 내부 error fallback. 작은 아이콘 + 좁은 패딩.
	 */
	variant?: ErrorStateVariant;
}

const DEFAULT_ICON_SIZE: Record<ErrorStateVariant, number> = {
	page: 48,
	widget: 28,
};

/**
 * 에러 상태 표시 — error boundary / 데이터 로드 실패 / 위젯 에러 fallback.
 * `EmptyState` 의 형제. `status-error` 토큰 사용 (하드코딩 없음).
 *
 * @example
 * ```tsx
 * // 페이지 전체 (error boundary)
 * <ErrorState
 *   title="페이지를 불러오지 못했습니다"
 *   description="잠시 후 다시 시도해 주세요."
 *   action={<Button onClick={retry}>다시 시도</Button>}
 * />
 *
 * // 위젯 인라인
 * <ErrorState variant="widget" title="불러오기 실패" action={<Button size="sm" onClick={retry}>재시도</Button>} />
 * ```
 */
export const ErrorState = ({
	title = "문제가 발생했습니다",
	description,
	icon,
	action,
	variant = "page",
	className,
	...props
}: ErrorStateProps) => {
	// icon === null → 숨김, undefined → 기본 아이콘
	const resolvedIcon =
		icon === null ? null : (icon ?? <TriangleAlert size={DEFAULT_ICON_SIZE[variant]} strokeWidth={1.5} />);

	return (
		<div
			className={cn("error_state", `error_state_variant_${variant}`, className)}
			role="alert"
			{...props}
		>
			{resolvedIcon && (
				<div className="error_state_icon" aria-hidden="true">
					{resolvedIcon}
				</div>
			)}
			{title && <h3 className="error_state_title">{title}</h3>}
			{description && <p className="error_state_description">{description}</p>}
			{action && <div className="error_state_action">{action}</div>}
		</div>
	);
};
