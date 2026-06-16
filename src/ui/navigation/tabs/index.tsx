"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type TabsVariant = "line" | "fills";
export type TabsSize = "sm" | "md";

interface TabsContextValue {
	value: string;
	setValue: (v: string) => void;
	variant: TabsVariant;
	size: TabsSize;
	idPrefix: string;
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

	const idPrefix = React.useId();
	const ctx = React.useMemo<TabsContextValue>(
		() => ({ value, setValue, variant, size, idPrefix }),
		[value, setValue, variant, size, idPrefix],
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
	React.useLayoutEffect(() => {
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

export const Tab = ({ value, className, children, onClick, ...props }: TabProps) => {
	const ctx = useTabsContext();
	const isActive = ctx.value === value;
	const panelId = `${ctx.idPrefix}-panel-${value}`;
	const tabId = `${ctx.idPrefix}-tab-${value}`;

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		ctx.setValue(value);
		onClick?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
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
			type="button"
			role="tab"
			id={tabId}
			data-value={value}
			aria-selected={isActive}
			aria-controls={panelId}
			tabIndex={isActive ? 0 : -1}
			className={cn("tabs_tab", isActive && "tabs_tab_active", className)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			{...props}
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
