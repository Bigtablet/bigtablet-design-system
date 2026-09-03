"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import type { PolymorphicProps } from "../../../utils/polymorphic";
import "./style.scss";

export type StackDirection = "vertical" | "horizontal";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackGap = 0 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48;
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";

interface StackOwnProps {
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
}

/**
 * Stack props. `as` 로 렌더 요소를 바꾼다 - `"main"`·`"ul"` 같은 태그든 `Link` 같은
 * 컴포넌트든, 그 요소의 props 가 타입에 그대로 따라온다.
 *
 * 예전에는 `as?: React.ElementType` 이라 요소만 갈리고 props 는 `div` 기준으로 고정돼,
 * `as="a"` 로 바꿔도 `href` 가 타입에 없었다.
 */
export type StackProps<T extends React.ElementType = "div"> = PolymorphicProps<T, StackOwnProps>;

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
export const Stack = <T extends React.ElementType = "div">({
	direction = "vertical",
	gap = 16,
	align,
	justify,
	wrap,
	as,
	ref,
	className,
	children,
	style,
	...props
}: StackProps<T>) => {
	const Tag = (as ?? "div") as React.ElementType;

	return (
		<Tag
			ref={ref}
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
