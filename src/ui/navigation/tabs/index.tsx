"use client";

import * as React from "react";
import { cn, type SafeHTMLProps, useSafeLayoutEffect } from "../../../utils";
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
	/** Tab 의 disabled 상태 - 선택된 탭 · 대신할 탭 판정에서 뺀다 */
	markDisabled: (value: string, disabled: boolean) => void;
	/** 선택된 탭이 tab stop 이 될 수 없을 때(값이 어느 탭과도 안 맞거나 그 탭이 disabled) 대신 tab stop 이 될 탭 */
	fallbackTabValue: string | undefined;
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

export interface TabsProps
	extends Omit<SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>>, "onChange"> {
	/** 제어형: 현재 활성 tab의 value */
	value?: string;
	/** 비제어형: 초기 활성 tab의 value */
	defaultValue?: string;
	/** value 변경 콜백 */
	onValueChange?: (value: string) => void;
	/** 시각 스타일 (기본값: "line"). line=하단 underline, fills=활성 탭을 채운 둥근 박스 그룹 */
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
	// 순서와 disabled 를 따로 둔다 - 한 등록에 묶으면 disabled 가 바뀔 때 cleanup 이 항목을 뺐다 다시 넣어
	// 순서가 끝으로 밀린다
	const orderRef = React.useRef<string[]>([]);
	const [order, setOrder] = React.useState<string[]>([]);
	const [disabledTabs, setDisabledTabs] = React.useState<ReadonlySet<string>>(() => new Set());
	const registerTab = React.useCallback((v: string) => {
		if (!orderRef.current.includes(v)) {
			orderRef.current = [...orderRef.current, v];
			setOrder(orderRef.current);
		}
		return () => {
			orderRef.current = orderRef.current.filter((x) => x !== v);
			setOrder(orderRef.current);
		};
	}, []);
	const markDisabled = React.useCallback((v: string, disabled: boolean) => {
		setDisabledTabs((prev) => {
			if (prev.has(v) === disabled) return prev;
			const next = new Set(prev);
			if (disabled) next.add(v);
			else next.delete(v);
			return next;
		});
	}, []);
	// 선택된 탭이 고를 수 있는 탭이 아니면 첫 활성 탭을 tab stop 으로 둔다. 예전에는 "값이 비었을 때 첫 탭" 만
	// 봐서, 제어형 value 가 어느 탭과도 안 맞거나 첫 탭이 disabled 면 tab stop 이 하나도 없어 키보드로 목록에
	// 들어갈 수 없었다 (#984)
	const activeIsStop = order.includes(value) && !disabledTabs.has(value);
	const fallbackTabValue = activeIsStop ? undefined : order.find((x) => !disabledTabs.has(x));

	const idPrefix = React.useId();
	const ctx = React.useMemo<TabsContextValue>(
		() => ({
			value,
			setValue,
			variant,
			size,
			idPrefix,
			registerTab,
			markDisabled,
			fallbackTabValue,
		}),
		[value, setValue, variant, size, idPrefix, registerTab, markDisabled, fallbackTabValue],
	);
	return (
		<TabsContext.Provider value={ctx}>
			<div
				className={cn("tabs", `tabs_variant_${variant}`, `tabs_size_${size}`, className)}
				{...props}
			>
				{children}
			</div>
		</TabsContext.Provider>
	);
};

/**
 * 탭 · 패널 id. value 를 인코딩한다 - 공백이 든 value 를 그대로 쓰면 aria-controls · aria-labelledby 가
 * 공백에서 끊겨 다른 id 목록으로 읽혔다 (#984)
 */
const tabIds = (prefix: string, value: string) => {
	const key = encodeURIComponent(value);
	return { panelId: `${prefix}-panel-${key}`, tabId: `${prefix}-tab-${key}` };
};

export interface TabListProps extends SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>> {
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

		// childList·characterData 도 본다. 선택 표시만 보면 **탭이 늘거나 줄 때**와 라벨 글자가
		// 바뀔 때(`전체 (9)` → `전체 (137)`) 인디케이터가 옛 자리에 남는다. `line` variant 의
		// `.tabs_list` 는 폭이 100% 로 늘어난 flex 아이템이라 박스가 그대로여서 ResizeObserver
		// 도 발화하지 않는다 - 그래서 여기서 잡아야 한다.
		const mo = new MutationObserver(update);
		mo.observe(list, {
			subtree: true,
			attributes: true,
			attributeFilter: ["aria-selected"],
			childList: true,
			characterData: true,
		});

		const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
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

export interface TabProps
	extends Omit<SafeHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>>, "value"> {
	/** 이 tab의 value */
	value: string;
}

export const Tab = ({ value, className, children, onClick, onKeyDown, ...props }: TabProps) => {
	const ctx = useTabsContext();
	const isActive = ctx.value === value;
	const { panelId, tabId } = tabIds(ctx.idPrefix, value);

	// 마운트 순서 등록 (선택된 탭이 tab stop 이 될 수 없을 때 대신할 탭 판별용)
	const { registerTab, markDisabled } = ctx;
	const disabled = !!props.disabled;
	React.useEffect(() => registerTab(value), [registerTab, value]);
	React.useEffect(() => {
		markDisabled(value, disabled);
		return () => markDisabled(value, false);
	}, [markDisabled, value, disabled]);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		ctx.setValue(value);
		onClick?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		// 소비자 onKeyDown 을 먼저 실행하고 화살표 내비게이션을 이어간다
		// ({...props} 로 넘어온 onKeyDown 이 내비게이션을 통째로 제거하지 않도록 합성).
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End")
			return;
		const list = (e.currentTarget as HTMLElement).closest('[role="tablist"]');
		if (!list) return;
		const tabs = Array.from(
			list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
		);
		const currentIndex = tabs.indexOf(e.currentTarget);
		if (currentIndex < 0) return;
		e.preventDefault();
		let next = currentIndex;
		if (e.key === "ArrowRight") next = (currentIndex + 1) % tabs.length;
		else if (e.key === "ArrowLeft") next = (currentIndex - 1 + tabs.length) % tabs.length;
		else if (e.key === "Home") next = 0;
		else if (e.key === "End") next = tabs.length - 1;
		const target = tabs[next];
		const targetValue = target?.dataset.value;
		// `value=""` 탭도 클릭으로는 선택되므로 빈 문자열을 거르지 않는다
		if (target && targetValue !== undefined) {
			ctx.setValue(targetValue);
			target.focus();
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
			tabIndex={(isActive && !disabled) || value === ctx.fallbackTabValue ? 0 : -1}
			className={cn("tabs_tab", isActive && "tabs_tab_active", className)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			{children}
		</button>
	);
};

export interface TabPanelProps extends SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>> {
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
	const { panelId, tabId } = tabIds(ctx.idPrefix, value);

	if (!isActive && unmountInactive) return null;

	return (
		<div
			role="tabpanel"
			id={panelId}
			aria-labelledby={tabId}
			hidden={!isActive}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: APG Tabs - 포커스 가능한 요소가 없는 패널도 Tab 으로 닿아야 한다
			tabIndex={0}
			className={cn("tabs_panel", className)}
			{...props}
		>
			{children}
		</div>
	);
};
