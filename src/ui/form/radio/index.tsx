"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

/**
 * 라디오 버튼을 렌더링한다.
 * 크기별 클래스와 라벨을 조합해 UI를 구성한다.
 * @param props 라디오 속성
 * @param ref 입력 요소 참조
 * @returns 렌더링된 라디오 UI
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ label, size = "md", className, ...props }, ref) => {
        const rootClassName = cn(
            "radio",
            `radio_size_${size}`,
            className
        );

        return (
            <label className={rootClassName}>
                <input ref={ref} type="radio" className="radio_input" {...props} />
                <span className="radio_dot" aria-hidden="true" />
                {label ? <span className="radio_label">{label}</span> : null}
            </label>
        );
    }
);

Radio.displayName = "Radio";
