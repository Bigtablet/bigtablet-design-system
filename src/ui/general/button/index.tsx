"use client"

import * as React from "react";
import "./style.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = ({
                           variant = "primary",
                           size = "md",
                           className,
                           ...props
                       }: ButtonProps) => {
    const classes = ["btn", `btn--${variant}`, `btn--${size}`, className]
        .filter(Boolean)
        .join(" ");

    return <button className={classes} {...props} />;
}