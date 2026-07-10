"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import { Skeleton } from "../../feedback/skeleton";
import { Checkbox } from "../../forms/checkbox";
import "./style.scss";

export type TableSize = "sm" | "md" | "lg";

export type TableSortDirection = "asc" | "desc";

export interface TableSort {
	/** 정렬 중인 컬럼의 `TableColumn.key` */
	key: string;
	/** 정렬 방향 */
	direction: TableSortDirection;
}

export interface TableColumn<T extends object> {
	/** 컬럼 식별자 - `data[key]` 자동 렌더링에도 쓰임 */
	key: string;
	/** thead에 표시할 헤더 텍스트 */
	header: React.ReactNode;
	/** 셀 렌더 함수. 없으면 `item[key]` 자동 렌더 */
	render?: (item: T, index: number) => React.ReactNode;
	/** CSS width 값 (예: "120px", "20%") */
	width?: string;
	/** 정렬 (기본값: "left") */
	align?: "left" | "center" | "right";
	/** 정렬 가능한 컬럼 여부 (기본값: false). 클릭 시 `onSortChange` 발화 - 실제 정렬은 소비자가 수행 */
	sortable?: boolean;
}

/** `selectable` 시 `rowKey` 를 요구하기 위한 판별 유니온 */
type TableSelectionProps<T extends object> =
	| {
			/** 행 선택(체크박스 컬럼) 활성화 여부 */
			selectable: true;
			/** 행 고유 key 추출 함수 - `selectable` 사용 시 필수 */
			rowKey: (row: T) => string;
			/** 선택된 행 key 배열 (제어형) */
			selectedKeys?: string[];
			/** 선택 변경 콜백 */
			onSelectionChange?: (keys: string[]) => void;
	  }
	| {
			selectable?: false;
			rowKey?: (row: T) => string;
			selectedKeys?: string[];
			onSelectionChange?: (keys: string[]) => void;
	  };

