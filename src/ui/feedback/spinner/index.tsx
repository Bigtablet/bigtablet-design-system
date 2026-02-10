"use client";

import "./style.scss";

export interface SpinnerProps {
    size?: number;
    /** Accessible label for the spinner (default: "Loading") */
    ariaLabel?: string;
}

export const Spinner = ({ size = 24, ariaLabel = "Loading" }: SpinnerProps) => {
    return (
        <span
            className="spinner"
            style={{ width: size, height: size }}
            role="status"
            aria-label={ariaLabel}
        />
    );
};
