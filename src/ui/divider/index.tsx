"use client";

import type * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
	/** 구분선 두께 (기본값: "standard") */
	weight?: "standard" | "heavy";
}

/**
 * 구분선 컴포넌트를 렌더링한다.
 * 콘텐츠 영역을 시각적으로 분리하는 수평 구분선을 표시한다.
 * @param props 구분선 속성
 * @returns 렌더링된 구분선 UI
 */
export const Divider = ({
	weight = "standard",
	className,
	...props
}: DividerProps) => {
	const dividerClassName = cn(
		"divider",
		`divider_weight_${weight}`,
		className,
	);

	return <hr className={dividerClassName} {...props} />;
};
