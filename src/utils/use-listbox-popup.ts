"use client";

import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAnchoredPosition } from "./use-anchored-position";

/** 팝업 목록의 한 항목이 최소한 갖춰야 하는 모양. 라벨·값 등 나머지는 소비자 몫이다. */
export interface ListboxItem {
	/** 비활성 항목은 키보드 이동에서 건너뛰고 선택되지 않는다 */
	disabled?: boolean;
}

export interface UseListboxPopupArgs<T extends ListboxItem> {
	/** 현재 목록에 보이는 항목 (검색 필터가 적용된 뒤의 배열) */
	items: T[];
	/** 항목이 확정될 때 호출 - Enter 또는 클릭 */
	onCommit: (item: T) => void;
	/** 트리거가 비활성이면 키보드 처리를 하지 않는다 */
	disabled?: boolean;
	/**
	 * 패널을 닫을 때 트리거로 포커스를 되돌릴지. 포커스가 패널 안(검색 입력)에 있는
	 * 형태에서 필요하다 - 안 되돌리면 닫는 순간 포커스가 body 로 유실된다.
	 */
	returnFocusOnClose?: boolean;
	/** 열릴 때 활성으로 둘 항목의 인덱스. 보통 선택된 항목 */
	initialActiveIndex?: (items: T[]) => number;
}

