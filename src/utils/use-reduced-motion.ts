"use client";

import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// MediaQueryList 를 모듈 스코프에 1회 생성·재사용 (getSnapshot 이 렌더마다 호출되므로).
// 단, window.matchMedia 참조가 바뀌면(테스트 목 교체/SSR) 캐시를 무효화한다.
let mqCache: MediaQueryList | null = null;
let cachedFor: typeof window.matchMedia | null = null;

function getMediaQuery(): MediaQueryList | null {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		mqCache = null;
		cachedFor = null;
		return null;
	}
	if (!mqCache || cachedFor !== window.matchMedia) {
		mqCache = window.matchMedia(QUERY);
		cachedFor = window.matchMedia;
	}
	return mqCache;
}

function subscribe(onStoreChange: () => void): () => void {
	const mq = getMediaQuery();
	if (!mq) return () => {};
	mq.addEventListener("change", onStoreChange);
	return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
	return getMediaQuery()?.matches ?? false;
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
