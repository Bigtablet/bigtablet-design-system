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
 * `totalSteps + 1` 개 dot (체크포인트) + 진행 바. Dot `i` 는 `i <= currentStep` 이면 채워짐.
 * @param props 진행 표시기 속성
 * @returns 렌더링된 진행 표시기 요소
 */
export const LinearProgress = ({
	totalSteps,
	currentStep,
	className,
	...props
}: LinearProgressProps) => {
	const clampedStep = totalSteps > 0 ? Math.min(Math.max(currentStep, 0), totalSteps) : 0;
	const percent = totalSteps > 0 ? (clampedStep / totalSteps) * 100 : 0;
	const dotCount = totalSteps + 1;

	return (
		<div
			className={cn("linear_progress", className)}
			role="progressbar"
			aria-valuenow={currentStep}
			aria-valuemin={0}
			aria-valuemax={totalSteps}
			{...props}
		>
			<div className="linear_progress_track" />
			<div className="linear_progress_indicator" style={{ width: `${percent}%` }} />
			{Array.from({ length: dotCount }, (_, i) => (
				<span
					key={i}
					className={cn(
						"linear_progress_step",
						i <= clampedStep && "linear_progress_step_done",
					)}
					aria-hidden="true"
				/>
			))}
		</div>
	);
};
