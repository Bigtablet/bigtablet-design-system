"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import { Button } from "../../general/button";
import "./style.scss";

export interface HeroAction {
	/** 버튼 라벨 */
	label: React.ReactNode;
	/** 클릭 핸들러 */
	onClick?: () => void;
	/** href 사용 시 anchor로 렌더링 */
	href?: string;
}

export type HeroHeight = "sm" | "md" | "lg" | "full";
export type HeroAlign = "left" | "center" | "right";
export type HeroOverlay = boolean | "dark" | "light";

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
	/** 히어로 높이 (기본값: "md"). sm=320 / md=480 / lg=640 / full=100vh */
	height?: HeroHeight;
	/** 텍스트 정렬 (기본값: "left") */
	align?: HeroAlign;
	/** 배경 이미지 URL (CSS background-image로 사용) */
	backgroundImage?: string;
	/** 배경색 - backgroundImage 없을 때 또는 그 위에 색 적용 */
	backgroundColor?: string;
	/**
	 * 텍스트 대비를 위한 오버레이.
	 * - `true`/"dark": 위→아래 검정 그라데이션
	 * - "light": 흰색 그라데이션
	 */
	overlay?: HeroOverlay;
	/** h1으로 렌더링되는 메인 제목 */
	title?: React.ReactNode;
	/** 제목 아래 부제목 */
	subtitle?: React.ReactNode;
	/** Eyebrow 텍스트 - 제목 위에 작게 표시되는 카테고리/태그 */
	eyebrow?: React.ReactNode;
	/** CTA 영역 (Button 등) */
	children?: React.ReactNode;
	/** 텍스트 색상 - 배경이 어두우면 흰색 권장 (기본값: "auto" - overlay가 dark면 white) */
	textColor?: "auto" | "inverse" | "default";
	/** Primary CTA - 미지정 시 children으로 직접 Button 전달 가능 */
	primaryAction?: HeroAction;
	/** Secondary CTA */
	secondaryAction?: HeroAction;
}

/**
 * Hero CTA 버튼. `href` 지정 시 링크 시맨틱(우클릭 새 탭·미들클릭·SR 링크 안내)을 위해
 * Button 클래스를 입힌 실제 anchor 로 렌더링한다 — href 가 문서화만 되고 무시되던 문제 수정.
 */
const HeroActionButton = ({
	action,
	variant,
}: {
	action: HeroAction;
	variant: "filled" | "outline";
}) =>
	action.href ? (
		<a
			href={action.href}
			onClick={action.onClick}
			className={cn("button", `button_variant_${variant}`, "button_size_lg")}
		>
			<span className="button_label">{action.label}</span>
		</a>
	) : (
		<Button size="lg" variant={variant} onClick={action.onClick}>
			{action.label}
		</Button>
	);

/**
 * 페이지 상단 히어로 섹션을 렌더링한다.
 * 배경 이미지/색상 + 오버레이 + 제목/부제목 + CTA 슬롯으로 구성.
 * @param props 히어로 속성
 * @returns 히어로 섹션
 */
export const Hero = ({
	height = "md",
	align = "left",
	backgroundImage,
	backgroundColor,
	overlay,
	title,
	subtitle,
	eyebrow,
	textColor = "auto",
	primaryAction,
	secondaryAction,
	children,
	className,
	style,
	...props
}: HeroProps) => {
	const resolvedOverlay = overlay === true ? "dark" : overlay;
	const isDarkOverlay = resolvedOverlay === "dark";
	const resolvedTextColor =
		textColor === "auto"
			? isDarkOverlay || (backgroundImage && !resolvedOverlay)
				? "inverse"
				: "default"
			: textColor;

	const heroClassName = cn(
		"hero",
		`hero_height_${height}`,
		`hero_align_${align}`,
		resolvedOverlay && `hero_overlay_${resolvedOverlay}`,
		`hero_text_${resolvedTextColor}`,
		className,
	);

	const inlineStyle: React.CSSProperties = { ...style };
	if (backgroundImage) inlineStyle.backgroundImage = `url("${backgroundImage}")`;
	if (backgroundColor) inlineStyle.backgroundColor = backgroundColor;

	return (
		<section className={heroClassName} style={inlineStyle} {...props}>
			{resolvedOverlay && <div className="hero_overlay" aria-hidden="true" />}
			<div className="hero_content">
				{eyebrow && <div className="hero_eyebrow">{eyebrow}</div>}
				{title && <h1 className="hero_title">{title}</h1>}
				{subtitle && <p className="hero_subtitle">{subtitle}</p>}
				{(primaryAction || secondaryAction || children) && (
					<div className="hero_actions">
						{primaryAction && <HeroActionButton action={primaryAction} variant="filled" />}
						{secondaryAction && <HeroActionButton action={secondaryAction} variant="outline" />}
						{children}
					</div>
				)}
			</div>
		</section>
	);
};
