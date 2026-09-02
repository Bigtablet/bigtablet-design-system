"use client";

import { animated } from "@react-spring/web";
import { Check, ChevronDown, Search } from "lucide-react";
import type * as React from "react";
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { iconSize } from "../../../styles/icon";
import { cn, useSpringPresence } from "../../../utils";
import { useListboxPopup } from "../../../utils/use-listbox-popup";
import { useFieldControl } from "../field";
import "./style.scss";

export type DropdownSize = "sm" | "md" | "lg";

/**
 * 컨트롤 시각 변형. TextField 의 `variant` 와 같은 어휘를 쓴다.
 * - `outline`: 테두리로 컨트롤을 구분 (기본).
 * - `filled`: 테두리 대신 채워진 배경으로 구분, 열리면 배경이 solid 로 돌아오며 테두리가 드러남.
 */
export type DropdownVariant = "outline" | "filled";

export interface DropdownOption {
	value: string;
	label: string;
	disabled?: boolean;
	/** 옵션 아래에 표시할 보조 텍스트 */
	supportingText?: string;
	/** 옵션 왼쪽 아이콘 */
	leadingIcon?: React.ReactNode;
	/** 옵션 오른쪽 아이콘 (미지정 시 선택 상태에 체크 아이콘 자동 표시) */
	trailingIcon?: React.ReactNode;
	/** 아이템 아래 구분선 표시 여부 */
	showDivider?: boolean;
}

/** single/multiple 공통 속성 */
interface DropdownCommonProps {
	/** 드롭다운 요소의 id (미입력 시 자동 생성) */
	id?: string;
	/** 드롭다운 위에 표시할 플로팅 라벨 텍스트 */
	label?: string;
	/** 선택 전 표시할 플레이스홀더 (기본값: "선택…") */
	placeholder?: string;
	/** 표시할 옵션 목록 */
	options: DropdownOption[];
	/** 비활성화 여부 */
	disabled?: boolean;
	/** 드롭다운 크기 (기본값: "md") */
	size?: DropdownSize;
	/**
	 * @deprecated Dropdown 은 이제 항상 부모 너비를 채웁니다. 인라인 사용 시 부모를 `inline-block + width` 로 감싸세요.
	 */
	fullWidth?: boolean;
	/** 루트 요소에 추가할 className */
	className?: string;
	/** 컨트롤 시각 변형 (기본값: "outline") */
	variant?: DropdownVariant;
	/**
	 * @deprecated textAlign은 더 이상 지원되지 않습니다.
	 */
	textAlign?: "left" | "center";
	/**
	 * 검색 가능 여부. 활성화 시 열린 패널 상단에 검색 입력이 표시되고, 옵션 `label` 부분 일치로 필터링됩니다.
	 * (기본값: false)
	 */
	searchable?: boolean;
	/** 검색 입력의 placeholder (기본값: "검색…") */
	searchPlaceholder?: string;
	/** 필터 결과가 0개일 때 표시할 텍스트 (기본값: "결과 없음") */
	emptyText?: string;
	/** 멀티 선택 요약 텍스트 (기본값: "N개 선택") */
	selectedSummary?: (count: number) => string;
	/**
	 * 네이티브 폼 제출 참여용 name. 지정 시 선택 값이 hidden input 으로 렌더되어
	 * `<form>` POST 에 포함됩니다 (multiple 은 같은 name 의 hidden input 반복).
	 */
	name?: string;
}

/** 단일 선택 (기본) */
export interface DropdownSingleProps extends DropdownCommonProps {
	/** 다중 선택 모드 (기본값: false) */
	multiple?: false;
	/** 제어형 선택 값 */
	value?: string | null;
	/** 값 변경 콜백 (canonical). 선택된 값과 전체 옵션 객체를 전달합니다. */
	onValueChange?: (value: string | null, option?: DropdownOption | null) => void;
	/** @deprecated `onValueChange` 를 사용하세요. */
	onChange?: (value: string | null, option?: DropdownOption | null) => void;
	/** 비제어형 초기 선택 값 */
	defaultValue?: string | null;
}

