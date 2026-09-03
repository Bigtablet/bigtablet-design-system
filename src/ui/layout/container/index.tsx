"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import type { PolymorphicProps } from "../../../utils/polymorphic";
import "./style.scss";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerOwnProps {
	/**
	 * max-width 크기
	 * - sm: 640px | md: 768px | lg: 1024px | xl: 1200px | full: 100%
	 * @default "xl"
	 */
	size?: ContainerSize;
	/** 가운데 정렬 (기본 true) */
	center?: boolean;
}

/**
 * Container props. `as` 로 렌더 요소를 바꾼다 - `"main"`·`"ul"` 같은 태그든 `Link` 같은
 * 컴포넌트든, 그 요소의 props 가 타입에 그대로 따라온다.
 *
 * 예전에는 `as?: React.ElementType` 이라 요소만 갈리고 props 는 `div` 기준으로 고정돼,
 * `as="a"` 로 바꿔도 `href` 가 타입에 없었다.
 */
export type ContainerProps<T extends React.ElementType = "div"> = PolymorphicProps<
	T,
	ContainerOwnProps
>;

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
export const Container = <T extends React.ElementType = "div">({
	size = "xl",
	center = true,
	as,
	ref,
	className,
	children,
	...props
}: ContainerProps<T>) => {
	const Tag = (as ?? "div") as React.ElementType;

	return (
		<Tag
			ref={ref}
			className={cn("container", `container_size_${size}`, center && "container_center", className)}
			{...props}
		>
			{children}
		</Tag>
	);
};
