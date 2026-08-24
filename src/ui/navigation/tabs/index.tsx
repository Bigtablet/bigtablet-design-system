"use client";

import * as React from "react";
import { cn, useSafeLayoutEffect } from "../../../utils";
import "./style.scss";

export type TabsVariant = "line" | "fills";
export type TabsSize = "sm" | "md";

interface TabsContextValue {
	value: string;
	setValue: (v: string) => void;
	variant: TabsVariant;
	size: TabsSize;
	idPrefix: string;
	/** Tab 이 마운트 순서대로 자신을 등록 - 미선택 시 어느 탭이 유일한 tab stop 인지 판별용 */
	registerTab: (value: string) => () => void;
	/** 마운트 순서상 첫 번째 탭의 value (미선택 시 roving tabindex 진입점) */
	firstTabValue: string | undefined;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
	const ctx = React.useContext(TabsContext);
	if (!ctx) {
		throw new Error(
			"[Bigtablet DS] <Tab>, <TabList>, <TabPanel>은 반드시 <Tabs> 안에 있어야 합니다.\n\n" +
				"올바른 사용 예:\n" +
				'  <Tabs defaultValue="a">\n' +
				"    <TabList>\n" +
				'      <Tab value="a">A</Tab>\n' +
				"    </TabList>\n" +
				'    <TabPanel value="a">...</TabPanel>\n' +
				"  </Tabs>",
		);
	}
	return ctx;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** 제어형: 현재 활성 tab의 value */
	value?: string;
	/** 비제어형: 초기 활성 tab의 value */
	defaultValue?: string;
	/** value 변경 콜백 */
	onValueChange?: (value: string) => void;
	/** 시각 스타일 (기본값: "line"). line=하단 underline, pills=둥근 박스 */
	variant?: TabsVariant;
	/** 크기 (기본값: "md") */
	size?: TabsSize;
}

/**
 * 탭 컨테이너. TabList + TabPanel을 자식으로 받음.
 * 컨텍스트로 value/onValueChange를 자식들에게 공유.
 * - 제어형: `value` + `onValueChange`
 * - 비제어형: `defaultValue`
 */
export const Tabs = ({
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	variant = "line",
	size = "md",
	className,
	children,
	...props
}: TabsProps) => {
	const isControlled = controlledValue !== undefined;
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const value = isControlled ? controlledValue : internalValue;

	const setValue = React.useCallback(
		(v: string) => {
			if (!isControlled) setInternalValue(v);
			onValueChange?.(v);
		},
		[isControlled, onValueChange],
	);

	// 마운트 순서대로 탭 value 를 등록해 "첫 번째 탭"을 판별한다. 선택된 탭이 없을 때
	// roving tabindex 를 유지(첫 탭만 tabIndex=0)하기 위함 - 전부 0 이면 Tab 키가 모든
	// 탭을 순회해 리스트 건너뛰기가 불편해지는 WAI-ARIA 위반이 된다.
	const orderRef = React.useRef<string[]>([]);
	const [firstTabValue, setFirstTabValue] = React.useState<string>();
	const registerTab = React.useCallback((v: string) => {
		if (!orderRef.current.includes(v)) {
			orderRef.current = [...orderRef.current, v];
			setFirstTabValue(orderRef.current[0]);
		}
		return () => {
			orderRef.current = orderRef.current.filter((x) => x !== v);
			setFirstTabValue(orderRef.current[0]);
		};
	}, []);

	const idPrefix = React.useId();
	const ctx = React.useMemo<TabsContextValue>(
		() => ({ value, setValue, variant, size, idPrefix, registerTab, firstTabValue }),
		[value, setValue, variant, size, idPrefix, registerTab, firstTabValue],
	);
	return (
		<TabsContext.Provider value={ctx}>
			<div className={cn("tabs", `tabs_variant_${variant}`, `tabs_size_${size}`, className)} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	);
};

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 스크린리더 라벨 */
	ariaLabel?: string;
}

