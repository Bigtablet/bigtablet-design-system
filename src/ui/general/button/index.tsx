"use client";

import * as React from "react";
import "./style.scss";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

export const Button = ({
                           variant = "primary",
                           size = "md",
                           className,
                           ...props
                       }: ButtonProps) => {
    const buttonClassName = [
        "button",
        `button_variant_${variant}`,
        `button_size_${size}`,
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return <button className={buttonClassName} {...props} />;
};