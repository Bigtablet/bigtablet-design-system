"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type SectionSpacing = "xs" | "sm" | "md" | "lg" | "xl";
export type SectionBg = "default" | "dim" | "accent" | "inverted" | "transparent";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
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
	/** 렌더링할 HTML 요소 */
	as?: React.ElementType;
}

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
export const Section = ({
	spacing = "md",
	bg = "default",
	as: Tag = "section",
	className,
	children,
	...props
}: SectionProps) => {
	return (
		<Tag
			className={cn(
				"section",
				`section_spacing_${spacing}`,
				`section_bg_${bg}`,
				className,
			)}
			{...props}
		>
			{children}
		</Tag>
	);
};
