import * as React from "react";
import styles from "./style.module.scss";

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
        styles.card,
        styles[`shadow_${shadow}`],
        styles[`p_${padding}`],
        bordered && styles.bordered,
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={cls} {...props}>
            {heading ? <div className={styles.title}>{heading}</div> : null}
            <div className={styles.body}>{children}</div>
        </div>
    );
};
