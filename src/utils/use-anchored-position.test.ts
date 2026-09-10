import { describe, expect, it } from "vitest";
import { type AnchorRect, computeAnchoredPosition } from "./use-anchored-position";

const vp = (width: number, height: number) => ({ width, height });

describe("computeAnchoredPosition", () => {
	it("aligns the cross axis to the anchor start when asked", () => {
		// 리스트박스 팝업은 트리거 왼쪽 변에 맞아야 한다 - 중앙 정렬하면 목록이 트리거보다
		// 좁거나 넓을 때 좌우로 어긋난다(#586 수정 중 실측 - 트리거 left 42 에 목록 left 233).
		const anchor: AnchorRect = { top: 200, left: 42, width: 446, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 446, height: 170 }, vp(1024, 768), {
			placement: "bottom",
			align: "start",
			gap: 4,
		});

		expect(r.x).toBe(42);
		expect(r.y).toBe(244);
		expect(r.placement).toBe("bottom");
	});

	it("aligns to the anchor end for right-aligned menus", () => {
		const anchor: AnchorRect = { top: 100, left: 400, width: 40, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 180, height: 120 }, vp(1024, 768), {
			placement: "bottom",
			align: "end",
			gap: 4,
		});

		// 앵커 오른쪽 변(440)에 목록 오른쪽 변을 맞춘다.
		expect(r.x).toBe(260);
	});

	it("keeps centering by default - Popover and Tooltip depend on it", () => {
		const anchor: AnchorRect = { top: 100, left: 400, width: 40, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 180, height: 120 }, vp(1024, 768), {
			placement: "bottom",
			gap: 4,
		});

		expect(r.x).toBe(330);
	});

	it("flips a start-aligned popup upward when it does not fit below", () => {
		// 뷰포트 아래가 모자라면 위로 뒤집는다 - 조상이 아니라 뷰포트 기준이다(포탈이라 조상은
		// 더 이상 자르지 않는다).
		const anchor: AnchorRect = { top: 700, left: 42, width: 200, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 200, height: 170 }, vp(1024, 768), {
			placement: "bottom",
			align: "start",
			gap: 4,
		});

		expect(r.placement).toBe("top");
		expect(r.y).toBe(700 - 4 - 170);
		expect(r.x).toBe(42);
	});

	it("keeps the preferred side when it fits", () => {
		// 넉넉한 뷰포트 중앙 트리거 — top 선호가 그대로 유지된다.
		const anchor: AnchorRect = { top: 300, left: 400, width: 40, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 120, height: 40 }, vp(1024, 768), {
			placement: "top",
			gap: 8,
		});
		expect(r.placement).toBe("top");
		expect(r.y).toBe(300 - 8 - 40); // anchor.top - gap - height
		expect(r.x).toBe(400 + 20 - 60); // 중앙정렬: center(420) - width/2(60)
		expect(r.maxWidth).toBe(1024 - 16); // 항상 가용 폭(상한). 240 등 컴포넌트 max-width 안에서만 의미.
	});

	it("is idempotent — feeding the already-capped width back yields the same maxWidth (no oscillation)", () => {
		// 측정폭이 available 로 줄어든 뒤 다시 계산해도 maxWidth 가 null 로 튀지 않아야 RO 루프가 안 생긴다.
		const anchor: AnchorRect = { top: 300, left: 90, width: 20, height: 20 };
		const first = computeAnchoredPosition(anchor, { width: 240, height: 40 }, vp(200, 800), {
			placement: "top",
			padding: 8,
		});
		const second = computeAnchoredPosition(
			anchor,
			{ width: first.maxWidth, height: 40 },
			vp(200, 800),
			{ placement: "top", padding: 8 },
		);
		expect(second.maxWidth).toBe(first.maxWidth);
		expect(second.x).toBe(first.x);
	});

	it("flips left → right when the preferred side overflows the viewport (issue #429 repro)", () => {
		// 375px 뷰포트, 트리거 x=16 폭32, 툴팁 240. left 는 x=-230 로 화면 밖 → right 로 flip.
		const anchor: AnchorRect = { top: 100, left: 16, width: 32, height: 32 };
		const r = computeAnchoredPosition(anchor, { width: 240, height: 34 }, vp(375, 812), {
			placement: "left",
			gap: 6,
			padding: 8,
		});
		expect(r.placement).toBe("right");
		expect(r.x).toBe(16 + 32 + 6); // 트리거 오른쪽: left + width + gap = 54
		expect(r.x).toBeGreaterThanOrEqual(8);
		expect(r.x + 240).toBeLessThanOrEqual(375 - 8); // 오른쪽 여백 안에 들어옴
	});

	it("flips top → bottom near the top edge", () => {
		const anchor: AnchorRect = { top: 4, left: 200, width: 40, height: 24 };
		const r = computeAnchoredPosition(anchor, { width: 100, height: 60 }, vp(800, 600), {
			placement: "top",
			gap: 8,
		});
		expect(r.placement).toBe("bottom");
		expect(r.y).toBe(4 + 24 + 8); // anchor 아래
	});

	it("shifts a centered tooltip back inside when it would clip the left edge", () => {
		// top 배치, 트리거가 왼쪽 끝(중심 x=32) → 중앙정렬이면 왼쪽 -88, padding 으로 shift.
		const anchor: AnchorRect = { top: 300, left: 16, width: 32, height: 32 };
		const r = computeAnchoredPosition(anchor, { width: 240, height: 40 }, vp(375, 812), {
			placement: "top",
			gap: 8,
			padding: 8,
		});
		expect(r.placement).toBe("top");
		expect(r.x).toBe(8); // 왼쪽 여백으로 밀림
	});

	it("shifts back inside when it would clip the right edge", () => {
		const anchor: AnchorRect = { top: 300, left: 350, width: 32, height: 32 };
		const r = computeAnchoredPosition(anchor, { width: 240, height: 40 }, vp(375, 812), {
			placement: "top",
			padding: 8,
		});
		expect(r.x).toBe(375 - 8 - 240); // 오른쪽 여백에 맞춰 밀림 = 127
	});

	it("shrinks max-width when the floating is wider than the viewport", () => {
		const anchor: AnchorRect = { top: 300, left: 90, width: 20, height: 20 };
		const r = computeAnchoredPosition(anchor, { width: 240, height: 40 }, vp(200, 800), {
			placement: "top",
			padding: 8,
		});
		expect(r.maxWidth).toBe(200 - 16); // viewport - padding*2 = 184
		expect(r.x).toBe(8); // 줄인 폭으로도 왼쪽 여백에 고정
	});

	it("takes the roomier side when neither side fits, and stays on screen (#621)", () => {
		// 예전에는 선호를 유지하고 주축 clamp 도 없어서 화면 밖으로 나갔다. 이제 공간이 더
		// 넓은 쪽(오른쪽 204px > 왼쪽 84px)을 고르고, 그래도 안 맞으면 여백 안으로 민다.
		const anchor: AnchorRect = { top: 300, left: 100, width: 40, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 300, height: 40 }, vp(360, 800), {
			placement: "left",
			gap: 8,
		});
		expect(r.placement).toBe("right");
		expect(r.x).toBeGreaterThanOrEqual(8);
		expect(r.x + 300).toBeLessThanOrEqual(360 - 8);
	});

	// ── #621 세로 축 ────────────────────────────────────────────────────────────

	it("caps max-height to the space on the placed side", () => {
		const anchor: AnchorRect = { top: 100, left: 40, width: 200, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 200, height: 290 }, vp(1024, 461), {
			placement: "bottom",
			align: "start",
			gap: 4,
			padding: 8,
		});
		// 아래 공간 461 - 140 - 4 - 8 = 309 → 목록(290)이 들어가므로 선호 유지
		expect(r.placement).toBe("bottom");
		expect(r.maxHeight).toBe(309);
	});

	it("keeps a tall list inside a short viewport instead of overflowing it (#621 repro)", () => {
		// 실측: 뷰포트 461, 트리거 258~296, 목록 290 → 아래 153 / 위 246, 양쪽 다 안 맞는다.
		// 예전에는 아래를 유지해 301~591 로 130px 넘쳤다.
		const anchor: AnchorRect = { top: 258, left: 40, width: 200, height: 38 };
		const r = computeAnchoredPosition(anchor, { width: 200, height: 290 }, vp(1024, 461), {
			placement: "bottom",
			align: "start",
			gap: 4,
			padding: 8,
		});

		expect(r.placement).toBe("top"); // 위 246 > 아래 153
		expect(r.maxHeight).toBe(246);
		expect(r.y).toBe(8); // 258 - 4 - 246
		expect(r.y + r.maxHeight).toBeLessThanOrEqual(461 - 8);
	});

	it("is idempotent — feeding the capped height back yields the same placement and y", () => {
		// 폭과 같은 성질이 높이에도 필요하다. 측정 높이로 상한을 정하면 (깎임 → 재측정 →
		// 다시 깎임) 진동한다.
		const anchor: AnchorRect = { top: 258, left: 40, width: 200, height: 38 };
		const opts = { placement: "bottom", align: "start", gap: 4, padding: 8 } as const;
		const first = computeAnchoredPosition(anchor, { width: 200, height: 290 }, vp(1024, 461), opts);
		const second = computeAnchoredPosition(
			anchor,
			{ width: 200, height: first.maxHeight },
			vp(1024, 461),
			opts,
		);

		expect(second.maxHeight).toBe(first.maxHeight);
		expect(second.placement).toBe(first.placement);
		expect(second.y).toBe(first.y);
	});

	it("shifts a too-tall popup back inside when the consumer ignores max-height", () => {
		// 마지막 방어선 - 소비처가 상한을 안 걸어도 화면 밖으로는 안 나간다(앵커를 덮더라도).
		const anchor: AnchorRect = { top: 258, left: 40, width: 200, height: 38 };
		const r = computeAnchoredPosition(anchor, { width: 200, height: 400 }, vp(1024, 461), {
			placement: "bottom",
			align: "start",
			gap: 4,
			padding: 8,
		});

		expect(r.y).toBeGreaterThanOrEqual(8);
		expect(r.y + 400).toBeLessThanOrEqual(461 - 8 + 1); // 400 > 445 가용분은 상단 여백에 고정
	});

	it("measures space from the visible part of an anchor scrolled off screen", () => {
		// 트리거가 뷰포트 아래로 벗어나도 팝업은 열린 채 남는다. 앵커 좌표를 그대로 쓰면
		// 위쪽 공간이 뷰포트보다 커져(300 - 4 - 8 = 288 > 250) 상한이 무의미해진다.
		const anchor: AnchorRect = { top: 300, left: 40, width: 200, height: 38 };
		const r = computeAnchoredPosition(anchor, { width: 200, height: 288 }, vp(900, 250), {
			placement: "bottom",
			align: "start",
			gap: 4,
			padding: 8,
		});

		expect(r.maxHeight).toBeLessThanOrEqual(250 - 8);
		expect(r.maxHeight).toBe(250 - 4 - 8);
		expect(r.y).toBeGreaterThanOrEqual(8);
	});

	it("gives horizontal placements the full viewport height as the cap", () => {
		const anchor: AnchorRect = { top: 300, left: 100, width: 40, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 100, height: 40 }, vp(1024, 768), {
			placement: "right",
			gap: 8,
			padding: 8,
		});
		expect(r.maxHeight).toBe(768 - 16);
	});
});