export interface UseListboxPopupResult {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	/** 위로 열릴지 - 배치가 `top` 으로 flip 됐을 때 true */
	dropUp: boolean;
	/**
	 * 팝업을 **포탈로** 띄울 때 쓰는 fixed 좌표·폭. 목록을 트리거 옆에 `position: absolute` 로
	 * 두면 `overflow: hidden` 인 조상(카드·표 래퍼)이 잘라낸다 - `z-index` 로는 넘지 못한다.
	 * 실측(#586) - `overflow: hidden` 카드 안에서 170px 목록 중 46px 만 보였다.
	 */
	position: {
		/** fixed left(px) */
		x: number;
		/** fixed top(px) */
		y: number;
		/** 트리거 폭(px) - 포탈에서는 `width: 100%` 가 트리거를 가리키지 않는다 */
		width: number;
		/**
		 * 뷰포트 가용 폭 상한(px). 트리거가 뷰포트보다 넓으면(좁은 화면의 넓은 폼) 배치는
		 * 이 값으로 좌표를 잡는데 패널 폭을 트리거 폭으로 두면 오른쪽이 잘린다.
		 */
		maxWidth: number;
		/** 최초 측정 전에는 false - 이때 숨겨 (0,0) 깜빡임을 막는다 */
		ready: boolean;
	};
	activeIndex: number;
	setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
	/** 바깥 클릭 감지 기준. 트리거와 패널을 함께 감싸는 요소에 붙인다 */
	wrapperRef: React.RefObject<HTMLDivElement | null>;
	/**
	 * 팝업 패널 전체. 배치 계산이 이 요소를 잰다 - `listRef` 는 스크롤 컨테이너라 검색바를
	 * 빼고 재게 되고, 그러면 flip 판정과 `top` 배치가 그만큼 어긋난다.
	 */
	panelRef: React.RefObject<HTMLDivElement | null>;
	/** 트리거 요소. 닫을 때 포커스를 되돌릴 대상 */
	triggerRef: React.RefObject<HTMLButtonElement | null>;
	/**
	 * 스크롤되는 목록 요소(`role="listbox"`). 붙이면 방향키로 옮긴 활성 항목을 따라 스크롤한다.
	 * 안 붙여도 나머지 동작은 그대로다 - 목록이 짧아 스크롤이 없는 경우.
	 */
	listRef: React.RefObject<HTMLDivElement | null>;
	/** 닫고 필요하면 트리거로 포커스를 되돌린다 */
	close: () => void;
	/** 방향키 이동 - 비활성 항목을 건너뛰고 양끝에서 순환한다 */
	moveActive: (dir: 1 | -1) => void;
	/** 현재 활성 항목을 확정한다 */
	commitActive: () => void;
	/** 트리거(button)용 키보드 핸들러 */
	onTriggerKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
	/** 패널 안 입력(검색·콤보박스)용 키보드 핸들러 */
	onInputKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

/** 아래 공간이 이보다 좁고 위가 더 넓을 때만 위로 연다. 작은 iframe 에서 무분별한 dropUp 방지. */
/** 트리거와 목록 사이 간격(px). 기존 `margin-top: 4px` 와 같은 값. */
const LIST_GAP = 4;
/** 뷰포트 가장자리 최소 여백(px). Popover 와 같은 값. */
const LIST_PADDING = 8;

/**
 * 트리거 + 팝업 목록의 개폐·활성 항목·키보드·바깥 클릭·열림 방향을 담당한다.
 *
 * `Dropdown` 이 이 로직을 인라인으로 갖고 있었다. `Combobox` 가 같은 동작(APG Combobox 키보드
 * 규약, 비활성 건너뛰기, dropUp)을 필요로 하는데, 복사하면 두 벌이 갈린다 - 이 저장소에서
 * "형제 구현 한쪽만 고침" 이 이미 네 번 났다.
 *
 * 목록의 **내용**(검색·다중 선택·비동기)은 소비자가 갖는다. 이 훅은 팝업의 **거동**만 안다.
 */
export function useListboxPopup<T extends ListboxItem>({
	items,
	onCommit,
	disabled = false,
	returnFocusOnClose = false,
	initialActiveIndex,
}: UseListboxPopupArgs<T>): UseListboxPopupResult {
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const wrapperRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const close = useCallback(() => {
		setIsOpen(false);
		if (returnFocusOnClose) triggerRef.current?.focus();
	}, [returnFocusOnClose]);

	// 바깥 클릭으로 닫기. 트리거로 포커스를 되돌리지 않는다 - 사용자가 다른 곳을 눌렀다.
	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			// 목록은 포탈로 body 에 붙으므로 wrapper 밖이다 - 함께 봐야 옵션 클릭이 닫기로
			// 먹히지 않는다.
			if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return;
			setIsOpen(false);
		};
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	const moveActive = useCallback(
		(dir: 1 | -1) => {
			if (items.length === 0) return;
			if (!isOpen) {
				setIsOpen(true);
				return;
			}
			let i = activeIndex;
			if (i === -1) {
				// 활성 없음에서 첫 입력: 아래(dir=1)면 -1 유지 → 첫 step 이 0(첫 항목),
				// 위(dir=-1)면 0 으로 두어 → 첫 step 이 len-1(마지막 항목).
				// 보정하지 않으면 위 방향에서 (-1-1+len)%len = len-2 로 마지막을 건너뛴다.
				i = dir === 1 ? -1 : 0;
			}
			const len = items.length;
			for (let step = 0; step < len; step++) {
				i = (i + dir + len) % len;
				if (!items[i].disabled) {
					setActiveIndex(i);
					break;
				}
			}
		},
		[items, isOpen, activeIndex],
	);

	const commitActive = useCallback(() => {
		if (activeIndex < 0 || activeIndex >= items.length) return;
		const item = items[activeIndex];
		if (item.disabled) return;
		onCommit(item);
	}, [activeIndex, items, onCommit]);

	const firstEnabled = useCallback(() => items.findIndex((o) => !o.disabled), [items]);
	const lastEnabled = useCallback(() => {
		for (let i = items.length - 1; i >= 0; i--) {
			if (!items[i].disabled) return i;
		}
		return -1;
	}, [items]);

