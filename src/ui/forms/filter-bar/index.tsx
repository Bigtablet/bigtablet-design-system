"use client";

import type * as React from "react";
import { cn, type SafeHTMLProps } from "../../../utils";
import { Spinner } from "../../feedback/spinner";
import { Button } from "../../general/button";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

export interface FilterBarProps
	extends Omit<SafeHTMLProps<React.FormHTMLAttributes<HTMLFormElement>>, "onSubmit" | "onReset"> {
	/** 필터 입력들 (TextField · Dropdown · DatePicker 등). 반응형 grid 로 배치된다 */
	children: React.ReactNode;
	/** 검색 - Enter 또는 검색 버튼. 기본 폼 제출(페이지 이동)은 막는다 */
	onSubmit: () => void;
	/** 주면 초기화 버튼이 생긴다. 값을 비우는 건 소비자 몫이다 */
	onReset?: () => void;
	/** 검색할 수 있는 상태인가 (기본값: true). false 면 검색 버튼과 Enter 제출이 막힌다 */
	canSubmit?: boolean;
	/** 초기화할 것이 있는가 (기본값: true). 이미 비어 있으면 false 로 */
	canReset?: boolean;
	/** 검색 중 - 검색 버튼에 스피너, 중복 제출을 막는다 */
	loading?: boolean;
	/** 버튼 전체 비활성화 */
	disabled?: boolean;
	/** 검색 버튼 문구 (기본값: 로케일 `filterBar.submit`) */
	submitLabel?: string;
	/** 초기화 버튼 문구 (기본값: 로케일 `filterBar.reset`) */
	resetLabel?: string;
	/** 필드 한 칸의 최소 폭 - 이보다 좁아지면 줄을 바꾼다 (기본값: 200) */
	fieldMinWidth?: number | string;
}

/**
 * 목록 화면 상단의 필터 묶음 - 필드 배치 · Enter 제출 · 검색/초기화 버튼만 담당한다.
 * 필터 값과 URL·쿼리 상태는 소비자가 그대로 가진다. `DataView` 의 `toolbar.filters` 에도 넣을 수 있다.
 *
 * @example
 * ```tsx
 * <FilterBar onSubmit={() => setQuery(draft)} onReset={() => setDraft(EMPTY)} canReset={!isEmpty(draft)}>
 *   <TextField label="이름" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
 *   <Dropdown label="상태" options={STATUS} value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} />
 * </FilterBar>
 * ```
 */
export const FilterBar = ({
	children,
	onSubmit,
	onReset,
	canSubmit = true,
	canReset = true,
	loading = false,
	disabled = false,
	submitLabel: submitLabelProp,
	resetLabel: resetLabelProp,
	fieldMinWidth = 200,
	className,
	style,
	...props
}: FilterBarProps) => {
	const t = useLocaleText();
	const submitLabel = submitLabelProp ?? t("filterBar.submit");
	const resetLabel = resetLabelProp ?? t("filterBar.reset");
	const submitBlocked = disabled || loading || !canSubmit;

	return (
		// biome-ignore lint/a11y/useSemanticElements: `<search>` 는 Safari 17 · Chrome 118 부터라 그 이전엔 랜드마크가 사라진다. form 에 role 을 두면 aria-label 과 form 속성이 한 요소에 모인다
		<form
			{...props}
			// 검색 폼이다 - 브라우저 기본 검증 말풍선 대신 소비자가 canSubmit 으로 막는다
			noValidate
			role="search"
			aria-busy={loading || undefined}
			className={cn("filter_bar", className)}
			style={
				{
					...style,
					"--filter-bar-field-min":
						typeof fieldMinWidth === "number" ? `${fieldMinWidth}px` : fieldMinWidth,
				} as React.CSSProperties
			}
			onSubmit={(e) => {
				e.preventDefault();
				// Enter 는 버튼이 막혀 있어도 폼 제출을 일으킨다 - 같은 조건으로 거른다
				if (!submitBlocked) onSubmit();
			}}
		>
			<div className="filter_bar_fields">{children}</div>
			<div className="filter_bar_actions">
				{onReset && (
					<Button type="button" variant="text" disabled={disabled || !canReset} onClick={onReset}>
						{resetLabel}
					</Button>
				)}
				<Button
					type="submit"
					// loading 은 `disabled` 대신 `aria-disabled` - 버튼에 포커스가 있는 채 막히면 포커스가
					// body 로 빠진다. 제출 자체는 위 onSubmit 가드가 막는다.
					disabled={disabled || !canSubmit}
					aria-disabled={loading || undefined}
					// 스피너는 장식 - 상태는 폼의 aria-busy 가 전한다. 이름을 따로 주면 "검색 검색" 으로 읽힌다
					leadingIcon={
						loading ? (
							<span aria-hidden="true">
								<Spinner size={16} />
							</span>
						) : undefined
					}
				>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
};

FilterBar.displayName = "FilterBar";
