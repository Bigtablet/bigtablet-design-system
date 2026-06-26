"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type CardVariant = "default" | "accent" | "glass" | "outlined";

export type CardFooterAlign = "start" | "between" | "end";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 카드 상단에 표시할 제목 */
	heading?: React.ReactNode;
	/** 제목에 사용할 시맨틱 헤딩 태그 (기본값: "h3"). 스크린리더 outline에 반영됩니다. */
	headingAs?: "h2" | "h3" | "h4" | "h5" | "h6";
	/** 카드 그림자 크기 (기본값: "sm") */
	shadow?: "none" | "sm" | "md" | "lg";
	/** 카드 내부 여백 (기본값: "md") */
	padding?: "none" | "sm" | "md" | "lg";
	/** 테두리 표시 여부 (기본값: false) */
	bordered?: boolean;
	/**
	 * 카드 variant (기본값: "default")
	 * - "accent": inverted bg + white text (강조 카드)
	 * - "glass": 반투명 + backdrop blur (컬러/이미지 배경 위에 권장)
	 * - "outlined": 투명 bg + 테두리만 (shadow 무시)
	 */
	variant?: CardVariant;
	/** hover 시 살짝 떠오르는 인터랙션 (기본값: false). 클릭 가능한 카드에 사용 */
	interactive?: boolean;
	/** 카드 하단 영역 - 액션 버튼 등 (구분선과 함께 표시) */
	footer?: React.ReactNode;
	/** footer 정렬 (기본값: "end") */
	footerAlign?: CardFooterAlign;
	/** 루트 div 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLDivElement>;
}

/**
 * 카드 컴포넌트를 렌더링한다.
 * 그림자/패딩/테두리 옵션을 조합해 레이아웃 컨테이너를 구성한다.
 * @param props 카드 속성
 * @returns 렌더링된 카드 UI
 */
export const Card = ({
	heading,
	headingAs: HeadingTag = "h3",
	shadow = "sm",
	padding = "md",
	bordered = false,
	variant = "default",
	interactive = false,
	footer,
	footerAlign = "end",
	ref,
	className,
	children,
	...props
}: CardProps) => {
	const cardClassName = cn(
		"card",
		`card_shadow_${shadow}`,
		`card_p_${padding}`,
		variant !== "default" && `card_variant_${variant}`,
		{ card_bordered: bordered, card_interactive: interactive },
		className,
	);

	return (
		<div ref={ref} className={cardClassName} {...props}>
			{heading ? <HeadingTag className="card_title">{heading}</HeadingTag> : null}
			<div className="card_body">{children}</div>
			{footer ? (
				<div className={cn("card_footer", `card_footer_${footerAlign}`)}>{footer}</div>
			) : null}
		</div>
	);
};
