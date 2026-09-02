"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import type { PolymorphicProps } from "../../../utils/polymorphic";
import "./style.scss";

export type SectionSpacing = "xs" | "sm" | "md" | "lg" | "xl";
export type SectionBg = "default" | "dim" | "accent" | "inverted" | "transparent";

interface SectionOwnProps {
	/**
	 * 수직 패딩 크기
	 * - xs: 32px | sm: 48px | md: 64px | lg: 96px | xl: 128px
	 * @default "md"
	 */
	spacing?: SectionSpacing;
	/**
	 * 배경색 변형
	 * - default: bg-solid | dim: bg-solid-dim | accent: accent-subtle | inverted: accent-default (검정/흰색 반전)
	 * @default "default"
	 */
	bg?: SectionBg;
}

/**
 * Section props. `as` 로 렌더 요소를 바꾼다 - `"main"`·`"ul"` 같은 태그든 `Link` 같은
 * 컴포넌트든, 그 요소의 props 가 타입에 그대로 따라온다.
 *
 * 예전에는 `as?: React.ElementType` 이라 요소만 갈리고 props 는 `div` 기준으로 고정돼,
 * `as="a"` 로 바꿔도 `href` 가 타입에 없었다.
 */
export type SectionProps<T extends React.ElementType = "section"> = PolymorphicProps<
	T,
	SectionOwnProps
>;

/**
 * 마케팅 페이지의 섹션 단위. 수직 여백 + 배경색 variants.
 *
 * @example
 * ```tsx
 * <Section spacing="lg" bg="dim">
 *   <Container>
 *     <h2>Features</h2>
 *     <FeatureGrid />
 *   </Container>
 * </Section>
 * ```
 */
export const Section = <T extends React.ElementType = "section">({
	spacing = "md",
	bg = "default",
	as,
	ref,
	className,
	children,
	...props
}: SectionProps<T>) => {
	const Tag = (as ?? "section") as React.ElementType;

	return (
		<Tag
			ref={ref}
			className={cn("section", `section_spacing_${spacing}`, `section_bg_${bg}`, className)}
			{...props}
		>
			{children}
		</Tag>
	);
};
