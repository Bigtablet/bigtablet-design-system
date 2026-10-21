"use client";

import { useCallback } from "react";

/**
 * 상단 고정 헤더의 높이를 `<html>` 의 `--bt-top-inset` 에 기록하는 callback ref.
 *
 * theme.scss 가 `html { scroll-padding-top: var(--bt-top-inset, 0px) }` 로 읽어, Tab 이동·앵커
 * 이동으로 스크롤될 때 대상이 헤더 밑에 숨지 않게 한다(WCAG 2.4.11). 헤더 높이는 내용에 따라
 * 달라져 CSS 만으로는 알 수 없으므로 ResizeObserver 로 잰다.
 *
 * `measure` 는 ref 를 붙인 요소에서 잴 대상을 고른다 - 기본은 요소 자신.
 * 헤더가 화면에서 빠지면(unmount·`enabled=false`) 값을 지운다.
 *
 * ponytail: 기록하는 쪽은 한 번에 하나라고 가정한다(AppShell header 또는 그 밖의 sticky NavBar).
 * 고정 헤더를 여러 겹 쌓는 화면이 생기면 합산 채널이 필요하다.
 */
export const useTopInset = <T extends HTMLElement>(
	enabled: boolean,
	measure: (el: T) => HTMLElement | null = (el) => el,
) =>
	// biome-ignore lint/correctness/useExhaustiveDependencies: measure 는 호출부마다 고정 함수다 - 넣으면 매 렌더 재구독한다
	useCallback(
		(el: T | null) => {
			const target = el && measure(el);
			if (!enabled || !target || typeof ResizeObserver === "undefined") return;
			const root = document.documentElement;
			const observer = new ResizeObserver(() => {
				root.style.setProperty("--bt-top-inset", `${target.offsetHeight}px`);
			});
			observer.observe(target);
			return () => {
				observer.disconnect();
				root.style.removeProperty("--bt-top-inset");
			};
		},
		[enabled],
	);
