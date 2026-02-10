"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    /** 버튼이 컨테이너의 전체 너비를 차지할지 여부 */
    fullWidth?: boolean;
    /**
     * 버튼의 커스텀 너비
     * @deprecated `fullWidth` 사용 또는 CSS로 처리
     */
    width?: string;
}

/**
 * 버튼을 렌더링한다.
 * 전달된 props로 클래스 조합과 인라인 스타일을 계산한 뒤 버튼 요소를 반환한다.
 * @param props 버튼 속성
 * @returns 렌더링된 버튼 요소
 */
export const Button = ({
    variant = "primary",
    size = "md",
    fullWidth = true,
    width,
    className,
    style,
    ...props
}: ButtonProps) => {
    const buttonClassName = cn(
        "button",
        `button_variant_${variant}`,
        `button_size_${size}`,
        fullWidth && !width && "button_full_width",
        className
    );

    const buttonStyle = width ? { ...style, width } : style;

    return <button className={buttonClassName} style={buttonStyle} {...props} />;
};
