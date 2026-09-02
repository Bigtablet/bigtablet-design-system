"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

/** 변화량의 색. 방향(↑↓)과 좋음/나쁨은 다르다 - "재고 부족 +2" 는 오르지만 나쁘다 */
export type StatDeltaTone = "positive" | "negative" | "neutral";

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** 지표 이름 */
	label: React.ReactNode;
	/** 지표 값. 숫자는 `tabular-nums` 로 폭이 고정된다 */
	value: React.ReactNode;
	/** 값 아래 변화량 (예: `+12%`) */
	delta?: React.ReactNode;
	/**
	 * 변화량의 색 (기본값: "neutral").
	 * 방향이 아니라 **좋음/나쁨**을 고른다 - 재고 부족이 늘어난 것은 `negative` 다.
	 */
	deltaTone?: StatDeltaTone;
	/** 라벨 왼쪽 장식 아이콘 */
	icon?: React.ReactNode;
	/** 루트 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLDivElement>;
}

/**
 * 대시보드의 지표 한 칸. 이름 · 값 · 변화량.
 *
 * 화면마다 `<p style={{ fontSize: 24, fontWeight: 700 }}>` 로 다시 만들던 층이다. 같은
 * 대시보드 안에서 지표 값이 서로 다른 크기로 보이는 것이 그 결과였다.
 *
 * **값은 `tabular-nums` 로 렌더한다.** 비례 숫자는 자릿수마다 폭이 달라, 여러 지표를 나란히
 * 두거나 값이 갱신될 때 숫자가 좌우로 흔들린다. 이걸 화면마다 정하게 두면 대부분 빠진다.
 *
 * 표면(테두리·여백)은 `Card` 가 소유한다 - 카드로 감싸거나 그냥 두면 된다.
 *
 * @example
 * ```tsx
 * <Card bordered padding="lg">
 *   <Stat label="오늘 매출" value="₩1,284,000" delta="+12%" deltaTone="positive" />
 * </Card>
 * ```
 */
export const Stat = ({
	label,
	value,
	delta,
	deltaTone = "neutral",
	icon,
	className,
	ref,
	...props
}: StatProps) => (
	<div ref={ref} className={cn("stat", className)} {...props}>
		<div className="stat_label">
			{icon && (
				<span className="stat_icon" aria-hidden="true">
					{icon}
				</span>
			)}
			{label}
		</div>
		<div className="stat_value">{value}</div>
		{delta && <div className={cn("stat_delta", `stat_delta_${deltaTone}`)}>{delta}</div>}
	</div>
);
