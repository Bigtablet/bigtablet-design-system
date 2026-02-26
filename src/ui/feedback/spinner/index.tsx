"use client";

import "./style.scss";

export interface SpinnerProps {
    /** 스피너 크기(px) (기본값: 24) */
    size?: number;
    /** 스피너 접근성 레이블 (기본값: "Loading") */
    ariaLabel?: string;
}

/**
 * 스피너를 렌더링한다.
 * 크기와 접근성 레이블을 적용한 뒤 상태 표시용 요소를 반환한다.
 * @param props 스피너 속성
 * @returns 렌더링된 스피너 요소
 */
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