/** 다중 선택 */
export interface DropdownMultipleProps extends DropdownCommonProps {
	/** 다중 선택 모드 */
	multiple: true;
	/** 제어형 선택 값 목록 */
	value?: string[];
	/** 값 변경 콜백 (canonical). 선택된 값 목록과 옵션 객체 목록을 전달합니다. */
	onValueChange?: (values: string[], options: DropdownOption[]) => void;
	/** @deprecated `onValueChange` 를 사용하세요. */
	onChange?: (values: string[], options: DropdownOption[]) => void;
	/** 비제어형 초기 선택 값 목록 */
	defaultValue?: string[];
}

export type DropdownProps = DropdownSingleProps | DropdownMultipleProps;

/** 검색 매칭용 정규화 - 대소문자·공백 무시 */
const normalizeForSearch = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/**
 * 드롭다운 컴포넌트를 렌더링한다.
 * 제어형/비제어형 상태를 지원하며, 키보드/마우스 상호작용과 정적 라벨을 관리한다.
 * `searchable` 로 라벨 부분 일치 검색을, `multiple` 로 다중 선택을 opt-in 할 수 있다.
 * @param props 드롭다운 속성
 * @returns 렌더링된 드롭다운 UI
 */
export const Dropdown = (props: DropdownProps) => {
	const {
		id,
		label,
		placeholder = "선택…",
		options,
		disabled,
		size = "md",
		variant = "outline",
		className,
		searchable = false,
		searchPlaceholder = "검색…",
		emptyText = "결과 없음",
		selectedSummary = (count: number) => `${count}개 선택`,
		name,
	} = props;

	const multiple = props.multiple === true;

	const internalId = useId();
	// Field 안에서는 Field 가 id·설명 연결·에러를 소유한다. 밖에서는 undefined 라 기존 동작 그대로.
	const field = useFieldControl();
	const dropdownId = id ?? field?.inputId ?? internalId;

	const isControlled = props.value !== undefined;

	// 단일/다중 각각 별도 내부 상태 (mode 는 런타임에 바뀌지 않는다고 가정)
	const [internalSingle, setInternalSingle] = useState<string | null>(() =>
		props.multiple === true ? null : ((props.defaultValue as string | null | undefined) ?? null),
	);
	const [internalMulti, setInternalMulti] = useState<string[]>(() =>
		props.multiple === true ? ((props.defaultValue as string[] | undefined) ?? []) : [],
	);


	// 검색 상태 - searchText 는 표시용(IME 조합 중에도 즉시 반영), committedQuery 는 필터용(조합 완료 시 반영)
	const [searchText, setSearchText] = useState("");
	const [committedQuery, setCommittedQuery] = useState("");
	const isComposingRef = useRef(false);

	const searchRef = useRef<HTMLInputElement>(null);

	// 현재 선택값 - 항상 배열로 정규화 (single 은 길이 0~1)
	const selectedValues = useMemo<string[]>(() => {
		if (multiple) {
			const v = isControlled ? (props.value as string[] | undefined) : internalMulti;
			return v ?? [];
		}
		const v = isControlled ? (props.value as string | null | undefined) : internalSingle;
		return v != null ? [v] : [];
	}, [multiple, isControlled, props.value, internalMulti, internalSingle]);

	// 검색 필터 적용된 노출 옵션. searchable 아니거나 쿼리 없으면 전체.
	const visibleOptions = useMemo<DropdownOption[]>(() => {
		if (!searchable) return options;
		const q = normalizeForSearch(committedQuery);
		if (q === "") return options;
		return options.filter((o) => normalizeForSearch(o.label).includes(q));
	}, [options, searchable, committedQuery]);

	// ── 선택 처리 ──────────────────────────────────────────────────────────

	const selectSingle = useCallback(
		(next: string | null) => {
			const option = options.find((o) => o.value === next) ?? null;
			if (!isControlled) setInternalSingle(next);
			if (props.multiple !== true) {
				(props.onValueChange ?? props.onChange)?.(next, option);
			}
		},
		[isControlled, options, props.multiple, props.onValueChange, props.onChange],
	);

	const toggleMultiple = useCallback(
		(opt: DropdownOption) => {
			const exists = selectedValues.includes(opt.value);
			const nextValues = exists
				? selectedValues.filter((v) => v !== opt.value)
				: [...selectedValues, opt.value];
			const nextOptions = nextValues
				.map((v) => options.find((o) => o.value === v))
				.filter((o): o is DropdownOption => Boolean(o));
			if (!isControlled) setInternalMulti(nextValues);
			if (props.multiple === true) {
				(props.onValueChange ?? props.onChange)?.(nextValues, nextOptions);
			}
		},
		[selectedValues, options, isControlled, props.multiple, props.onValueChange, props.onChange],
	);

	const selectOption = useCallback(
		(opt: DropdownOption) => {
			if (opt.disabled) return;
			if (multiple) {
				// 다중: 토글 후 리스트/필터 유지 (닫지 않음)
				toggleMultiple(opt);
			} else {
				selectSingle(opt.value);
				closePanel();
			}
		},
		// closePanel 은 아래 훅에서 오므로 선언 순서상 참조만 한다 (렌더마다 동일 참조).
		// biome-ignore lint/correctness/useExhaustiveDependencies: closePanel 은 훅 결과라 아래에서 정의된다
		[multiple, toggleMultiple, selectSingle],
	);

	// 팝업의 거동(개폐·활성 항목·키보드·바깥 클릭·열림 방향)은 훅이 갖는다.
	// 목록의 내용(검색·다중 선택)만 여기 남는다 - Combobox 와 같은 거동을 공유하기 위함이다.
	const {
		isOpen,
		setIsOpen,
		dropUp,
		activeIndex,
		setActiveIndex,
		wrapperRef,
		triggerRef: controlRef,
		close: closePanel,
		onTriggerKeyDown: onControlKeyDown,
		onInputKeyDown: onSearchKeyDown,
	} = useListboxPopup<DropdownOption>({
		items: visibleOptions,
		onCommit: selectOption,
		disabled,
		// searchable 은 포커스가 검색 입력에 있으므로 닫을 때 트리거로 되돌린다.
		returnFocusOnClose: searchable,
		// 열릴 때는 선택된 항목을 활성으로. 없으면 훅이 첫 활성 항목을 고른다.
		initialActiveIndex: (opts) =>
			opts.findIndex((o) => selectedValues.includes(o.value) && !o.disabled),
	});

	// 패널을 닫으면 검색 상태 초기화 (다음 열림 시 fresh)
	useEffect(() => {
		if (!isOpen) {
			setSearchText("");
			setCommittedQuery("");
			isComposingRef.current = false;
		}
	}, [isOpen]);

	// searchable 패널이 열리면 검색 입력에 포커스
	useEffect(() => {
		if (isOpen && searchable) {
			searchRef.current?.focus();
		}
	}, [isOpen, searchable]);

	// ── 표시 값 계산 ────────────────────────────────────────────────────────

	const currentOption = useMemo(
		() => (multiple ? null : (options.find((o) => o.value === selectedValues[0]) ?? null)),
		[multiple, options, selectedValues],
	);
	const hasSelection = selectedValues.length > 0;
	const showValue = multiple ? hasSelection : currentOption != null;
	const controlText = multiple
		? hasSelection
			? selectedSummary(selectedValues.length)
			: placeholder
		: currentOption
			? currentOption.label
			: placeholder;

	const rootClassName = cn(
		"dropdown",
		`dropdown_size_${size}`,
		`dropdown_variant_${variant}`,
		className,
	);
	const fieldsetClassName = cn("dropdown_fieldset", { is_open: isOpen, is_disabled: disabled });
	const listClassName = cn("dropdown_list", { dropdown_list_up: dropUp });

	// Spring presence - list 진입 모션 (Menu/Tooltip 과 동일 패턴, 퇴출은 즉시 unmount)
	// Dropdown 은 빠른 선택 popup 이라 외부 클릭/Esc 가 즉시 닫혀야 자연. Modal 처럼
	// shouldRender + onExitComplete 패턴은 spring onRest 가 sync 동작 보장 안 해
	// 키보드 네비/선택 unit test (Esc/Enter 후 즉시 listbox 사라짐 기대) 깨짐.
	const listStyle = useSpringPresence({
		visible: isOpen,
		from: dropUp ? "translateY(4px)" : "translateY(-4px)",
	});

	return (
		<div ref={wrapperRef} className={rootClassName}>
			{label && (
				<label htmlFor={dropdownId} className="dropdown_label">
					{label}
				</label>
			)}

			<div className={fieldsetClassName}>
				<button
					ref={controlRef}
					id={dropdownId}
					type="button"
					className={cn("dropdown_control", { is_disabled: disabled })}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					aria-describedby={field?.describedBy}
					aria-invalid={field?.invalid || undefined}
					// 닫힌 상태에서는 listbox 가 unmount 라 dangling IDREF 방지 위해 열렸을 때만 지정
					aria-controls={isOpen ? `${dropdownId}_listbox` : undefined}
					onClick={() => !disabled && setIsOpen((o) => !o)}
					onKeyDown={onControlKeyDown}
					disabled={disabled}
				>
					<span className={showValue ? "dropdown_value" : "dropdown_placeholder"}>
						{controlText}
					</span>
					<span className={cn("dropdown_icon", { dropdown_icon_open: isOpen })} aria-hidden="true">
						<ChevronDown size={iconSize.lg} />
					</span>
				</button>
			</div>

			{/* 네이티브 폼 제출 참여 - name 지정 시 선택 값을 hidden input 으로 노출.
			    disabled 시 값 전송 제외 (native <select disabled> 처럼 FormData 에서 빠지도록). */}
			{name &&
				(multiple ? (
					selectedValues.map((v) => (
						<input key={v} type="hidden" name={name} value={v} disabled={disabled} />
					))
				) : (
					<input type="hidden" name={name} value={selectedValues[0] ?? ""} disabled={disabled} />
				))}

			{isOpen && (
				<animated.div className={listClassName} style={listStyle}>
					{searchable && (
						<div className="dropdown_search">
							<span className="dropdown_search_icon" aria-hidden="true">
								<Search size={iconSize.sm} />
							</span>
							<input
								ref={searchRef}
								type="text"
								className="dropdown_search_input"
								placeholder={searchPlaceholder}
								aria-label={searchPlaceholder}
								autoComplete="off"
								role="combobox"
								aria-autocomplete="list"
								aria-expanded={isOpen}
								aria-controls={`${dropdownId}_listbox`}
								aria-activedescendant={
									activeIndex >= 0 && visibleOptions[activeIndex]
										? `${dropdownId}_option_${activeIndex}`
										: undefined
								}
								value={searchText}
								onChange={(e) => {
									const v = e.target.value;
									setSearchText(v);
									// 조합 중에는 필터 갱신 보류 (mid-composition 리스트 thrash 방지)
									if (!isComposingRef.current) setCommittedQuery(v);
								}}
								onCompositionStart={() => {
									isComposingRef.current = true;
								}}
								onCompositionEnd={(e) => {
									isComposingRef.current = false;
									const v = e.currentTarget.value;
									setSearchText(v);
									setCommittedQuery(v);
								}}
								onKeyDown={onSearchKeyDown}
							/>
						</div>
					)}

					<div
						id={`${dropdownId}_listbox`}
						role="listbox"
						className="dropdown_options"
						aria-multiselectable={multiple || undefined}
					>
						{visibleOptions.length === 0
							? searchable && <div className="dropdown_empty">{emptyText}</div>
							: visibleOptions.map((opt, i) => {
									const selected = selectedValues.includes(opt.value);
									const active = i === activeIndex;

									return (
										<Fragment key={opt.value}>
											{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by parent listbox button - options are non-focusable role=option per WAI-ARIA listbox pattern */}
											<div
												id={`${dropdownId}_option_${i}`}
												role="option"
												tabIndex={-1}
												aria-selected={selected}
												aria-disabled={opt.disabled ? true : undefined}
												className={cn("dropdown_option", {
													is_selected: selected,
													is_active: active,
													is_disabled: opt.disabled,
												})}
												onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
												onClick={() => selectOption(opt)}
											>
												{multiple && (
													<span className="dropdown_option_check" aria-hidden="true">
														{selected && <Check size={iconSize.sm} />}
													</span>
												)}
												{opt.leadingIcon && (
													<span className="dropdown_option_icon">{opt.leadingIcon}</span>
												)}
												<span className="dropdown_option_content">
													<span className="dropdown_option_label">{opt.label}</span>
													{opt.supportingText && (
														<span className="dropdown_option_supporting">{opt.supportingText}</span>
													)}
												</span>
												{(opt.trailingIcon || (!multiple && selected)) && (
													<span className="dropdown_option_trailing">
														{opt.trailingIcon ?? <Check size={iconSize.sm} aria-hidden="true" />}
													</span>
												)}
											</div>
											{opt.showDivider && <hr className="dropdown_option_divider" />}
										</Fragment>
									);
								})}
					</div>
				</animated.div>
			)}
		</div>
	);
};
