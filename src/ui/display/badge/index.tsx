"use client";

import type * as React from "react";
import { cn, type SafeHTMLProps } from "../../../utils";
import "./style.scss";

export type BadgeTone = "accent" | "neutral" | "info" | "success" | "warning" | "error";
/** @deprecated `BadgeTone` 을 쓰세요. 의미 색은 `tone` 으로 통일했습니다. */
export type BadgeVariant = BadgeTone;
export type BadgeShape = "dot" | "count" | "label";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeAppearance = "solid" | "soft";

export interface BadgeProps extends SafeHTMLProps<React.HTMLAttributes<HTMLSpanElement>> {
	/** 의미 색 (기본값: "accent") */
	tone?: BadgeTone;
	/** @deprecated `tone` 을 쓰세요. 둘 다 주면 `tone` 이 이깁니다. */
	variant?: BadgeTone;
	/** 모양 (기본값: "label"). dot=점만 / count=숫자 / label=텍스트 */
	shape?: BadgeShape;
	/**
	 * 사이즈 (기본값: "md"). 웹 기본.
	 * - sm: 컴팩트 (아이콘 위 알림 dot, 모바일)
	 * - md: 일반 웹 (admin/marketing)
	 * - lg: 강조 (Hero 위 배지, 카테고리)
	 */
	size?: BadgeSize;
	/**
	 * 시각 강도 (기본값: "solid").
	 * - `solid`: 강한 fill bg + 흰/검 텍스트 - 기존 동작 (notification dot, status emphasis)
	 * - `soft`: tint 배경 + 진한 텍스트 - 차분한 정보 라벨 (WCAG AA 통과)
	 */
	appearance?: BadgeAppearance;
	/** count shape 일 때 표시할 숫자. max를 넘으면 "max+" */
	count?: number;
	/** count 최댓값 (기본 99) */
	max?: number;
}

/**
 * 작은 상태 표시. 카운트/dot/라벨 3가지 모양.
 *
 * @example
 * ```tsx
 * <Badge shape="dot" tone="error" />
 * <Badge shape="count" count={5} />
 * <Badge>New</Badge>
 * <Badge tone="success" appearance="soft">+5%</Badge>
 * ```
 */
export const Badge = ({
	tone,
	variant,
	shape = "label",
	size = "md",
	appearance = "solid",
	count,
	max = 99,
	className,
	children,
	...props
}: BadgeProps) => {
	const content = (() => {
		if (shape === "dot") return null;
		if (shape === "count" && count !== undefined) {
			return count > max ? `${max}+` : String(count);
		}
		return children;
	})();

	return (
		<span
			className={cn(
				"badge",
				// 클래스명은 그대로 둔다 - 앱이 `.badge_variant_*` 로 덮어쓰고 있다 (notiiv brand.css)
				`badge_variant_${tone ?? variant ?? "accent"}`,
				`badge_shape_${shape}`,
				`badge_size_${size}`,
				`badge_appearance_${appearance}`,
				className,
			)}
			{...props}
		>
			{content}
		</span>
	);
};
