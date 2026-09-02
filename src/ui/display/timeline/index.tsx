"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

/** 항목의 진행 상태. 색과 연결선의 진하기를 정한다 */
export type TimelineStatus = "done" | "active" | "pending";

export interface TimelineItem {
	/** 목록 키 */
	id: string | number;
	/** 항목 제목 */
	title: React.ReactNode;
	/** 제목 오른쪽의 시각 */
	time?: React.ReactNode;
	/** 제목 아래 설명 */
	description?: React.ReactNode;
	/** 진행 상태 (기본값: "pending") */
	status?: TimelineStatus;
	/** 인디케이터 안에 넣을 아이콘. 없으면 점 */
	icon?: React.ReactNode;
	/** 항목 아래에 붙일 임의 내용 (첨부, 액션 버튼 등) */
	children?: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
	/** 위에서 아래로 흐르는 순서대로 */
	items: TimelineItem[];
	/** 루트 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLOListElement>;
}

/**
 * 시간 순서로 흐르는 진행 상황. 주문 추적, 승인 단계, 활동 기록.
 *
 * `<ol>` 로 렌더한다 - 순서가 있는 목록이고, 스크린리더가 "N개 중 3번째" 를 읽어 준다.
 * `<div>` 로 만들면 그 순서 정보가 남지 않는다.
 *
 * 연결선은 마지막 항목에서 끊는다. 손으로 만들면 마지막 점 아래로 선이 흘러나오거나,
 * `isLast` 판정을 소비자가 매번 다시 쓴다.
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     { id: 1, title: "주문 접수", time: "오후 1:32", status: "done" },
 *     { id: 2, title: "배송 출발", time: "오후 1:48", status: "active", icon: <Truck size={16} /> },
 *     { id: 3, title: "배송 완료", time: "예상 오후 2:05" },
 *   ]}
 * />
 * ```
 */
export const Timeline = ({ items, className, ref, ...props }: TimelineProps) => (
	<ol ref={ref} className={cn("timeline", className)} {...props}>
		{items.map((item) => {
			const status = item.status ?? "pending";
			return (
				<li key={item.id} className={cn("timeline_item", `timeline_item_${status}`)}>
					<span className="timeline_indicator" aria-hidden="true">
						{item.icon ?? <span className="timeline_dot" />}
					</span>
					<div className="timeline_body">
						<div className="timeline_head">
							<span className="timeline_title">{item.title}</span>
							{item.time && <span className="timeline_time">{item.time}</span>}
						</div>
						{item.description && <p className="timeline_description">{item.description}</p>}
						{item.children}
					</div>
				</li>
			);
		})}
	</ol>
);
