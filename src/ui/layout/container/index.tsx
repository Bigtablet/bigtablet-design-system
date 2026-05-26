"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * max-width 크기
	 * - sm: 640px | md: 768px | lg: 1024px | xl: 1200px | full: 100%
	 * @default "xl"
	 */
	size?: ContainerSize;
	/** 가운데 정렬 (기본 true) */
	center?: boolean;
	/** 렌더링할 HTML 요소 */
	as?: React.ElementType;
}

/**
 * max-width 제한 + 반응형 수평 패딩을 가진 컨테이너.
 * 모든 마케팅/서비스 페이지의 기본 wrapper.
 *
 * @example
 * ```tsx
 * <Container size="xl">
 *   <HeroSection />
 *   <FeatureGrid />
 * </Container>
 * ```
 */
export const Container = ({
	size = "xl",
	center = true,
	as: Tag = "div",
	className,
	children,
	...props
}: ContainerProps) => {
	return (
		<Tag
			className={cn("container", `container_size_${size}`, center && "container_center", className)}
			{...props}
		>
			{children}
		</Tag>
	);
};
