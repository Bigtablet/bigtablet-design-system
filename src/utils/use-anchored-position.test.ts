import { describe, expect, it } from "vitest";
import { type AnchorRect, computeAnchoredPosition } from "./use-anchored-position";

const vp = (width: number, height: number) => ({ width, height });

describe("computeAnchoredPosition", () => {
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

	it("keeps the preferred side when neither side fits (no worse than before)", () => {
		// 좌우 모두 넘치는 경우 flip 하지 않고 선호 유지.
		const anchor: AnchorRect = { top: 300, left: 100, width: 40, height: 40 };
		const r = computeAnchoredPosition(anchor, { width: 300, height: 40 }, vp(360, 800), {
			placement: "left",
			gap: 8,
		});
		expect(r.placement).toBe("left");
	});
});
