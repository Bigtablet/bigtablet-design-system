"use client";

import { Search } from "lucide-react";
import type * as React from "react";
import { useEffect, useId, useState } from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import { EmptyState } from "../../feedback/empty-state";
import { ErrorState } from "../../feedback/error-state";
import { TextField } from "../../forms/textfield";
import { Button } from "../../general/button";
import { Pagination } from "../../navigation/pagination";
import { useLocaleText } from "../../system/locale-provider";
import { Table, type TableColumn, type TableSort } from "../table";
import "./style.scss";

/**
 * 목록 화면이 데이터를 받는 모양.
 *
 * TanStack Query 등의 결과를 그대로 넣을 수 있게 필드 이름을 맞췄지만, 어떤 라이브러리도
 * import 하지 않는다 - DS 가 특정 데이터 계층에 묶이면 안 된다.
 */
export interface DataViewQuery<T> {
	/** 현재 페이지에 표시할 행 */
	data: T[] | undefined;
	/** 첫 로딩 여부. true 면 Table 의 스켈레톤이 나온다 */
	isLoading?: boolean;
	/** 실패. 지정하면 표 대신 ErrorState 가 나온다 */
	error?: unknown;
	/** 재시도. 지정하면 ErrorState 에 버튼이 붙는다 */
	refetch?: () => void;
}

export interface DataViewToolbar {
	/** 검색 입력 표시 여부 */
	search?: boolean;
	/** 검색어 (제어형) */
	searchValue?: string;
	/** 검색어 변경 콜백 */
	onSearchChange?: (value: string) => void;
	/** 검색 입력 placeholder */
	searchPlaceholder?: string;
	/** 검색 왼쪽에 놓을 필터 컨트롤 (`Dropdown` 등) */
	filters?: React.ReactNode;
}

export interface DataViewSelectionAction {
	/** 버튼 라벨 */
	label: string;
	/** 선택된 key 를 받아 실행 */
	onRun: (keys: string[]) => void;
	/** 위험한 액션(삭제 등) - 빨간 강조 */
	danger?: boolean;
}

export interface DataViewPagination {
	/** 현재 페이지 (1-based) */
	page: number;
	/** 전체 페이지 수 */
	totalPages: number;
	/**
	 * 한 쪽에 몇 행인지. 주면 행 선택 체크박스의 기본 라벨이 쪽마다 1 부터 다시 시작하지 않고
	 * 전체 순번을 쓴다 - 없으면 3쪽의 체크박스도 1쪽과 같은 "1번째 행 선택" 으로 읽힌다.
	 */
	pageSize?: number;
	/** 페이지 변경 콜백 */
	onPageChange: (page: number) => void;
}

export interface DataViewProps<T extends object>
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** 데이터와 그 상태 */
	query: DataViewQuery<T>;
	/** 표 컬럼 정의 */
	columns: TableColumn<T>[];
	/** 행 고유 key */
	rowKey: (row: T) => string;
	/** 상단 검색·필터 줄 */
	toolbar?: DataViewToolbar;
	/**
	 * 행을 선택했을 때 나타나는 액션. 지정하면 표에 체크박스 컬럼이 붙는다.
	 * 선택 상태는 `DataView` 가 들고 있다.
	 */
	selectionActions?: DataViewSelectionAction[];
	/** 하단 페이지네이션 */
	pagination?: DataViewPagination;
	/** 데이터가 비었을 때. 미지정 시 기본 `EmptyState` */
	empty?: React.ReactNode;
	/** 정렬 상태 (제어형) */
	sort?: TableSort;
	/** 정렬 변경 콜백 */
	onSortChange?: (sort: TableSort | undefined) => void;
	/** 행 클릭 */
	onRowClick?: (row: T, index: number) => void;
	/** 표의 접근성 이름 */
	ariaLabel?: string;
	/** 선택 액션 줄의 안내 문구 (기본값: (n) => `${n}개 선택됨`) */
	selectionSummary?: (count: number) => string;
	/** 선택 해제 버튼 라벨 */
	clearSelectionLabel?: string;
	/** 실패 상태 제목 */
	errorTitle?: string;
	/** 재시도 버튼 라벨 */
	retryLabel?: string;
}