export const TabList = ({ ariaLabel, className, children, ...props }: TabListProps) => {
	const { variant } = useTabsContext();
	const listRef = React.useRef<HTMLDivElement>(null);
	const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);
	const [hasMounted, setHasMounted] = React.useState(false);

	// active tab 위치 추적 - sliding indicator (line=underline / fills=filled box)
	useSafeLayoutEffect(() => {
		const list = listRef.current;
		if (!list) return;

		const update = () => {
			const active = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
			if (active) {
				setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
			} else {
				setIndicator(null);
			}
		};

		update();
		const mountTimer = setTimeout(() => setHasMounted(true), 50);

		const mo = new MutationObserver(update);
		mo.observe(list, {
			subtree: true,
			attributes: true,
			attributeFilter: ["aria-selected"],
		});

		const ro =
			typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
		ro?.observe(list);
		const handleResize = () => update();
		window.addEventListener("resize", handleResize);

		return () => {
			clearTimeout(mountTimer);
			mo.disconnect();
			ro?.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, [variant]);

	return (
		<div
			ref={listRef}
			role="tablist"
			aria-label={ariaLabel}
			className={cn("tabs_list", `tabs_list_${variant}`, className)}
			{...props}
		>
			{indicator && (
				<span
					aria-hidden="true"
					className={cn(
						"tabs_indicator",
						`tabs_indicator_${variant}`,
						hasMounted && "tabs_indicator_animated",
					)}
					style={{ left: indicator.left, width: indicator.width }}
				/>
			)}
			{children}
		</div>
	);
};

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
	/** 이 tab의 value */
	value: string;
}

export const Tab = ({ value, className, children, onClick, onKeyDown, ...props }: TabProps) => {
	const ctx = useTabsContext();
	const isActive = ctx.value === value;
	const panelId = `${ctx.idPrefix}-panel-${value}`;
	const tabId = `${ctx.idPrefix}-tab-${value}`;

	// 마운트 순서 등록 (미선택 시 첫 탭만 tab stop 이 되도록 firstTabValue 판별용)
	const { registerTab } = ctx;
	React.useEffect(() => registerTab(value), [registerTab, value]);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		ctx.setValue(value);
		onClick?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		// 소비자 onKeyDown 을 먼저 실행하고 화살표 내비게이션을 이어간다
		// ({...props} 로 넘어온 onKeyDown 이 내비게이션을 통째로 제거하지 않도록 합성).
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
		const list = (e.currentTarget as HTMLElement).closest('[role="tablist"]');
		if (!list) return;
		const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
		const currentIndex = tabs.indexOf(e.currentTarget);
		if (currentIndex < 0) return;
		e.preventDefault();
		let next = currentIndex;
		if (e.key === "ArrowRight") next = (currentIndex + 1) % tabs.length;
		else if (e.key === "ArrowLeft") next = (currentIndex - 1 + tabs.length) % tabs.length;
		else if (e.key === "Home") next = 0;
		else if (e.key === "End") next = tabs.length - 1;
		const targetValue = tabs[next].dataset.value;
		if (targetValue) {
			ctx.setValue(targetValue);
			tabs[next].focus();
		}
	};

	return (
		<button
			// {...props} 를 먼저 펼쳐 data-*/aria-* 는 통과시키되, tab 패턴에 필수인
			// role/aria-selected/tabIndex/onClick·onKeyDown(소비자 핸들러는 내부에서 합성)은
			// 컴포넌트가 항상 이긴다.
			{...props}
			type="button"
			role="tab"
			id={tabId}
			data-value={value}
			aria-selected={isActive}
			// aria-controls 는 항상 유지한다. unmountInactive={false} 로 비활성 패널이 DOM 에
			// 남는 용례에서도 탭↔패널 연결이 끊기지 않아야 하고, Radix 등도 SR 탐색 편의를 위해
			// 패널 마운트 여부와 무관하게 항상 지정한다(dangling IDREF 경고보다 SR 정보가 우선).
			aria-controls={panelId}
			// 로빙 tabindex - 선택된 탭이 없으면(비제어 + defaultValue 없음, value="") 마운트 순서상
			// 첫 탭만 tab stop 으로 두어 Tab 키 1회로 tablist 에 진입, 내부 이동은 화살표 키로.
			tabIndex={isActive || (!ctx.value && value === ctx.firstTabValue) ? 0 : -1}
			className={cn("tabs_tab", isActive && "tabs_tab_active", className)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			{children}
		</button>
	);
};

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 이 panel을 활성화할 tab의 value */
	value: string;
	/** 비활성 panel을 unmount 할지 (기본 true). false면 display: none으로 유지 */
	unmountInactive?: boolean;
}

export const TabPanel = ({
	value,
	unmountInactive = true,
	className,
	children,
	...props
}: TabPanelProps) => {
	const ctx = useTabsContext();
	const isActive = ctx.value === value;
	const panelId = `${ctx.idPrefix}-panel-${value}`;
	const tabId = `${ctx.idPrefix}-tab-${value}`;

	if (!isActive && unmountInactive) return null;

	return (
		<div
			role="tabpanel"
			id={panelId}
			aria-labelledby={tabId}
			hidden={!isActive}
			tabIndex={0}
			className={cn("tabs_panel", className)}
			{...props}
		>
			{children}
		</div>
	);
};
