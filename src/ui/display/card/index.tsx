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
                         bordered = false,
                         className,
                         children,
                         ...props
                     }: CardProps) => {
    const cls = [
        "card",
        `card_shadow_${shadow}`,
        `card_p_${padding}`,
        bordered ? "card_bordered" : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={cls} {...props}>
            {heading ? <div className="card_title">{heading}</div> : null}
            <div className="card_body">{children}</div>
        </div>
    );
};