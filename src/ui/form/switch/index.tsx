"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface SwitchProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    /** 스위치 접근성 레이블(스크린 리더용) */
    ariaLabel: string;
}

/**
 * 스위치를 렌더링한다.
 * 제어형/비제어형 상태를 판별해 토글 로직을 수행하고 버튼 형태의 스위치 UI를 반환한다.
 * @param props 스위치 속성
 * @param ref 버튼 참조
 * @returns 렌더링된 스위치 요소
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
        {
            checked,
            defaultChecked,
            onChange,
            size = "md",
            disabled,
            className,
            ariaLabel,
            ...props
        },
        ref
    ) => {
        const isControlled = checked !== undefined;
        const [innerChecked, setInnerChecked] = React.useState(!!defaultChecked);
        const isOn = isControlled ? !!checked : innerChecked;

        /**
         * 현재 상태를 토글하고 변경 콜백을 호출한다.
         * @returns void
         */
        const handleToggle = () => {
            if (disabled) return;
            const next = !isOn;
            if (!isControlled) setInnerChecked(next);
            onChange?.(next);
        };

        const rootClassName = cn(
            "switch",
            `switch_size_${size}`,
            { switch_on: isOn, switch_disabled: disabled },
            className
        );

        return (
            <button
                ref={ref}
                type="button"
                role="switch"
                aria-checked={isOn}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={handleToggle}
                className={rootClassName}
                {...props}
            >
                <span className="switch_thumb" />
            </button>
        );
    }
);

Switch.displayName = "Switch";
