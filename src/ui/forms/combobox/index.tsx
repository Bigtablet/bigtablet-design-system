"use client";

import { animated } from "@react-spring/web";
import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { iconSize } from "../../../styles/icon";
import { cn, useSpringPresence } from "../../../utils";
import { useListboxPopup } from "../../../utils/use-listbox-popup";
import { Spinner } from "../../feedback/spinner";
import { useFieldControl } from "../field";
import "./style.scss";

export interface ComboboxOption {
	/** 선택 시 돌려줄 값 */
	value: string;
	/** 목록과 트리거에 표시할 텍스트 */
	label: string;
	/** 비활성 - 키보드 이동에서 건너뛰고 선택되지 않는다 */
	disabled?: boolean;
}

export type ComboboxSize = "sm" | "md" | "lg";

export interface ComboboxProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
	/** 선택된 값 (제어형) */
	value?: ComboboxOption | null;
	/** 선택 변경 콜백 */
	onValueChange?: (option: ComboboxOption | null) => void;
	/**
	 * 검색어가 바뀔 때 호출. 서버에서 후보를 가져오는 자리다.
	 * `debounceMs` 만큼 기다린 뒤 호출되고, 늦게 도착한 응답은 버려진다.
	 */
	onSearch: (query: string) => Promise<ComboboxOption[]>;
	/** 검색어 입력 전에 보여줄 초기 후보 */
	defaultOptions?: ComboboxOption[];
	/** 검색 호출 간격 (기본값: 250ms) */
	debounceMs?: number;
	/** 입력 placeholder (기본값: "검색해서 선택") */
	placeholder?: string;
	/** 결과 없음 문구 (기본값: "일치하는 항목이 없습니다") */
	emptyMessage?: string;
	/** 검색 전 안내 문구 (기본값: "검색어를 입력하세요") */
	idleMessage?: string;
	/** 크기 (기본값: "md") */
	size?: ComboboxSize;
	/** 비활성 여부 */
	disabled?: boolean;
	/** 전체 너비 차지 */
	fullWidth?: boolean;
	/** 목록 항목 렌더 커스터마이즈. 미지정 시 `label` */
	renderOption?: (option: ComboboxOption) => React.ReactNode;
	/** 접근성 이름 - `Field` 로 감싸면 그쪽 라벨이 우선한다 */
	ariaLabel?: string;
	/** 로딩 안내 (기본값: "검색 중") */
	loadingLabel?: string;
}

/**
 * 후보를 서버에서 가져오는 선택 입력 (APG Combobox).
 *
 * `Dropdown` 도 `searchable` 로 타이핑 검색을 지원하지만 **이미 받아 둔 옵션 배열 안에서만**
 * 거른다. 담당자·회사·상품처럼 후보가 수백 개인 필드는 그 목록을 통째로 내려받을 수 없어
 * 소비자가 DS 를 우회해 직접 만들게 된다 - 우회가 시작되는 지점이 DS 이탈이 시작되는 지점이다.
 *
 * 팝업의 거동(개폐·활성 항목·키보드·바깥 클릭)은 `useListboxPopup` 을 `Dropdown` 과 공유한다.
 * 여기 있는 것은 **비동기 네 가지**뿐이다 - 디바운스, 로딩 표시, 응답 경합 차단,
 * "아직 검색 안 함" 과 "결과 없음" 의 구분.
 *
 * @example
 * ```tsx
 * <Combobox
 *   value={owner}
 *   onValueChange={setOwner}
 *   onSearch={(q) => api.searchUsers(q)}
 *   emptyMessage="일치하는 담당자가 없습니다"
 * />
 * ```
 */
