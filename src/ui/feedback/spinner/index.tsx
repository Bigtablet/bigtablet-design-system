"use client";

import styles from "./style.module.scss";

export interface SpinnerProps {
    size?: number;
}

export const Spinner = ({ size = 24 }: SpinnerProps) => {
    return (
        <span
            className={styles.spinner}
            style={{ width: size, height: size }}
            role="status"
            aria-label="로딩 중"
        />
    );
};
