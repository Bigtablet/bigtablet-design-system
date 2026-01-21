"use client";

import styles from "./style.module.scss";

export interface TopLoadingProps {
    /** 진행률 (0-100). undefined면 indeterminate 모드 */
    progress?: number;
    /** 로딩바 색상 (기본: primary) */
    color?: string;
    /** 로딩바 높이 (기본: 3px) */
    height?: number;
    /** 표시 여부 */
    isLoading?: boolean;
}

export const TopLoading = ({
    progress,
    color,
    height = 3,
    isLoading = true,
}: TopLoadingProps) => {
    if (!isLoading) return null;

    const isIndeterminate = progress === undefined;

    return (
        <div
            className={styles.top_loading}
            style={{ height }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={isIndeterminate ? undefined : progress}
            aria-label="페이지 로딩 중"
        >
            <div
                className={[
                    styles.bar,
                    isIndeterminate && styles.indeterminate,
                ]
                    .filter(Boolean)
                    .join(" ")}
                style={{
                    width: isIndeterminate ? undefined : `${progress}%`,
                    backgroundColor: color,
                }}
            />
        </div>
    );
};
