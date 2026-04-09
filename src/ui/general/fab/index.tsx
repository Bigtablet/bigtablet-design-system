"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type FABVariant = "primary" | "additive";

export interface FABProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** FAB 스타일 변형 (기본값: "primary") */
	variant?: FABVariant;
	/** 표시할 아이콘 */
	icon: React.ReactNode;
}

/**
 * FAB(Floating Action Button)을 렌더링한다.
 * 화면에서 가장 중요한 단일 액션을 강조하는 플로팅 버튼이다.
 * @param props FAB 속성
 * @returns 렌더링된 FAB 요소
 */
export const FAB = ({
	variant = "primary",
	icon,
	className,
	...props
}: FABProps) => {
	const fabClassName = cn(
		"fab",
		`fab_variant_${variant}`,
		className,
	);

	return (
		<button className={fabClassName} {...props}>
			<span className="fab_icon" aria-hidden="true">
				{icon}
			</span>
		</button>
	);
};
