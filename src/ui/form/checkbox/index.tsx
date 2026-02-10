"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement | null, CheckboxProps>(
    ({ label, size = "md", indeterminate, className, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        React.useImperativeHandle(ref, () => inputRef.current);

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
