"use client";

import { Check } from "lucide-react";
import type * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

/** 단계의 진행 상태. `current` 와의 인덱스 비교로 파생된다 - 소비자가 따로 관리하지 않는다 */
export type StepperStatus = "done" | "active" | "pending";
export type StepperOrientation = "horizontal" | "vertical";

export interface StepperStep {
	/** 목록 키 */
	id: string | number;
	/** 단계 이름. 인라인 내용만 - 클릭 가능한 단계는 `<button>` 안에 그려진다 */
	label: React.ReactNode;
	/** 이름 아래 짧은 설명. 인라인 내용만 */
	description?: React.ReactNode;
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "onClick"> {
	/** 순서대로 */
	steps: StepperStep[];
	/** 현재 단계 인덱스 (0-based). 앞은 `done`, 뒤는 `pending` 이 된다 */
	current: number;
	/** 배치 방향 (기본값: "horizontal") */
	orientation?: StepperOrientation;
	/**
	 * 주면 **지나간 단계만** 버튼이 된다. 현재·이후 단계는 그대로 텍스트다 - 아직 오지 않은
	 * 단계로 건너뛰는 것은 그 사이 폼 검증을 우회하는 일이라 컴포넌트가 열지 않는다.
	 */
	onStepClick?: (index: number, step: StepperStep) => void;
	/** 루트 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLOListElement>;
}

/**
 * 다단계 폼의 진행 표시. 가입·온보딩·결제처럼 "몇 단계 중 어디" 를 보여 준다.
 *
 * `<ol>` 로 렌더한다 - 순서가 있는 목록이고 스크린리더가 "3개 중 2번째" 를 읽어 준다. 현재 단계는
 * `aria-current="step"`, 지나간 단계는 시각 숨김 텍스트 "완료" 를 함께 갖는다. 색·모양만으로
 * 상태를 전달하지 않는다 (WCAG 1.4.1) - `done` 은 체크, `active`·`pending` 은 번호이고 `pending`
 * 은 빈 원이다.
 *
 * `Timeline` 과의 경계: 시간 순 **기록**(주문 추적, 활동 로그)은 `Timeline`, 사용자가 **밟아
 * 가는 절차**는 `Stepper`.
 *
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { id: "account", label: "계정" },
 *     { id: "profile", label: "프로필", description: "이름과 소속" },
 *     { id: "done", label: "완료" },
 *   ]}
 *   current={1}
 *   onStepClick={setStep}
 * />
 * ```
 */
export const Stepper = ({
	steps,
	current,
	orientation = "horizontal",
	onStepClick,
	className,
	ref,
	...props
}: StepperProps) => {
	const t = useLocaleText();

	return (
		<ol ref={ref} className={cn("stepper", `stepper_${orientation}`, className)} {...props}>
			{steps.map((step, index) => {
				const status: StepperStatus =
					index < current ? "done" : index === current ? "active" : "pending";
				// 지나간 단계만 되돌아갈 수 있다. 앞으로 건너뛰는 버튼은 만들지 않는다.
				const clickable = !!onStepClick && status === "done";
				const statusText =
					status === "done" ? t("stepper.done") : status === "active" ? t("stepper.current") : null;

				const inner = (
					<>
						<span className="stepper_indicator" aria-hidden="true">
							{status === "done" ? <Check size={iconSize.sm} /> : index + 1}
						</span>
						<span className="stepper_text">
							<span className="stepper_label">
								{step.label}
								{/* 색·체크 모양은 보조기술에 닿지 않는다 - 상태를 말로도 붙인다. */}
								{statusText && <span className="stepper_sr_only"> {statusText}</span>}
							</span>
							{step.description !== undefined && step.description !== null && (
								<span className="stepper_description">{step.description}</span>
							)}
						</span>
					</>
				);

				return (
					<li
						key={step.id}
						className={cn("stepper_step", `stepper_step_${status}`)}
						aria-current={status === "active" ? "step" : undefined}
					>
						{clickable ? (
							<button
								type="button"
								className="stepper_content stepper_button"
								onClick={() => onStepClick?.(index, step)}
							>
								{inner}
							</button>
						) : (
							<span className="stepper_content">{inner}</span>
						)}
					</li>
				);
			})}
		</ol>
	);
};

Stepper.displayName = "Stepper";
