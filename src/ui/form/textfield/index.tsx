"use client";

import * as React from "react";
import styles from "./style.module.scss";

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

        const rootClassName = [
            styles.text_field,
            fullWidth && styles.full_width,
            className ?? "",
        ]
            .filter(Boolean)
            .join(" ");

        const inputClassName = [
            styles.input,
            styles[`variant_${variant}`],
            styles[`size_${size}`],
            leftIcon && styles.with_left,
            rightIcon && styles.with_right,
            error && styles.error,
            success && styles.success,
        ]
            .filter(Boolean)
            .join(" ");

        const helperClassName = [
            styles.helper,
            error && styles.helper_error,
            success && styles.helper_success,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <div className={rootClassName}>
                {label ? (
                    <label className={styles.label} htmlFor={inputId}>
                        {label}
                    </label>
                ) : null}

                <div className={styles.wrap}>
                    {leftIcon ? (
                        <span className={`${styles.icon} ${styles.icon_left}`}>
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
                        <span className={`${styles.icon} ${styles.icon_right}`}>
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
