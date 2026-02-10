"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: React.ReactNode;
    shadow?: "none" | "sm" | "md" | "lg";
    padding?: "none" | "sm" | "md" | "lg";
    bordered?: boolean;
}

export const Card = ({
    heading,
    shadow = "sm",
    padding = "md",
    bordered = false,
    className,
    children,
    ...props
}: CardProps) => {
    const cardClassName = cn(
        "card",
        `card_shadow_${shadow}`,
        `card_p_${padding}`,
        { card_bordered: bordered },
        className
    );

    return (
        <div className={cardClassName} {...props}>
            {heading ? <div className="card_title">{heading}</div> : null}
            <div className="card_body">{children}</div>
        </div>
    );
};
