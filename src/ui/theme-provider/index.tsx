"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
	/** 현재 선택된 모드 (system 포함) */
	mode: ThemeMode;
	/** 실제로 적용된 테마 (system은 prefers-color-scheme으로 해석됨) */
	resolved: ResolvedTheme;
	/** 모드 변경 */
	setMode: (mode: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider 안에서 호출. mode/resolved/setMode를 반환.
 * Provider 외부에서 호출하면 에러를 던진다.
 */
export const useTheme = (): ThemeContextValue => {
	const ctx = React.useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
};

export interface ThemeProviderProps {
	/** 초기 테마 (기본값: "system") */
	defaultMode?: ThemeMode;
	/** localStorage 키 (기본값: "bt-theme"). null이면 저장 안 함 */
	storageKey?: string | null;
	/** 적용 대상 element selector (기본값: document.documentElement) */
	targetSelector?: string;
	children: React.ReactNode;
}

const isClient = typeof window !== "undefined";

function readStored(key: string | null): ThemeMode | null {
	if (!isClient || !key) return null;
	try {
		const value = window.localStorage.getItem(key);
		if (value === "light" || value === "dark" || value === "system") return value;
	} catch {
		// localStorage disabled (incognito 등) — 무시
	}
	return null;
}

function resolveSystem(): ResolvedTheme {
	if (!isClient) return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Bigtablet DS 테마 컨텍스트를 제공한다.
 * `data-theme` attribute를 root element에 적용해서 CSS 변수 레이어를 전환한다.
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
	defaultMode = "system",
	storageKey = "bt-theme",
	targetSelector,
	children,
}) => {
	const [mode, setModeState] = React.useState<ThemeMode>(() => {
		return readStored(storageKey) ?? defaultMode;
	});

	const [systemDark, setSystemDark] = React.useState<boolean>(() => {
		if (!isClient) return false;
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	// prefers-color-scheme 변경 감지
	React.useEffect(() => {
		if (!isClient) return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const resolved: ResolvedTheme = mode === "system" ? (systemDark ? "dark" : "light") : mode;

	// data-theme attribute 적용
	React.useEffect(() => {
		if (!isClient) return;
		const target = targetSelector
			? document.querySelector(targetSelector)
			: document.documentElement;
		if (!target) return;

		if (mode === "system") {
			// system 모드는 attribute 제거 → CSS의 @media (prefers-color-scheme) 룰이 작동
			target.removeAttribute("data-theme");
		} else {
			target.setAttribute("data-theme", mode);
		}
	}, [mode, targetSelector]);

	const setMode = React.useCallback(
		(next: ThemeMode) => {
			setModeState(next);
			if (storageKey && isClient) {
				try {
					window.localStorage.setItem(storageKey, next);
				} catch {
					// 저장 실패는 무시
				}
			}
		},
		[storageKey],
	);

	const value = React.useMemo<ThemeContextValue>(
		() => ({ mode, resolved, setMode }),
		[mode, resolved, setMode],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
