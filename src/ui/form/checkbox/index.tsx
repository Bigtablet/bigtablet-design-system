"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** 체크박스 옆에 표시할 라벨 */
    label?: React.ReactNode;
    /** 체크박스 크기 (기본값: "md") */
    size?: "sm" | "md" | "lg";
    /** 중간 선택(indeterminate) 상태 여부 */
    indeterminate?: boolean;
}

/**
 * 체크박스를 렌더링한다.
 * indeterminate 상태를 반영하고 라벨을 포함한 UI를 구성한다.
 * @param props 체크박스 속성
 * @param ref 입력 요소 참조
 * @returns 렌더링된 체크박스 UI
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, size = "md", indeterminate, className, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        React.useImperativeHandle(ref, () => inputRef.current!);

        React.useEffect(() => {
            if (!inputRef.current) return;
            inputRef.current.indeterminate = Boolean(indeterminate);
        }, [indeterminate]);

        const rootClassName = cn(
            "checkbox",
            `checkbox_size_${size}`,
            className
        );

        return (
            <label className={rootClassName}>
                <input
                    ref={inputRef}
                    type="checkbox"
                    className="checkbox_input"
                    {...props}
                />
                <span className="checkbox_box" aria-hidden="true" />
                {label ? <span className="checkbox_label">{label}</span> : null}
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";
