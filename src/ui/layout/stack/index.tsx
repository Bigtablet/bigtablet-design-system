"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type StackDirection = "vertical" | "horizontal";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackGap = 0 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48;
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * flex 방향
	 * @default "vertical"
	 */
	direction?: StackDirection;
	/**
	 * 아이템 간격 (px)
	 * @default 16
	 */
	gap?: StackGap;
	/** 교차축 정렬 (align-items) */
	align?: StackAlign;
	/** 주축 정렬 (justify-content) */
	justify?: StackJustify;
	/** flex-wrap */
	wrap?: StackWrap;
	/** 렌더링할 HTML 요소 */
	as?: React.ElementType;
}

/**
 * Flex 기반 1D 레이아웃 컨테이너.
 * 수직(column) / 수평(row) 스택 + 간격/정렬 제어.
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" gap={16} align="center">
 *   <Icon name="star" />
 *   <span>Rating</span>
 * </Stack>
 *
 * <Stack gap={24}>
 *   <Card />
 *   <Card />
 * </Stack>
 * ```
 */
export const Stack = ({
	direction = "vertical",
	gap = 16,
	align,
	justify,
	wrap,
	as: Tag = "div",
	className,
	children,
	style,
	...props
}: StackProps) => {
	return (
		<Tag
			className={cn(
				"stack",
				`stack_${direction}`,
				align && `stack_align_${align}`,
				justify && `stack_justify_${justify}`,
				wrap && `stack_wrap_${wrap.replace("-", "_")}`,
				className,
			)}
			style={{ "--stack-gap": `${gap}px`, ...style } as React.CSSProperties}
			{...props}
		>
			{children}
		</Tag>
	);
};