export type TableProps<T extends object> = {
	/** 컬럼 정의 */
	columns: TableColumn<T>[];
	/** 표시할 데이터 배열 */
	data: T[];
	/** 행의 고유 key 추출 함수 */
	keyExtractor: (item: T, index: number) => string | number;
	/** 데이터 없을 때 표시 (기본값: "데이터가 없습니다") */
	emptyMessage?: React.ReactNode;
	/** 로딩 상태 - 헤더 유지, 바디만 스켈레톤 */
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
	/** clickable 행(onRowClick)의 aria-label - 스크린리더에 행의 동작을 알림 (예: (row) => `${row.name} 상세로 이동`) */
	rowClickAriaLabel?: (item: T, index: number) => string;
	/** 현재 정렬 상태 (제어형). `undefined` 는 정렬 없음 */
	sort?: TableSort;
	/** 정렬 가능한 헤더 클릭 시 발화 (none→asc→desc→none 순환). DS는 데이터를 직접 정렬하지 않음 - 정렬된 `data` 를 다시 전달해야 함 */
	onSortChange?: (sort: TableSort | undefined) => void;
	/** 전체 선택 체크박스 aria-label (기본값: "전체 선택") */
	selectAllAriaLabel?: string;
	/** 개별 행 선택 체크박스 aria-label (기본값: (i) => `${i+1}번째 행 선택`) */
	selectRowAriaLabel?: (index: number) => string;
} & TableSelectionProps<T>;

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
	rowClickAriaLabel,
	sort,
	onSortChange,
	selectAllAriaLabel = "전체 선택",
	selectRowAriaLabel = (index: number) => `${index + 1}번째 행 선택`,
	selectable = false,
	rowKey,
	selectedKeys,
	onSelectionChange,
}: TableProps<T>) => {
	const wrapperClassName = cn(
		"table_wrapper",
		`table_size_${size}`,
		stickyHeader && "table_sticky_header",
		className,
	);

	const isEmpty = !isLoading && data.length === 0;

	// ── Row selection ──────────────────────────────────────────────────────
	const getRowKey = (item: T, index: number) => rowKey?.(item) ?? String(index);
	const allRowKeys = selectable ? data.map((item, index) => getRowKey(item, index)) : [];
	const selectedSet = React.useMemo(() => new Set(selectedKeys ?? []), [selectedKeys]);
	const selectedCount = allRowKeys.filter((key) => selectedSet.has(key)).length;
	const isAllSelected = allRowKeys.length > 0 && selectedCount === allRowKeys.length;
	const isSomeSelected = selectedCount > 0 && !isAllSelected;

	const handleToggleAll = () => {
		const pageKeys = new Set(allRowKeys);
		const offPage = (selectedKeys ?? []).filter((k) => !pageKeys.has(k));
		// 현재 페이지가 모두 선택돼 있으면 해제, 아니면 전체 선택 - 다른 페이지 선택은 보존
		onSelectionChange?.(isAllSelected ? offPage : [...offPage, ...allRowKeys]);
	};

	const handleToggleRow = (key: string) => {
		const current = selectedKeys ?? [];
		const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
		onSelectionChange?.(next);
	};

	// ── Sort ───────────────────────────────────────────────────────────────
	const handleSortClick = (key: string) => {
		const next: TableSort | undefined =
			sort?.key !== key
				? { key, direction: "asc" }
				: sort.direction === "asc"
					? { key, direction: "desc" }
					: undefined;
		onSortChange?.(next);
	};

	return (
		<div className={wrapperClassName}>
			<table className="table" aria-label={ariaLabel}>
				<thead className="table_thead">
					<tr>
						{selectable && (
							<th scope="col" className="table_th table_th_checkbox">
								<Checkbox
									aria-label={selectAllAriaLabel}
									checked={isAllSelected}
									indeterminate={isSomeSelected}
									disabled={isLoading || allRowKeys.length === 0}
									onChange={handleToggleAll}
								/>
							</th>
						)}
						{columns.map((col) => {
							const isSortActive = Boolean(col.sortable) && sort?.key === col.key;
							const direction = isSortActive ? sort?.direction : undefined;
							const ariaSort = col.sortable
								? direction === "asc"
									? "ascending"
									: direction === "desc"
										? "descending"
										: "none"
								: undefined;

							return (
								<th
									key={col.key}
									scope="col"
									className={cn(
										"table_th",
										col.align && `table_align_${col.align}`,
										col.sortable && "table_th_sortable",
									)}
									style={{ width: col.width }}
									aria-sort={ariaSort}
								>
									{col.sortable ? (
										<button
											type="button"
											className="table_sort_button"
											onClick={() => handleSortClick(col.key)}
											disabled={isLoading}
										>
											<span className="table_sort_label">{col.header}</span>
											{direction === "asc" ? (
												<ArrowUp
													size={iconSize.sm}
													className="table_sort_icon table_sort_icon_active"
													aria-hidden="true"
												/>
											) : direction === "desc" ? (
												<ArrowDown
													size={iconSize.sm}
													className="table_sort_icon table_sort_icon_active"
													aria-hidden="true"
												/>
											) : (
												<ArrowUpDown
													size={iconSize.sm}
													className="table_sort_icon"
													aria-hidden="true"
												/>
											)}
										</button>
									) : (
										col.header
									)}
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody className="table_tbody">
					{isLoading
						? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable identity
								<tr key={rowIndex} className="table_row table_row_skeleton">
									{selectable && <td className="table_td table_td_checkbox" />}
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
						: data.map((item, rowIndex) => {
								const rowIdentity = selectable ? getRowKey(item, rowIndex) : undefined;
								const isSelected = rowIdentity !== undefined && selectedSet.has(rowIdentity);

								return (
									<tr
										key={keyExtractor(item, rowIndex)}
										className={cn(
											"table_row",
											hoverable && "table_row_hoverable",
											onRowClick && "table_row_clickable",
											isSelected && "table_row_selected",
										)}
										aria-selected={isSelected ? "true" : undefined}
										// 비-selectable clickable 행엔 role="button" 으로 기본 인터랙티브 affordance 제공
										// (aria-selected 가 없어 무효 조합 아님). selectable 행은 aria-selected 와 충돌하므로 role 생략 -
										// 체크박스가 1차 affordance. rowClickAriaLabel 로 서술형 접근성 이름을 덧붙일 수 있다.
										role={onRowClick && !selectable ? "button" : undefined}
										aria-label={
											onRowClick && rowClickAriaLabel ? rowClickAriaLabel(item, rowIndex) : undefined
										}
										tabIndex={onRowClick ? 0 : undefined}
										onClick={onRowClick ? () => onRowClick(item, rowIndex) : undefined}
										onKeyDown={
											onRowClick
												? (e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															onRowClick(item, rowIndex);
														}
													}
												: undefined
										}
									>
										{selectable && rowIdentity !== undefined && (
											<td
												className="table_td table_td_checkbox"
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<Checkbox
													aria-label={selectRowAriaLabel(rowIndex)}
													checked={isSelected}
													onChange={() => handleToggleRow(rowIdentity)}
												/>
											</td>
										)}
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
								);
							})}
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
