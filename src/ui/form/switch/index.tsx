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
    /** Accessible label for the switch (for screen readers) */
    ariaLabel?: string;
}

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
