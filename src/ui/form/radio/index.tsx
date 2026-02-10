"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

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
