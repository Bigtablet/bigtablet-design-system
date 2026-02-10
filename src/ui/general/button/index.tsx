"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    /** Whether the button should take the full width of its container */
    fullWidth?: boolean;
    /**
     * Custom width for the button
     * @deprecated Use `fullWidth` prop or CSS instead
     */
    width?: string;
}

export const Button = ({
    variant = "primary",
    size = "md",
    fullWidth = true,
    width,
    className,
    style,
    ...props
}: ButtonProps) => {
    const buttonClassName = cn(
        "button",
        `button_variant_${variant}`,
        `button_size_${size}`,
        fullWidth && !width && "button_full_width",
        className
    );

    const buttonStyle = width ? { ...style, width } : style;

    return <button className={buttonClassName} style={buttonStyle} {...props} />;
};
