"use client";

import "./style.scss";

export interface SpinnerProps {
	/** 스피너 크기(px) (기본값: 24) */
	size?: number;
	/** 스피너 접근성 레이블 (기본값: "Loading") */
	ariaLabel?: string;
}

/**
 * 스피너를 렌더링한다. 12개 bar 가 방사형으로 배치되어 페이드 인/아웃 으로 회전하는 효과.
 * Vercel/iOS 스타일 - 클래식 border-spin 보다 부드럽고 미니멀.
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
		>
			{Array.from({ length: 12 }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static 12 bars, index is stable key
				<span key={i} className="spinner_bar" aria-hidden="true" />
			))}
		</span>
	);
};
