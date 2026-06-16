"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type MediaCardImagePosition = "top" | "left" | "overlay";
export type MediaCardShadow = "none" | "sm" | "md" | "lg";

export interface MediaCardImage {
	src: string;
	alt: string;
}

export interface MediaCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** 이미지 정보 (src + alt). alt=""는 장식 이미지로 처리됨 */
	image: MediaCardImage;
	/** 이미지 위치 (기본값: "top"). overlay = 이미지 위에 텍스트가 얹힘 */
	imagePosition?: MediaCardImagePosition;
	/** 이미지 aspect-ratio (예: "16/9", "4/3", "1/1") */
	aspectRatio?: string;
	/** 카드 제목 */
	heading?: React.ReactNode;
	/** 제목 시맨틱 태그 (기본값: "h3") */
	headingAs?: "h2" | "h3" | "h4" | "h5" | "h6";
	/** Eyebrow - 제목 위 작은 라벨/카테고리 */
	eyebrow?: React.ReactNode;
	/** 카드 그림자 (기본값: "sm") */
	shadow?: MediaCardShadow;
	/** 테두리 표시 여부 (기본값: false) */
	bordered?: boolean;
	/** 카드 클릭 가능 여부 (hover 강조 + cursor) */
	clickable?: boolean;
	/** 메타 영역 (날짜/작성자/조회수 등) - 본문 아래 작은 텍스트 */
	meta?: React.ReactNode;
}

/**
 * 이미지가 포함된 카드를 렌더링한다.
 * Blog/News/Product 같은 B2C 콘텐츠 리스트에 사용한다.
 * @param props 카드 속성
 * @returns 이미지 카드
 */
export const MediaCard = ({
	image,
	imagePosition = "top",
	aspectRatio,
	heading,
	headingAs: HeadingTag = "h3",
	eyebrow,
	shadow = "sm",
	bordered = false,
	clickable = false,
	meta,
	children,
	className,
	...props
}: MediaCardProps) => {
	const cardClassName = cn(
		"media_card",
		`media_card_image_${imagePosition}`,
		`media_card_shadow_${shadow}`,
		bordered && "media_card_bordered",
		clickable && "media_card_clickable",
		className,
	);

	const isOverlay = imagePosition === "overlay";

	// overlay: card 자체가 aspect-ratio. 다른 경우: image_wrap이 aspect-ratio
	const cardStyle = isOverlay && aspectRatio ? { aspectRatio } : undefined;
	const wrapStyle = !isOverlay && aspectRatio ? { aspectRatio } : undefined;

	return (
		<div className={cardClassName} style={cardStyle} {...props}>
			<div className="media_card_image_wrap" style={wrapStyle}>
				{/* biome-ignore lint/performance/noImgElement: DS is framework-agnostic - consumers wrap with next/image if needed */}
				<img className="media_card_image" src={image.src} alt={image.alt} loading="lazy" />
				{isOverlay && <div className="media_card_overlay" aria-hidden="true" />}
			</div>

			<div className="media_card_body">
				{eyebrow && <div className="media_card_eyebrow">{eyebrow}</div>}
				{heading && <HeadingTag className="media_card_heading">{heading}</HeadingTag>}
				{children && <div className="media_card_content">{children}</div>}
				{meta && <div className="media_card_meta">{meta}</div>}
			</div>
		</div>
	);
};
