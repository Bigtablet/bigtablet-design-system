"use client";

import type * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export type SkeletonVariant = "text" | "title" | "avatar" | "rect";

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** 스켈레톤 모양 (기본값: "text") */
	variant?: SkeletonVariant;
	/** CSS width 값 (예: "100%", 200, "16rem"). variant=avatar는 width=height로 사용 */
	width?: number | string;
	/** CSS height 값 */
	height?: number | string;
	/** border-radius 토큰 (sm/md/lg) 또는 임의 CSS 값 */
	radius?: "sm" | "md" | "lg" | "full" | string;
}

/**
 * 로딩 상태를 표현하는 스켈레톤 플레이스홀더를 렌더링한다.
 * @param props 스켈레톤 속성
 * @returns 스켈레톤 요소
 */
export const Skeleton = ({
	variant = "text",
	width,
	height,
	radius,
	className,
	style,
	...props
}: SkeletonProps) => {
	const skeletonClassName = cn(
		"skeleton",
		`skeleton_variant_${variant}`,
		radius && `skeleton_radius_${radius}`,
		className,
	);

	const inlineStyle: React.CSSProperties = { ...style };

	if (width !== undefined) {
		inlineStyle.width = typeof width === "number" ? `${width}px` : width;
	}
	if (height !== undefined) {
		inlineStyle.height = typeof height === "number" ? `${height}px` : height;
	}
	if (variant === "avatar" && width !== undefined && height === undefined) {
		inlineStyle.height = inlineStyle.width;
	}

	return (
		<div className={skeletonClassName} style={inlineStyle} aria-hidden="true" {...props} />
	);
};
