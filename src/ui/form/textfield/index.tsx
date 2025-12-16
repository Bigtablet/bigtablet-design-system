"use client";

import * as React from "react";
import "./style.scss";

export type TextFieldVariant = "outline" | "filled" | "ghost";
export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "size" | "onChange"
    > {
    label?: string;
    helperText?: string;
    error?: boolean;
    success?: boolean;
    variant?: TextFieldVariant;
    size?: TextFieldSize;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    onChangeAction?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
    (
        {
            id,
            label,
            helperText,
            error,
            success,
            variant = "outline",
            size = "md",
            leftIcon,
            rightIcon,
            fullWidth,
            className,
            onChangeAction,
            ...props
        },
        ref
    ) => {
        const inputId = id ?? React.useId();
        const helperId = helperText ? `${inputId}-help` : undefined;

        const rootClassName = [
            "text_field",
            fullWidth && "text_field_full_width",
            className ?? "",
        ]
            .filter(Boolean)
            .join(" ");

        const inputClassName = [
            "text_field_input",
            `text_field_variant_${variant}`,
            `text_field_size_${size}`,
            leftIcon && "text_field_with_left",
            rightIcon && "text_field_with_right",
            error && "text_field_error",
            success && "text_field_success",
        ]
            .filter(Boolean)
            .join(" ");

        const helperClassName = [
            "text_field_helper",
            error && "text_field_helper_error",
            success && "text_field_helper_success",
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <div className={rootClassName}>
                {label ? (
                    <label className="text_field_label" htmlFor={inputId}>
                        {label}
                    </label>
                ) : null}

                <div className="text_field_wrap">
                    {leftIcon ? (
                        <span className="text_field_icon text_field_icon_left">
              {leftIcon}
            </span>
                    ) : null}

                    <input
                        id={inputId}
                        ref={ref}
                        className={inputClassName}
                        aria-invalid={!!error}
                        aria-describedby={helperId}
                        {...props}
                        onChange={onChangeAction}
                    />

                    {rightIcon ? (
                        <span className="text_field_icon text_field_icon_right">
              {rightIcon}
            </span>
                    ) : null}
                </div>

                {helperText ? (
                    <div id={helperId} className={helperClassName}>
                        {helperText}
                    </div>
                ) : null}
            </div>
        );
    }
);

TextField.displayName = "TextField";