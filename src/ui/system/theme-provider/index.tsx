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
	if (!ctx) {
		throw new Error(
			"[Bigtablet DS] useTheme는 <ThemeProvider> 안에서만 사용 가능합니다.\n\n" +
				"앱 최상단에 <ThemeProvider>로 감싸주세요:\n" +
				'  <ThemeProvider mode="system">\n' +
				"    <YourApp />\n" +
				"  </ThemeProvider>",
		);
	}
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
		// localStorage disabled (incognito 등) - 무시
	}
	return null;
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
	// SSR/CSR 첫 렌더를 deterministic 하게 — server 와 동일한 기본값으로 시작해 hydration mismatch 방지.
	// 저장된 mode / 시스템 다크 설정은 mount 후 effect 에서 1회 동기화한다.
	// (테마 깜빡임을 완전히 없애려면 hydration 전에 inline <script> 로 document.documentElement 의
	//  data-theme 를 직접 세팅하는 것을 권장 — next-themes 와 동일한 패턴)
	const [mode, setModeState] = React.useState<ThemeMode>(defaultMode);
	const [systemDark, setSystemDark] = React.useState<boolean>(false);

	// mount 후 저장값 + 시스템 설정 동기화 (storageKey 변경 시에만 재실행 — body 는 storageKey 외
	// 모듈 상수/안정 setter 만 참조하므로 deps 완전)
	React.useEffect(() => {
		// storageKey 가 바뀌면 새 키의 저장값으로 동기화. 저장값이 없으면 defaultMode 로 리셋
		// (이전 키의 테마가 남지 않도록).
		setModeState(readStored(storageKey) ?? defaultMode);
		if (isClient) {
			setSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
		}
	}, [storageKey, defaultMode]);

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
