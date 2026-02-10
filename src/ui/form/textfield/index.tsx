"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type TextFieldVariant = "outline" | "filled" | "ghost";
export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "size" | "onChange" | "value" | "defaultValue"
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

    onChangeAction?: (value: string) => void;

    value?: string;
    defaultValue?: string;

    transformValue?: (value: string) => string;
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
            value,
            defaultValue,
            transformValue,
            ...props
        },
        ref,
    ) => {
        const inputId = id ?? React.useId();
        const helperId = helperText ? `${inputId}-help` : undefined;

        const isControlled = value !== undefined;
        const applyTransform = (nextValue: string) =>
            transformValue ? transformValue(nextValue) : nextValue;

        const [innerValue, setInnerValue] = React.useState(() =>
            applyTransform(value ?? defaultValue ?? ""),
        );

        const isComposingRef = React.useRef(false);

        React.useEffect(() => {
            if (!isControlled) return;
            setInnerValue(applyTransform(value ?? ""));
        }, [isControlled, value, transformValue]);

        const rootClassName = cn(
            "text_field",
            { text_field_full_width: fullWidth },
            className
        );

        const inputClassName = cn(
            "text_field_input",
            `text_field_variant_${variant}`,
            `text_field_size_${size}`,
            {
                text_field_with_left: !!leftIcon,
                text_field_with_right: !!rightIcon,
                text_field_error: !!error,
                text_field_success: !!success,
            }
        );

        const helperClassName = cn(
            "text_field_helper",
            {
                text_field_helper_error: error,
                text_field_helper_success: success,
            }
        );

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
                        value={innerValue}
                        onCompositionStart={() => {
                            isComposingRef.current = true;
                        }}
                        onCompositionEnd={(event) => {
                            isComposingRef.current = false;

                            const rawValue = event.currentTarget.value;
                            const nextValue = applyTransform(rawValue);

                            setInnerValue(nextValue);
                            onChangeAction?.(nextValue);
                        }}
                        onChange={(event) => {
                            const rawValue = event.target.value;

                            if (isComposingRef.current) {
                                setInnerValue(rawValue);
                                return;
                            }

                            const nextValue = applyTransform(rawValue);
                            setInnerValue(nextValue);
                            onChangeAction?.(nextValue);
                        }}
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
    },
);

TextField.displayName = "TextField";
