"use client";

import * as React from "react";

const isClient = typeof window !== "undefined";
const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * 사용자가 OS 수준에서 "동작 줄이기"를 켰는지 반환한다 (WCAG 2.3.3).
 * spring 훅이나 JS 애니메이션에서 모션을 끌 때 사용. SSR에서는 false.
 *
 * @example
 * ```tsx
 * const reduced = useReducedMotion();
 * const style = useSpring({ ..., immediate: reduced });
 * ```
 */
export function useReducedMotion(): boolean {
	const [reduced, setReduced] = React.useState<boolean>(() => {
		if (!isClient || typeof window.matchMedia !== "function") return false;
		return window.matchMedia(QUERY).matches;
	});

	React.useEffect(() => {
		if (!isClient || typeof window.matchMedia !== "function") return;
		const mq = window.matchMedia(QUERY);
		const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
		setReduced(mq.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return reduced;
}
