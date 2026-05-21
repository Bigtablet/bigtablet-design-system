"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import { Skeleton } from "../../feedback/skeleton";
import "./style.scss";

export type TableSize = "sm" | "md" | "lg";

export interface TableColumn<T extends object> {
	/** 컬럼 식별자 — `data[key]` 자동 렌더링에도 쓰임 */
	key: string;
	/** thead에 표시할 헤더 텍스트 */
	header: React.ReactNode;
	/** 셀 렌더 함수. 없으면 `item[key]` 자동 렌더 */
	render?: (item: T, index: number) => React.ReactNode;
	/** CSS width 값 (예: "120px", "20%") */
	width?: string;
	/** 정렬 (기본값: "left") */
	align?: "left" | "center" | "right";
}

export interface TableProps<T extends object> {
	/** 컬럼 정의 */
	columns: TableColumn<T>[];
	/** 표시할 데이터 배열 */
	data: T[];
	/** 행의 고유 key 추출 함수 */
	keyExtractor: (item: T, index: number) => string | number;
	/** 데이터 없을 때 표시 (기본값: "데이터가 없습니다") */
	emptyMessage?: React.ReactNode;
	/** 로딩 상태 — 헤더 유지, 바디만 스켈레톤 */
	isLoading?: boolean;
	/** 로딩 시 스켈레톤 행 개수 (기본값: 5) */
	skeletonRows?: number;
	/** 테이블 크기 (기본값: "md") */
	size?: TableSize;
	/** 행 hover 강조 (기본값: true) */
	hoverable?: boolean;
	/** thead sticky 고정 (기본값: false) */
	stickyHeader?: boolean;
	/** 스크린 리더용 테이블 레이블 */
	ariaLabel?: string;
	/** 루트 wrapper에 추가할 className */
	className?: string;
	/** 행 클릭 콜백 */
	onRowClick?: (item: T, index: number) => void;
}

/**
 * 데이터 테이블을 렌더링한다. 로딩 중에는 헤더 유지, 바디에 스켈레톤 행을 표시한다.
 * @param props 테이블 속성
 * @returns 테이블 컴포넌트
 */
export const Table = <T extends object>({
	columns,
	data,
	keyExtractor,
	emptyMessage = "데이터가 없습니다",
	isLoading = false,
	skeletonRows = 5,
	size = "md",
	hoverable = true,
	stickyHeader = false,
	ariaLabel,
	className,
	onRowClick,
}: TableProps<T>) => {
	const wrapperClassName = cn(
		"table_wrapper",
		`table_size_${size}`,
		stickyHeader && "table_sticky_header",
		className,
	);

	const isEmpty = !isLoading && data.length === 0;

	return (
		<div className={wrapperClassName}>
			<table className="table" aria-label={ariaLabel}>
				<thead className="table_thead">
					<tr>
						{columns.map((col) => (
							<th
								key={col.key}
								scope="col"
								className={cn("table_th", col.align && `table_align_${col.align}`)}
								style={{ width: col.width }}
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="table_tbody">
					{isLoading
						? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable identity
								<tr key={rowIndex} className="table_row table_row_skeleton">
									{columns.map((col) => (
										<td
											key={col.key}
											className={cn("table_td", col.align && `table_align_${col.align}`)}
											style={{ width: col.width }}
										>
											<Skeleton variant="text" />
										</td>
									))}
								</tr>
							))
						: data.map((item, rowIndex) => (
								<tr
									key={keyExtractor(item, rowIndex)}
									className={cn(
										"table_row",
										hoverable && "table_row_hoverable",
										onRowClick && "table_row_clickable",
									)}
									onClick={onRowClick ? () => onRowClick(item, rowIndex) : undefined}
								>
									{columns.map((col) => (
										<td
											key={col.key}
											className={cn("table_td", col.align && `table_align_${col.align}`)}
											style={{ width: col.width }}
										>
											{(() => {
												if (col.render) return col.render(item, rowIndex);
												const value = (item as Record<string, unknown>)[col.key];
												return value === null || value === undefined || value === ""
													? "-"
													: String(value);
											})()}
										</td>
									))}
								</tr>
							))}
				</tbody>
			</table>

			{isEmpty && (
				<div className="table_empty" role="status">
					{emptyMessage}
				</div>
			)}
		</div>
	);
};
