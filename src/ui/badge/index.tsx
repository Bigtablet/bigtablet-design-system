"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export type BadgeVariant =
	| "accent"
	| "neutral"
	| "info"
	| "success"
	| "warning"
	| "error";
export type BadgeShape = "dot" | "count" | "label";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	/** 색상 variant (기본값: "accent") */
	variant?: BadgeVariant;
	/** 모양 (기본값: "label"). dot=점만 / count=숫자 / label=텍스트 */
	shape?: BadgeShape;
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
 * <Badge shape="dot" variant="error" />
 * <Badge shape="count" count={5} />
 * <Badge>New</Badge>
 * ```
 */
export const Badge = ({
	variant = "accent",
	shape = "label",
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
				`badge_variant_${variant}`,
				`badge_shape_${shape}`,
				className,
			)}
			{...props}
		>
			{content}
		</span>
	);
};
