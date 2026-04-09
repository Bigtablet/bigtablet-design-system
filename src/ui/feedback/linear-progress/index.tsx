"use client";

import { cn } from "../../../utils";
import "./style.scss";

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 전체 단계 수 */
	totalSteps: number;
	/** 현재 단계 (0부터 totalSteps까지) */
	currentStep: number;
	/** 접근성 레이블 (스크린 리더용) */
	"aria-label": string;
}

/**
 * 선형 진행 표시기를 렌더링한다.
 * 현재 단계와 전체 단계를 기반으로 진행률을 시각적으로 표시한다.
 * @param props 진행 표시기 속성
 * @returns 렌더링된 진행 표시기 요소
 */
export const LinearProgress = ({
	totalSteps,
	currentStep,
	className,
	...props
}: LinearProgressProps) => {
	const percent =
		totalSteps > 0
			? Math.min(Math.max(currentStep / totalSteps, 0), 1) * 100
			: 0;

	return (
		<div
			className={cn("linear_progress", className)}
			role="progressbar"
			aria-valuenow={currentStep}
			aria-valuemin={0}
			aria-valuemax={totalSteps}
			{...props}
		>
			<div
				className="linear_progress_indicator"
				style={{ width: `${percent}%` }}
			/>
		</div>
	);
};