	const onTriggerKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			if (disabled) return;
			switch (event.key) {
				case " ":
				case "Enter":
					event.preventDefault();
					if (!isOpen) setIsOpen(true);
					else commitActive();
					break;
				case "ArrowDown":
					event.preventDefault();
					moveActive(1);
					break;
				case "ArrowUp":
					event.preventDefault();
					moveActive(-1);
					break;
				case "Home":
					event.preventDefault();
					setIsOpen(true);
					setActiveIndex(firstEnabled());
					break;
				case "End":
					event.preventDefault();
					setIsOpen(true);
					setActiveIndex(lastEnabled());
					break;
				case "Escape":
					event.preventDefault();
					setIsOpen(false);
					break;
				case "Tab":
					// APG Combobox: Tab 은 리스트를 닫고 자연스러운 포커스 이동을 허용
					// (preventDefault 하지 않는다).
					setIsOpen(false);
					break;
			}
		},
		[disabled, isOpen, commitActive, moveActive, firstEnabled, lastEnabled],
	);

	const onInputKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			// 열린 채로 런타임에 비활성화될 수 있다. 그때 Enter 가 통과하면 값이 바뀐다.
			if (disabled) return;
			// IME 조합 중 Enter 는 조합 확정용 - 선택·이동·닫기를 트리거하지 않는다.
			if (event.nativeEvent.isComposing) return;
			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					moveActive(1);
					break;
				case "ArrowUp":
					event.preventDefault();
					moveActive(-1);
					break;
				case "Enter":
					event.preventDefault();
					commitActive();
					break;
				case "Escape":
					event.preventDefault();
					close();
					break;
				case "Tab":
					// 닫으면서 트리거로 포커스를 되돌리고, 브라우저 기본 Tab 이동이 이어진다.
					close();
					break;
			}
			// Home/End 는 커서 이동에 양보한다 - 입력 안에서는 텍스트 조작이 우선이다.
		},
		[disabled, moveActive, commitActive, close],
	);

	// 열림·목록 변경 시 활성 인덱스를 범위 안으로 되돌린다.
	// 소비자가 준 initialActiveIndex 가 있으면 그것을, 없으면 첫 활성 항목을 쓴다.
	// biome-ignore lint/correctness/useExhaustiveDependencies: initialActiveIndex 는 매 렌더 새 함수일 수 있어 의존성에서 뺀다 - isOpen/items 변화에만 반응하면 된다
	useEffect(() => {
		if (!isOpen) return;
		const preferred = initialActiveIndex?.(items) ?? -1;
		setActiveIndex(preferred >= 0 ? preferred : items.findIndex((o) => !o.disabled));
	}, [isOpen, items]);

	// 방향키로 옮긴 활성 항목이 스크롤 밖에 있으면 따라 스크롤한다. 포커스는 트리거·입력에
	// 남으므로(APG) 브라우저가 알아서 스크롤해 주지 않는다 - 옵션 20개 목록에서 아래로 내려가면
	// 활성 표시가 보이지 않는 채로 움직였다.
	useEffect(() => {
		if (!isOpen || activeIndex < 0) return;
		const list = listRef.current;
		if (!list) return;
		const option = list.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex];
		// `block: "nearest"` - 필요한 만큼만 움직이고 페이지 스크롤은 건드리지 않는다.
		option?.scrollIntoView?.({ block: "nearest" });
		// items 도 의존성이다 - 인덱스가 그대로여도 그 자리의 항목이 바뀔 수 있다(Dropdown 검색
		// 필터, Combobox 비동기 검색). 그때 스크롤 위치를 그대로 두면 새 활성 항목이 화면 밖에 남는다.
	}, [isOpen, activeIndex, items]);

	// 배치는 Popover·Tooltip 과 같은 훅에 맡긴다 - flip·shift·scroll/resize 재계산을 이미 갖고
	// 있고, 포탈로 띄우므로 조상의 `overflow: hidden` 이 잘라내지 못한다(#586).
	const anchored = useAnchoredPosition({
		open: isOpen,
		anchorRef: wrapperRef,
		floatingRef: panelRef,
		placement: "bottom",
		// 트리거 왼쪽 변에 맞춘다 - 목록이 컨트롤의 연장으로 읽혀야 한다.
		align: "start",
		gap: LIST_GAP,
		padding: LIST_PADDING,
	});

	return {
		isOpen,
		setIsOpen,
		dropUp: anchored.placement === "top",
		position: {
			x: anchored.x,
			y: anchored.y,
			width: anchored.anchorWidth,
			maxWidth: anchored.maxWidth,
			ready: anchored.ready,
		},
		activeIndex,
		setActiveIndex,
		wrapperRef,
		triggerRef,
		listRef,
		panelRef,
		close,
		moveActive,
		commitActive,
		onTriggerKeyDown,
		onInputKeyDown,
	};
}
