"use client";

import "./style.scss";

export interface TopLoadingProps {
    /** 진행률 (0-100). undefined면 indeterminate 모드 */
    progress?: number;
    /** 로딩바 색상 (기본: primary) */
    color?: string;
    /** 로딩바 높이 (기본: 3px) */
    height?: number;
    /** 표시 여부 */
    isLoading?: boolean;
    /** 프로그레스 바의 접근성 레이블 (기본값: "Page loading") */
    ariaLabel?: string;
}

/**
 * 상단 로딩바를 렌더링한다.
 * 표시 여부와 진행률에 따라 determinate/indeterminate 상태를 구성한다.
 * @param props 로딩바 속성
 * @returns 렌더링된 로딩바 요소 또는 null
 */
export const TopLoading = ({
    progress,
    color,
    height = 3,
    isLoading = true,
    ariaLabel = "Page loading",
}: TopLoadingProps) => {
    if (!isLoading) return null;

    const isIndeterminate = progress === undefined;

    return (
        <div
            className="top_loading"
            style={{ height }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={isIndeterminate ? undefined : progress}
            aria-label={ariaLabel}
        >
            <div
                className={[
                    "top_loading_bar",
                    isIndeterminate && "top_loading_indeterminate",
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
