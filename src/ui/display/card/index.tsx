"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** 카드 상단에 표시할 제목 */
    heading?: React.ReactNode;
    /** 카드 그림자 크기 (기본값: "sm") */
    shadow?: "none" | "sm" | "md" | "lg";
    /** 카드 내부 여백 (기본값: "md") */
    padding?: "none" | "sm" | "md" | "lg";
    /** 테두리 표시 여부 (기본값: false) */
    bordered?: boolean;
}

/**
 * 카드 컴포넌트를 렌더링한다.
 * 그림자/패딩/테두리 옵션을 조합해 레이아웃 컨테이너를 구성한다.
 * @param props 카드 속성
 * @returns 렌더링된 카드 UI
 */
export const Card = ({
    heading,
    shadow = "sm",
    padding = "md",
    bordered = false,
    className,
    children,
    ...props
}: CardProps) => {
    const cardClassName = cn(
        "card",
        `card_shadow_${shadow}`,
        `card_p_${padding}`,
        { card_bordered: bordered },
        className
    );

    return (
        <div className={cardClassName} {...props}>
            {heading ? <div className="card_title">{heading}</div> : null}
            <div className="card_body">{children}</div>
        </div>
    );
};
