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

/**
 * 교차축 정렬. `center` 는 앵커 중앙(Popover·Tooltip), `start`·`end` 는 앵커의 시작/끝 변에
 * 맞춘다(리스트박스는 `start`, 오른쪽 정렬 메뉴는 `end`).
 */
export type AnchoredAlign = "center" | "start" | "end";

export interface AnchoredOptions {
	/** 선호 배치. 넘치면 반대편으로 뒤집힐 수 있다. */
	placement: AnchoredSide;
	/**
	 * 교차축 정렬 (기본 `center`).
	 *
	 * 리스트박스 팝업은 `start` 다 - 트리거와 같은 폭·같은 왼쪽 변이어야 목록이 컨트롤의
	 * 연장으로 읽힌다. 중앙 정렬하면 트리거보다 좁거나 넓을 때 좌우로 어긋난다.
	 */
	align?: AnchoredAlign;
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
	/** 뷰포트 가용 폭(px) - max-width 상한. 컴포넌트 기본 max-width 안에서만 의미. */
	maxWidth: number;
	/**
	 * 배치된 방향의 가용 높이(px) - max-height 상한.
	 *
	 * 세로 배치(`top`·`bottom`)는 **그 방향에 남은 공간**, 가로 배치는 뷰포트 가용 높이다.
	 * 소비처가 이 값을 상한으로 걸어야 긴 목록이 화면 밖으로 나가지 않는다(#621). 폭과 같은
	 * 이유로 앵커·뷰포트에만 의존해 idempotent 하다 - 측정된 높이와 비교하면 진동한다.
	 */
	maxHeight: number;
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

/**
 * 해당 side 에 남은 주축 공간(px) — 앵커와 뷰포트 가장자리 사이에서 gap·padding 을 뺀 값.
 *
 * 앵커 좌표는 뷰포트 안으로 clamp 해서 센다. 스크롤로 트리거가 화면 밖으로 나가면(그래도
 * 팝업은 열린 채 남는다) 뷰포트보다 큰 공간이 나와 상한이 무의미해진다.
 */
const mainAxisSpace = (
	side: AnchoredSide,
	anchor: AnchorRect,
	viewport: Viewport,
	gap: number,
	padding: number,
): number => {
	const top = clamp(anchor.top, 0, viewport.height);
	const bottom = clamp(anchor.top + anchor.height, 0, viewport.height);
	const left = clamp(anchor.left, 0, viewport.width);
	const right = clamp(anchor.left + anchor.width, 0, viewport.width);
	switch (side) {
		case "top":
			return top - gap - padding;
		case "bottom":
			return viewport.height - bottom - gap - padding;
		case "left":
			return left - gap - padding;
		case "right":
			return viewport.width - right - gap - padding;
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
 * 1. **shrink** — 플로팅이 뷰포트 가용 폭보다 넓으면 `maxWidth` 로, 배치 방향에 남은 공간보다
 *    높으면 `maxHeight` 로 줄인다.
 * 2. **flip** — 선호 side 가 주축으로 넘치면 반대편으로. 양쪽 다 안 맞으면 공간이 더 넓은 쪽.
 * 3. **shift** — 두 축 모두 뷰포트를 벗어나면 여백 안으로 민다.
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

	// 1. shrink — max-width 는 항상 가용 폭(available)으로 돌려준다. 상수(뷰포트만 의존)라 idempotent:
	// 측정된 폭을 임계값과 비교하면(축소 → 재측정 축소 → …) max-content 컨테이너에서 진동/무한 루프가
	// 난다. available 을 max-width **상한**으로 걸면 컴포넌트 기본 max-width(예: 240) 안에서 콘텐츠
	// 폭은 그대로고, 좁은 뷰포트에서만 실제로 좁아진다.
	const available = viewport.width - padding * 2;
	const maxWidth = available;
	const sized: FloatingSize = {
		width: Math.min(floating.width, available),
		height: floating.height,
	};

	// 2. flip — 선호가 안 맞으면 반대편으로. 반대편도 안 맞으면 **공간이 더 넓은 쪽**을 고른다.
	// 예전에는 이 경우 선호를 유지했는데, 주축 clamp 도 max-height 도 없어서 "선호 유지" 가
	// 곧 "화면 밖" 이었다(#621 - 뷰포트 461px 에서 목록이 130px 넘쳤다). 이제 넓은 쪽을 고르고
	// 그 공간으로 높이를 깎으므로 어느 쪽을 골라도 화면 안이다.
	let side = options.placement;
	if (!fitsMainAxis(side, anchor, sized, viewport, gap, padding)) {
		const opposite = OPPOSITE[side];
		if (
			fitsMainAxis(opposite, anchor, sized, viewport, gap, padding) ||
			mainAxisSpace(opposite, anchor, viewport, gap, padding) >
				mainAxisSpace(side, anchor, viewport, gap, padding)
		) {
			side = opposite;
		}
	}

	// 배치된 방향의 가용 높이. 세로 배치는 그 방향에 남은 공간, 가로 배치는 뷰포트 전체다
	// (가로 배치에서 높이는 교차축이라 아래 clamp 가 민다).
	const maxHeight = isVertical(side)
		? Math.max(mainAxisSpace(side, anchor, viewport, gap, padding), 0)
		: viewport.height - padding * 2;
	sized.height = Math.min(sized.height, maxHeight);

	// 3. 주축 좌표 + 교차축 정렬 후 shift(clamp)
	const align = options.align ?? "center";
	let x: number;
	let y: number;
	if (isVertical(side)) {
		y = mainAxisStart(side, anchor, sized, gap);
		x =
			align === "start"
				? anchor.left
				: align === "end"
					? anchor.left + anchor.width - sized.width
					: anchor.left + anchor.width / 2 - sized.width / 2;
		x = clamp(x, padding, viewport.width - padding - sized.width);
		// 주축도 clamp - `maxHeight` 를 소비처가 안 쓰거나 콘텐츠가 그보다 커도 화면 밖으로
		// 나가지 않게 하는 마지막 방어선이다. 기준은 **측정된** 높이다(깎인 높이로 재면
		// 상한을 무시한 소비처를 못 잡는다). 이 경우 앵커를 덮게 되지만, 앵커 옆에서 안
		// 보이는 것보다 낫다.
		y = clamp(y, padding, viewport.height - padding - floating.height);
	} else {
		x = mainAxisStart(side, anchor, sized, gap);
		y =
			align === "start"
				? anchor.top
				: align === "end"
					? anchor.top + anchor.height - sized.height
					: anchor.top + anchor.height / 2 - sized.height / 2;
		y = clamp(y, padding, viewport.height - padding - sized.height);
		// 세로 배치와 같은 이유의 주축 방어선 - 가로 배치도 주축(x)에 clamp 가 없었다.
		x = clamp(x, padding, viewport.width - padding - floating.width);
	}

	return { x, y, placement: side, maxWidth, maxHeight };
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
	/**
	 * 앵커의 현재 폭(px), **뷰포트 가용 폭({@link AnchoredResult.maxWidth})으로 캡**.
	 * 리스트박스 팝업이 트리거 폭에 맞춰야 하는데, 포탈로 띄우면 `width: 100%` 가 트리거가
	 * 아니라 body 를 가리키므로 이 값을 인라인으로 준다.
	 *
	 * 소비처는 `width` 가 아니라 `min-width` 로 쓴다 - 폭을 못박으면 좁은 트리거에서 목록이
	 * 자기 옵션 라벨을 잘라낸다(#596). 그래서 여기서 캡이 필요하다: `min-width` 와
	 * `max-width` 가 충돌하면 CSS 는 `min-width` 를 택하므로(CSS2.1 §10.4), 원값을 그대로
	 * 주면 풀폭 트리거(트리거 폭 = 뷰포트)에서 `max-width` 가 무시되고 패널이 뷰포트를
	 * 넘는다 - 375px 화면에서 오른쪽으로 8px 삐져나갔다.
	 * 이 훅이 이미 앵커를 재고 scroll·resize·ResizeObserver 로 갱신하므로 소비처가 같은
	 * 리스너를 또 달 필요가 없다.
	 */
	anchorWidth: number;
	/**
	 * 앵커가 뷰포트와 전혀 겹치지 않는 상태(스크롤로 트리거가 화면 밖으로 나감).
	 *
	 * **사실만 돌려준다 - 닫을지는 소비처가 정한다.** 컴포넌트마다 옳은 동작이 다르다:
	 * Tooltip·Dropdown·Menu 는 잃을 상태가 없어 닫는 게 맞지만, Popover 는 안에 폼을 담을
	 * 수 있어 스크롤로 닫으면 입력이 사라진다(#624).
	 *
	 * 앵커 크기가 0 이면 false 다 - 최초 측정 전이나 숨겨진 트리거를 "화면 밖" 으로 읽어
	 * 열자마자 닫는 것을 막는다.
	 */
	anchorHidden: boolean;
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
	align,
	gap,
	padding,
}: UseAnchoredPositionArgs): AnchoredState {
	const [state, setState] = React.useState<AnchoredState>({
		x: 0,
		y: 0,
		placement,
		maxWidth: 0,
		maxHeight: 0,
		ready: false,
		anchorWidth: 0,
		anchorHidden: false,
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
				{ placement, align, gap, padding },
			);
			// 앵커가 뷰포트 밖으로 완전히 나갔는지 - 이미 잰 rect 라 추가 측정 비용이 없고,
			// scroll 리스너도 이미 달려 있어 IntersectionObserver 가 필요 없다(#624).
			const anchorHidden =
				(a.width > 0 || a.height > 0) &&
				(a.bottom <= 0 ||
					a.top >= window.innerHeight ||
					a.right <= 0 ||
					a.left >= window.innerWidth);

			// maxWidth 로 캡 - min-width 가 max-width 를 이기는 CSS 규칙 때문에 소비처가
			// 그대로 min-width 에 넣으면 상한이 무력화된다(위 anchorWidth 주석).
			setState({
				...result,
				ready: true,
				anchorWidth: Math.min(a.width, result.maxWidth),
				anchorHidden,
			});
		};

		// scroll/resize/observer 는 rAF 로 배칭 - 잦은 스크롤에도 프레임당 한 번만 재계산.
		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				update();
			});
		};

		update(); // 최초는 페인트 전 동기 배치.
		// capture=true 로 스크롤 조상까지 잡는다(스크롤 이벤트는 버블링하지 않음).
		window.addEventListener("scroll", schedule, true);
		window.addEventListener("resize", schedule);
		// 앵커·플로팅 둘 다 관찰 - 트리거 자체 크기 변화(폰트 로드·리플로우)도 반영.
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
		observer?.observe(floating);
		observer?.observe(anchor);

		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule, true);
			window.removeEventListener("resize", schedule);
			observer?.disconnect();
		};
	}, [open, placement, align, gap, padding, anchorRef, floatingRef]);

	return state;
}
