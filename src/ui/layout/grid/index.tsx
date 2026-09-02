"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import type { PolymorphicProps } from "../../../utils/polymorphic";
import "./style.scss";

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | "auto";
export type GridGap = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48;

interface GridOwnProps {
	/**
	 * 열 수. "auto" = auto-fill (minColWidth 사용)
	 * @default 3
	 */
	cols?: GridCols;
	/**
	 * auto-fill 모드일 때 최소 열 너비
	 * @default "280px"
	 */
	minColWidth?: string;
	/**
	 * 아이템 간격 (px). gap과 rowGap/colGap 동시 적용.
	 * @default 24
	 */
	gap?: GridGap;
	/** 행 간격 (gap을 override) */
	rowGap?: GridGap;
	/** 열 간격 (gap을 override) */
	colGap?: GridGap;
	/** 반응형 - compact(< 600px)에서 강제 1열 (기본 true) */
	singleColOnMobile?: boolean;
}

/**
 * Grid props. `as` 로 렌더 요소를 바꾼다 - `"main"`·`"ul"` 같은 태그든 `Link` 같은
 * 컴포넌트든, 그 요소의 props 가 타입에 그대로 따라온다.
 *
 * 예전에는 `as?: React.ElementType` 이라 요소만 갈리고 props 는 `div` 기준으로 고정돼,
 * `as="a"` 로 바꿔도 `href` 가 타입에 없었다.
 */
export type GridProps<T extends React.ElementType = "div"> = PolymorphicProps<T, GridOwnProps>;

/**
 * CSS Grid 기반 2D 레이아웃 컨테이너.
 * 고정 열 수 또는 auto-fill 반응형 그리드.
 *
 * @example
 * ```tsx
 * // 3열 고정
 * <Grid cols={3} gap={24}>
 *   <Card /><Card /><Card />
 * </Grid>
 *
 * // auto-fill (최소 280px)
 * <Grid cols="auto" minColWidth="280px" gap={16}>
 *   {products.map(p => <MediaCard key={p.id} {...p} />)}
 * </Grid>
 * ```
 */
export const Grid = <T extends React.ElementType = "div">({
	cols = 3,
	minColWidth = "280px",
	gap = 24,
	rowGap,
	colGap,
	singleColOnMobile = true,
	as,
	ref,
	className,
	children,
	style,
	...props
}: GridProps<T>) => {
	const gridTemplateColumns =
		cols === "auto" ? `repeat(auto-fill, minmax(${minColWidth}, 1fr))` : `repeat(${cols}, 1fr)`;

	const Tag = (as ?? "div") as React.ElementType;

	return (
		<Tag
			ref={ref}
			className={cn("grid_layout", singleColOnMobile && "grid_layout_mobile_single", className)}
			style={
				{
					"--grid-cols": gridTemplateColumns,
					"--grid-gap": `${gap}px`,
					"--grid-row-gap": rowGap != null ? `${rowGap}px` : undefined,
					"--grid-col-gap": colGap != null ? `${colGap}px` : undefined,
					...style,
				} as React.CSSProperties
			}
			{...props}
		>
			{children}
		</Tag>
	);
};