/**
 * 목록 화면 한 벌 - 검색·필터, 표, 선택 액션, 페이지네이션, 그리고 **네 상태 분기**.
 *
 * `Table` 은 정렬·선택·스켈레톤을 정직하게 처리하지만 목록 "화면" 은 그 위아래가 더 있다.
 * 그 조합이 없어서 화면마다 다시 만들어졌고, 특히 **에러 상태를 빠뜨린 화면**이 생겼다.
 * 여기서는 loading / error / empty / data 가 한 곳에서 갈린다.
 *
 * 새로 그리는 것은 거의 없다 - `Table`·`Pagination`·`EmptyState`·`ErrorState`·`TextField`·
 * `Button` 을 그대로 쓴다.
 *
 * @example
 * ```tsx
 * <DataView
 *   query={usersQuery}
 *   columns={columns}
 *   rowKey={(u) => u.id}
 *   toolbar={{ search: true, searchValue: q, onSearchChange: setQ }}
 *   selectionActions={[{ label: "삭제", danger: true, onRun: removeRows }]}
 *   pagination={{ page, totalPages, onPageChange: setPage }}
 * />
 * ```
 */
export const DataView = <T extends object>({
	query,
	columns,
	rowKey,
	toolbar,
	selectionActions,
	pagination,
	empty,
	sort,
	onSortChange,
	onRowClick,
	ariaLabel,
	selectionSummary: selectionSummaryProp,
	clearSelectionLabel: clearSelectionLabelProp,
	errorTitle: errorTitleProp,
	retryLabel: retryLabelProp,
	className,
	...props
}: DataViewProps<T>) => {
	const t = useLocaleText();
	const selectionSummary =
		selectionSummaryProp ?? ((count: number) => t("dataView.selectionSummary", { count }));
	const clearSelectionLabel = clearSelectionLabelProp ?? t("dataView.clearSelection");
	const errorTitle = errorTitleProp ?? t("dataView.errorTitle");
	const retryLabel = retryLabelProp ?? t("dataView.retry");
	const searchLabel = toolbar?.searchPlaceholder ?? t("dataView.search");
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const selectionBarId = useId();

	const selectable = !!selectionActions?.length;
	const rows = query.data ?? [];

	// 목록이 바뀌면 화면에 없는 선택은 버린다. 안 버리면 검색어를 바꾼 뒤에도 액션 줄이
	// "1개 선택됨" 을 유지하고, 삭제를 누르면 **보이지 않는 행**이 지워진다. 체크된 칸이
	// 하나도 없는 화면에서 벌어지는 일이라 사용자는 무엇이 지워졌는지 알 수 없다.
	//
	// 페이지네이션이 있으면 건드리지 않는다. 그때는 화면 밖 선택이 정상이고(서버 페이지네이션에서
	// 여러 쪽에 걸쳐 고르는 것이 Table 이 의도적으로 지원하는 동작이다) 쪽을 넘길 때마다 선택이
	// 사라지면 기능 자체가 없어진다.
	const hasPagination = !!pagination;
	// 쪽 정보가 있으면 행 번호를 전체 순번으로 옮긴다. `pageSize` 없이는 계산할 수 없으므로
	// 그때는 예전처럼 쪽마다 1 부터 시작한다.
	const rowIndexOffset =
		pagination?.pageSize !== undefined
			? Math.max(0, (pagination.page - 1) * pagination.pageSize)
			: 0;
	// 문자열로 비교한다 - rows·rowKey 를 그대로 의존성에 두면 인라인 배열·화살표 때문에
	// 매 렌더 새 정체가 되어 효과가 계속 돈다. 구분자를 끼워 잇는 방식은 key 안에 그 문자가
	// 들어가면 서로 다른 목록이 같은 서명이 되므로 길이까지 보존하는 JSON 으로 만든다.
	// 정리가 필요 없는 경우에는 아예 계산하지 않는다 - 행이 많은 표에서 매 렌더 O(n) 이다.
	const needsSelectionPrune = selectable && !hasPagination;
	const visibleKeySignature = needsSelectionPrune ? JSON.stringify(rows.map(rowKey)) : "";
	// biome-ignore lint/correctness/useExhaustiveDependencies: rows·rowKey 대신 위 signature 로 내용 변화만 본다
	useEffect(() => {
		if (!needsSelectionPrune) return;
		const visible = new Set(rows.map(rowKey));
		setSelectedKeys((prev) => {
			const next = prev.filter((key) => visible.has(key));
			return next.length === prev.length ? prev : next;
		});
	}, [visibleKeySignature, needsSelectionPrune]);
	// 로딩 중에는 Table 이 스켈레톤을 그리므로 빈 상태로 넘기지 않는다. 셋을 동시에 보면
	// 화면이 "없음 -> 스켈레톤 -> 데이터" 로 두 번 깜빡인다.
	const showEmpty = !query.isLoading && !query.error && rows.length === 0;

	if (query.error) {
		return (
			<div className={cn("data_view", className)} {...props}>
				<ErrorState
					variant="widget"
					title={errorTitle}
					action={
						query.refetch ? (
							<Button size="sm" variant="outline" onClick={query.refetch}>
								{retryLabel}
							</Button>
						) : undefined
					}
				/>
			</div>
		);
	}

	return (
		<div className={cn("data_view", className)} {...props}>
			{toolbar && (
				<div className="data_view_toolbar">
					{toolbar.search && (
						<div className="data_view_search">
							<TextField
								fullWidth
								size="sm"
								type="search"
								value={toolbar.searchValue}
								onValueChange={toolbar.onSearchChange}
								placeholder={searchLabel}
								aria-label={searchLabel}
								leadingIcon={<Search size={iconSize.sm} />}
							/>
						</div>
					)}
					{toolbar.filters && <div className="data_view_filters">{toolbar.filters}</div>}
				</div>
			)}

			{selectable && selectedKeys.length > 0 && (
				// `role="status"` - 선택이 바뀔 때마다 스크린리더가 개수를 읽는다. 액션 줄이
				// 시각적으로만 나타나면 키보드 사용자는 무엇이 가능해졌는지 알 수 없다.
				<div id={selectionBarId} className="data_view_selection" role="status">
					<span className="data_view_selection_count">{selectionSummary(selectedKeys.length)}</span>
					<div className="data_view_selection_actions">
						{selectionActions?.map((action) => (
							<Button
								key={action.label}
								size="sm"
								variant="outline"
								danger={action.danger}
								onClick={() => action.onRun(selectedKeys)}
							>
								{action.label}
							</Button>
						))}
						<Button size="sm" variant="text" onClick={() => setSelectedKeys([])}>
							{clearSelectionLabel}
						</Button>
					</div>
				</div>
			)}

			{showEmpty ? (
				(empty ?? <EmptyState title={t("dataView.empty")} />)
			) : selectable ? (
				// 판별 union 이라 조건부 스프레드로는 좁혀지지 않는다 - 분기를 명시한다.
				<Table
					columns={columns}
					data={rows}
					keyExtractor={rowKey}
					rowIndexOffset={rowIndexOffset}
					isLoading={query.isLoading}
					sort={sort}
					onSortChange={onSortChange}
					onRowClick={onRowClick}
					ariaLabel={ariaLabel}
					selectable
					rowKey={rowKey}
					selectedKeys={selectedKeys}
					onSelectionChange={setSelectedKeys}
				/>
			) : (
				<Table
					columns={columns}
					data={rows}
					keyExtractor={rowKey}
					rowIndexOffset={rowIndexOffset}
					isLoading={query.isLoading}
					sort={sort}
					onSortChange={onSortChange}
					onRowClick={onRowClick}
					ariaLabel={ariaLabel}
				/>
			)}

			{pagination && pagination.totalPages > 1 && (
				<div className="data_view_pagination">
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						onPageChange={pagination.onPageChange}
					/>
				</div>
			)}
		</div>
	);
};
