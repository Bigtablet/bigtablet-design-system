"use client";

import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
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
	/** 프로그레스 바의 접근성 레이블 */
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
	ariaLabel: ariaLabelProp,
}: TopLoadingProps) => {
	const t = useLocaleText();
	const ariaLabel = ariaLabelProp ?? t("topLoading.label");
	if (!isLoading) return null;

	const isIndeterminate = progress === undefined;
	// 0~100 으로 자른다 - 넘기면 aria-valuenow 와 폭이 범위를 넘었다 (#982)
	const value = isIndeterminate ? undefined : Math.min(100, Math.max(0, progress));

	return (
		<div
			className="top_loading"
			style={{ height }}
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={value}
			aria-label={ariaLabel}
		>
			<div
				className={cn("top_loading_bar", isIndeterminate && "top_loading_indeterminate")}
				style={{
					width: isIndeterminate ? undefined : `${value}%`,
					backgroundColor: color,
				}}
			/>
		</div>
	);
};
