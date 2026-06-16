"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * SSR 안전 `useLayoutEffect`.
 *
 * 서버(Node)에는 DOM layout 단계가 없어 `useLayoutEffect` 가 React 경고
 * ("useLayoutEffect does nothing on the server")를 출력한다. 브라우저에선
 * `useLayoutEffect`(paint 전 동기 실행 — 레이아웃 측정/조정용), 서버에선
 * `useEffect` 로 안전하게 대체한다.
 */
export const useSafeLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;