export const Combobox = ({
	value = null,
	onValueChange,
	onSearch,
	defaultOptions = [],
	debounceMs = 250,
	placeholder = "검색해서 선택",
	emptyMessage = "일치하는 항목이 없습니다",
	idleMessage = "검색어를 입력하세요",
	size = "md",
	disabled = false,
	fullWidth = false,
	renderOption,
	ariaLabel,
	loadingLabel = "검색 중",
	className,
	...props
}: ComboboxProps) => {
	const generatedId = useId();
	const field = useFieldControl();
	const inputId = field?.inputId ?? generatedId;
	const listId = `${inputId}-listbox`;

	const [query, setQuery] = useState("");
	const [options, setOptions] = useState<ComboboxOption[]>(defaultOptions);
	const [isLoading, setIsLoading] = useState(false);
	// 검색어를 한 번도 확정하지 않은 상태. "결과 없음" 과 구분해야 빈 목록이 실패처럼 보이지 않는다.
	const [hasSearched, setHasSearched] = useState(false);

	// 응답 경합 차단 - 늦게 도착한 이전 쿼리의 결과가 최신 목록을 덮지 않게 한다.
	// 타이핑이 빠르면 순서가 뒤집히고, 그러면 방금 친 글자와 무관한 후보가 남는다.
	const requestSeq = useRef(0);

	// defaultOptions 는 소비자가 인라인 배열로 넘기는 일이 많다. 의존성에 넣으면 매 렌더
	// 조회가 다시 걸리고, 빼고 suppress 하면 값이 낡는다. ref 로 최신값만 읽는다.
	// 대입은 렌더가 아니라 커밋 후에 한다 - 렌더 중 쓰면 React 가 버린 렌더의 값이
	// ref 에 남아 이후 effect 가 그것을 읽을 수 있다.
	const defaultOptionsRef = useRef(defaultOptions);
	useEffect(() => {
		defaultOptionsRef.current = defaultOptions;
	}, [defaultOptions]);

	// 선택하면 패널을 닫는다. 닫지 않으면 검색어가 비워지면서 effect 가 idle 로 되돌려,
	// 방금 고른 라벨 대신 "검색어를 입력하세요" 가 열린 채로 남는다.
	// close 는 아래 훅의 반환값이라 여기서 직접 참조할 수 없어 ref 를 거친다.
	const closeRef = useRef<() => void>(() => {});

	const commit = useCallback(
		(option: ComboboxOption) => {
			onValueChange?.(option);
			setQuery("");
			closeRef.current();
		},
		[onValueChange],
	);

	const popup = useListboxPopup<ComboboxOption>({
		items: options,
		onCommit: commit,
		disabled,
		// 상시 컨트롤이 입력창이라 포커스를 되돌릴 필요가 없다. triggerRef 는 장식용
		// chevron 버튼(tabIndex=-1)에 붙어 있어, 켜면 Escape 가 포커스를 그 숨은 버튼으로 던진다.
		returnFocusOnClose: false,
	});
	const { isOpen, setIsOpen, close, activeIndex, setActiveIndex } = popup;
	closeRef.current = close;

	// 검색어가 바뀌면 디바운스 후 한 번만 조회한다.
	useEffect(() => {
		if (!isOpen) return;
		if (query === "") {
			// 진행 중인 요청을 무효화한다. 안 올리면 나중에 도착한 응답이 가드를 통과해
			// 방금 리셋한 상태를 낡은 검색 결과로 덮는다.
			requestSeq.current++;
			setOptions(defaultOptionsRef.current);
			setHasSearched(false);
			setIsLoading(false);
			return;
		}

		const seq = ++requestSeq.current;
		setIsLoading(true);
		const timer = setTimeout(() => {
			onSearch(query)
				.then((result) => {
					// 최신 요청이 아니면 버린다.
					if (seq !== requestSeq.current) return;
					setOptions(result);
					setHasSearched(true);
				})
				.catch(() => {
					if (seq !== requestSeq.current) return;
					setOptions([]);
					setHasSearched(true);
				})
				.finally(() => {
					if (seq !== requestSeq.current) return;
					setIsLoading(false);
				});
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [query, isOpen, debounceMs, onSearch]);

	const rootClassName = cn(
		"combobox",
		`combobox_size_${size}`,
		{ combobox_full_width: fullWidth, combobox_disabled: disabled },
		className,
	);

	const showIdle = !isLoading && !hasSearched && options.length === 0;
	const showEmpty = !isLoading && hasSearched && options.length === 0;
	// 안내 문구만 있는 동안에는 listbox 를 렌더하지 않는다. 그때 aria-controls 를 남기면
	// 보조기술이 존재하지 않는 요소를 가리킨다.
	const hasList = !showIdle && !showEmpty;

	// 패널 진입 모션 - Dropdown 목록과 같은 값. 퇴출은 즉시 unmount (Dropdown 주석 참고).
	const panelStyle = useSpringPresence({
		visible: isOpen,
		from: popup.dropUp ? "translateY(4px)" : "translateY(-4px)",
	});

	return (
		<div ref={popup.wrapperRef} className={rootClassName} {...props}>
			<div className="combobox_control">
				<input
					id={inputId}
					className="combobox_input"
					role="combobox"
					type="text"
					autoComplete="off"
					disabled={disabled}
					value={isOpen ? query : (value?.label ?? "")}
					placeholder={value ? value.label : placeholder}
					aria-expanded={isOpen}
					aria-controls={isOpen && hasList ? listId : undefined}
					aria-autocomplete="list"
					aria-activedescendant={
						isOpen && activeIndex >= 0 && options[activeIndex]
							? `${listId}-${options[activeIndex].value}`
							: undefined
					}
					aria-labelledby={field?.labelId}
					aria-label={field?.labelId ? undefined : ariaLabel}
					aria-describedby={field?.describedBy}
					aria-invalid={field?.invalid || undefined}
					aria-required={field?.required || undefined}
					onChange={(event) => {
						setQuery(event.target.value);
						if (!isOpen) setIsOpen(true);
					}}
					onFocus={() => !disabled && setIsOpen(true)}
					onKeyDown={popup.onInputKeyDown}
				/>
				{isLoading && (
					<span className="combobox_spinner">
						<Spinner size={iconSize.sm} ariaLabel={loadingLabel} />
					</span>
				)}
				<button
					type="button"
					ref={popup.triggerRef}
					className="combobox_toggle"
					tabIndex={-1}
					disabled={disabled}
					aria-hidden="true"
					onClick={() => (isOpen ? close() : setIsOpen(true))}
				>
					<ChevronDown size={iconSize.lg} />
				</button>
			</div>

			{isOpen && (
				<animated.div
					className={cn("combobox_panel", { combobox_panel_up: popup.dropUp })}
					style={panelStyle}
				>
					{!hasList ? (
						<p className="combobox_message" role="status">
							{showIdle ? idleMessage : emptyMessage}
						</p>
					) : (
						<div id={listId} className="combobox_list" role="listbox">
							{options.map((option, index) => (
								/* biome-ignore lint/a11y/useKeyWithClickEvents: 키보드는 입력의 onKeyDown 이 담당한다 - option 은 aria-activedescendant 로 가리키는 비포커스 요소다 (APG Combobox) */
								<div
									key={option.value}
									id={`${listId}-${option.value}`}
									role="option"
									// 포커스는 입력에 남는다. tabIndex 는 role=option 요소가 요구하는 형식일 뿐
									// 탭 순서에 들어가지 않는다 (Dropdown 과 동일).
									tabIndex={-1}
									aria-selected={value?.value === option.value}
									aria-disabled={option.disabled || undefined}
									className={cn("combobox_option", {
										is_active: index === activeIndex,
										is_disabled: option.disabled,
									})}
									onMouseEnter={() => !option.disabled && setActiveIndex(index)}
									onClick={() => !option.disabled && commit(option)}
								>
									{renderOption ? renderOption(option) : option.label}
								</div>
							))}
						</div>
					)}
				</animated.div>
			)}
		</div>
	);
};
