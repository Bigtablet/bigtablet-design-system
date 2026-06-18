"use client";

import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function hasMatchMedia(): boolean {
	return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function subscribe(onStoreChange: () => void): () => void {
	if (!hasMatchMedia()) return () => {};
	const mq = window.matchMedia(QUERY);
	mq.addEventListener("change", onStoreChange);
	return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
	if (!hasMatchMedia()) return false;
	return window.matchMedia(QUERY).matches;
}

// SSR 초기값 - 서버 마크업과 일치(hydration mismatch 방지)
function getServerSnapshot(): boolean {
	return false;
}

/**
 * 사용자가 OS 수준에서 "동작 줄이기"를 켰는지 반환한다 (WCAG 2.3.3).
 * spring 훅이나 JS 애니메이션에서 모션을 끌 때 사용. SSR에서는 false.
 *
 * React 표준 `useSyncExternalStore` 로 matchMedia 를 구독한다 - 불필요한
 * 마운트 리렌더 없이 hydration-safe 하게 동작.
 *
 * @example
 * ```tsx
 * const reduced = useReducedMotion();
 * const style = useSpring({ ..., immediate: reduced });
 * ```
 */
export function useReducedMotion(): boolean {
	return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
