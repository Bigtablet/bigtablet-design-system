"use client";

import * as React from "react";
import { useSafeLayoutEffect } from "./use-safe-layout-effect";

/** 앵커(트리거) 기준 선호 배치 방향. 넘칠 때 반대편으로 flip 될 수 있다. */
export type AnchoredSide = "top" | "bottom" | "left" | "right";

/** getBoundingClientRect 에서 필요한 값만. 뷰포트 기준 좌표(fixed). */
export interface AnchorRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

export interface FloatingSize {
	width: number;
	height: number;
}

export interface Viewport {
	width: number;
	height: number;
}

export interface AnchoredOptions {
	/** 선호 배치. 넘치면 반대편으로 뒤집힐 수 있다. */
	placement: AnchoredSide;
	/** 앵커와 플로팅 사이 간격(px). 기본 8. */
	gap?: number;
	/** 뷰포트 가장자리 최소 여백(px, collisionPadding). 기본 8. */
	padding?: number;
}

export interface AnchoredResult {
	/** fixed left(px). */
	x: number;
	/** fixed top(px). */
	y: number;
	/** flip 반영된 실제 배치. */
	placement: AnchoredSide;
	/** 가용 폭보다 넓어 줄여야 하면 그 값, 아니면 null. */
	maxWidth: number | null;
}

const OPPOSITE: Record<AnchoredSide, AnchoredSide> = {
	top: "bottom",
	bottom: "top",
	left: "right",
	right: "left",
};

const isVertical = (side: AnchoredSide) => side === "top" || side === "bottom";

const clamp = (value: number, min: number, max: number) =>
	// max < min(가용 공간이 플로팅보다 작을 때)이면 min(가장자리 여백)에 고정.
	Math.max(min, Math.min(max, value));

/** 주축(placement 방향) 좌표 — 플로팅 top-left 의 x 또는 y. */
const mainAxisStart = (
	side: AnchoredSide,
	anchor: AnchorRect,
	floating: FloatingSize,
	gap: number,
): number => {
	switch (side) {
		case "top":
			return anchor.top - gap - floating.height;
		case "bottom":
			return anchor.top + anchor.height + gap;
		case "left":
			return anchor.left - gap - floating.width;
		case "right":
			return anchor.left + anchor.width + gap;
	}
};

/** 해당 side 로 뒀을 때 주축이 뷰포트(여백 포함) 안에 들어오는가. */
const fitsMainAxis = (
	side: AnchoredSide,
	anchor: AnchorRect,
	floating: FloatingSize,
	viewport: Viewport,
	gap: number,
	padding: number,
): boolean => {
	const start = mainAxisStart(side, anchor, floating, gap);
	switch (side) {
		case "top":
			return start >= padding;
		case "bottom":
			return start + floating.height <= viewport.height - padding;
		case "left":
			return start >= padding;
		case "right":
			return start + floating.width <= viewport.width - padding;
	}
};

/**
 * 순수 배치 계산 — 앵커/플로팅/뷰포트 rect 로 fixed 좌표를 낸다. DOM·React 의존 없음(테스트 용이).
 *
 * 1. **shrink** — 플로팅이 뷰포트 가용 폭보다 넓으면 `maxWidth` 로 줄인다.
 * 2. **flip** — 선호 side 가 주축으로 넘치고 반대편은 맞으면 반대편으로 뒤집는다.
 * 3. **shift** — 교차축(중앙 정렬)이 뷰포트를 벗어나면 여백 안으로 민다.
 *
 * `placement` 는 선호값이고 결과의 `placement` 가 실제 적용된 방향(Radix `side` + `collisionPadding` 계약).
 */
export function computeAnchoredPosition(
	anchor: AnchorRect,
	floating: FloatingSize,
	viewport: Viewport,
	options: AnchoredOptions,
): AnchoredResult {
	const gap = options.gap ?? 8;
	const padding = options.padding ?? 8;

	// 1. shrink — 가용 폭 초과 시 max-width 축소
	const available = viewport.width - padding * 2;
	let maxWidth: number | null = null;
	let width = floating.width;
	if (width > available) {
		width = available;
		maxWidth = available;
	}
	const sized: FloatingSize = { width, height: floating.height };

	// 2. flip — 선호가 안 맞고 반대편이 맞으면 뒤집기
	let side = options.placement;
	if (
		!fitsMainAxis(side, anchor, sized, viewport, gap, padding) &&
		fitsMainAxis(OPPOSITE[side], anchor, sized, viewport, gap, padding)
	) {
		side = OPPOSITE[side];
	}

	// 3. 주축 좌표 + 교차축 중앙정렬 후 shift(clamp)
	let x: number;
	let y: number;
	if (isVertical(side)) {
		y = mainAxisStart(side, anchor, sized, gap);
		x = anchor.left + anchor.width / 2 - sized.width / 2;
		x = clamp(x, padding, viewport.width - padding - sized.width);
	} else {
		x = mainAxisStart(side, anchor, sized, gap);
		y = anchor.top + anchor.height / 2 - sized.height / 2;
		y = clamp(y, padding, viewport.height - padding - sized.height);
	}

	return { x, y, placement: side, maxWidth };
}

export interface UseAnchoredPositionArgs extends AnchoredOptions {
	/** 열림 상태 — false 면 계산을 멈추고 ready 를 내린다. */
	open: boolean;
	/** 앵커(트리거) 요소 ref. */
	anchorRef: React.RefObject<HTMLElement | null>;
	/** 측정할 플로팅 요소 ref. */
	floatingRef: React.RefObject<HTMLElement | null>;
}

export interface AnchoredState extends AnchoredResult {
	/** 최초 측정 전에는 false — 이때 플로팅을 숨겨 (0,0) 깜빡임을 막는다. */
	ready: boolean;
}

/**
 * 앵커/플로팅 ref 를 재서 fixed 좌표를 돌려주는 훅. 열려 있는 동안 scroll(캡처)·resize·플로팅
 * 크기 변화(ResizeObserver)에 재계산한다. 실제 배치는 {@link computeAnchoredPosition} 가 담당.
 */
export function useAnchoredPosition({
	open,
	anchorRef,
	floatingRef,
	placement,
	gap,
	padding,
}: UseAnchoredPositionArgs): AnchoredState {
	const [state, setState] = React.useState<AnchoredState>({
		x: 0,
		y: 0,
		placement,
		maxWidth: null,
		ready: false,
	});

	useSafeLayoutEffect(() => {
		if (!open) {
			setState((prev) => (prev.ready ? { ...prev, ready: false } : prev));
			return;
		}
		const anchor = anchorRef.current;
		const floating = floatingRef.current;
		if (!anchor || !floating) return;

		const update = () => {
			const a = anchor.getBoundingClientRect();
			const f = floating.getBoundingClientRect();
			const result = computeAnchoredPosition(
				{ top: a.top, left: a.left, width: a.width, height: a.height },
				{ width: f.width, height: f.height },
				{ width: window.innerWidth, height: window.innerHeight },
				{ placement, gap, padding },
			);
			setState({ ...result, ready: true });
		};

		update();
		// capture=true 로 스크롤 조상까지 잡는다(스크롤 이벤트는 버블링하지 않음).
		window.addEventListener("scroll", update, true);
		window.addEventListener("resize", update);
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
		observer?.observe(floating);

		return () => {
			window.removeEventListener("scroll", update, true);
			window.removeEventListener("resize", update);
			observer?.disconnect();
		};
	}, [open, placement, gap, padding, anchorRef, floatingRef]);

	return state;
}
