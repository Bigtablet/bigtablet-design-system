"use client";

import * as React from "react";
import styles from "./style.module.scss";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    width?: string;
}

export const Button = ({
                           variant = "primary",
                           size = "md",
                           width = "100%",
                           className,
                           ...props
                       }: ButtonProps) => {
    const buttonClassName = [
        styles.button,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return <button className={buttonClassName} style={{width}} {...props} />;
};
