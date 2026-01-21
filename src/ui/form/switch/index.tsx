"use client";

import * as React from "react";
import "./style.scss";

export interface SwitchProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
}

export const Switch = ({
                           checked,
                           defaultChecked,
                           onChange,
                           size = "md",
                           disabled,
                           className,
                           ...props
                       }: SwitchProps) => {
    const isControlled = checked !== undefined;
    const [innerChecked, setInnerChecked] = React.useState(!!defaultChecked);
    const isOn = isControlled ? !!checked : innerChecked;

    const handleToggle = () => {
        if (disabled) return;
        const next = !isOn;
        if (!isControlled) setInnerChecked(next);
        onChange?.(next);
    };

    const rootClassName = [
        "switch",
        `switch_size_${size}`,
        isOn && "switch_on",
        disabled && "switch_disabled",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isOn}
            disabled={disabled}
            onClick={handleToggle}
            className={rootClassName}
            {...props}
        >
            <span className="switch_thumb" />
        </button>
    );
};
