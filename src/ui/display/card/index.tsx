import * as React from "react";
import "./style.scss";

/** Card UI */
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
                         bordered,
                         className,
                         children,
                         ...props
                     }: CardProps) => {
    const cls = [
        "card",
        `card--shadow-${shadow}`,
        `card--p-${padding}`,
        bordered && "card--bordered",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={cls} {...props}>
            {heading && <div className="card__title">{heading}</div>}
            <div className="card__body">{children}</div>
        </div>
    );
};