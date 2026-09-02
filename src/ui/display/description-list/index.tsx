"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface DescriptionListItem {
	/** 항목 이름 */
	label: React.ReactNode;
	/** 항목 값 */
	value: React.ReactNode;
	/** 이 항목만 값을 한 줄 전체로 (긴 주소·메모) */
	full?: boolean;
}

export type DescriptionListLayout = "row" | "stack";

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
	/** 이름·값 쌍 */
	items: DescriptionListItem[];
	/**
	 * 배치 (기본값: "row").
	 * - `row`: 이름 왼쪽, 값 오른쪽. 좁은 화면에서는 자동으로 쌓인다
	 * - `stack`: 항상 이름 위, 값 아래
	 */
	layout?: DescriptionListLayout;
	/** 항목 사이 구분선 (기본값: false) */
	divided?: boolean;
	/** 루트 요소 ref (React 19 ref-as-prop) */
	ref?: React.Ref<HTMLDListElement>;
}

/**
 * 이름·값 쌍의 목록. 상세 보기 화면의 기본 골격이다.
 *
 * `<dl>` · `<dt>` · `<dd>` 로 렌더한다 - 손으로 만들면 거의 항상 `<div>` 두 개가 되고, 그러면
 * 스크린리더에 이름과 값의 관계가 남지 않는다. 이름만 읽고 값을 따로 읽어 주는 목록이 된다.
 *
 * `row` 는 좁은 화면에서 스스로 쌓인다 - 이름과 값을 한 줄에 억지로 붙이면 값이 잘린다.
 *
 * @example
 * ```tsx
 * <DescriptionList
 *   divided
 *   items={[
 *     { label: "주문번호", value: "#1024" },
 *     { label: "결제수단", value: "신용카드" },
 *     { label: "배송지", value: "서울시 …", full: true },
 *   ]}
 * />
 * ```
 */
export const DescriptionList = ({
	items,
	layout = "row",
	divided = false,
	className,
	ref,
	...props
}: DescriptionListProps) => (
	<dl
		ref={ref}
		className={cn(
			"description_list",
			`description_list_layout_${layout}`,
			{ description_list_divided: divided },
			className,
		)}
		{...props}
	>
		{items.map((item, index) => (
			<div
				/* biome-ignore lint/suspicious/noArrayIndexKey: 라벨은 중복될 수 있고(같은 이름의 항목) 값은 ReactNode 라 키로 쓸 수 없다 */
				key={index}
				className={cn("description_list_item", { description_list_item_full: item.full })}
			>
				<dt className="description_list_label">{item.label}</dt>
				<dd className="description_list_value">{item.value}</dd>
			</div>
		))}
	</dl>
);
