import { describe, expect, it } from "vitest";
import { clampCropOffset, getCoverScale, getCropRect, getOffsetLimits } from "./crop.util";

const square = { width: 400, height: 400 };
const landscape = { width: 800, height: 400 };
const portrait = { width: 400, height: 800 };
const VIEWPORT = 200;

describe("getCoverScale", () => {
	it("정사각 원본은 짧은 변 기준 배율이 그대로 나온다", () => {
		expect(getCoverScale(square, VIEWPORT)).toBe(0.5);
	});
	it("가로가 긴 원본은 세로(짧은 변)를 채우는 배율을 쓴다", () => {
		expect(getCoverScale(landscape, VIEWPORT)).toBe(0.5);
	});
	it("원본이 뷰포트보다 작으면 1보다 큰 배율로 확대한다", () => {
		expect(getCoverScale({ width: 100, height: 50 }, VIEWPORT)).toBe(4);
	});
});

describe("getOffsetLimits", () => {
	it("zoom=1 정사각 원본은 두 축 모두 여유가 없다", () => {
		expect(getOffsetLimits(square, VIEWPORT, 1)).toEqual({ x: 0, y: 0 });
	});
	it("가로가 긴 원본은 가로에만 여유가 생긴다", () => {
		// 800×400 을 0.5배 → 400×200. 가로 여유 (400-200)/2 = 100.
		expect(getOffsetLimits(landscape, VIEWPORT, 1)).toEqual({ x: 100, y: 0 });
	});
	it("세로가 긴 원본은 세로에만 여유가 생긴다", () => {
		expect(getOffsetLimits(portrait, VIEWPORT, 1)).toEqual({ x: 0, y: 100 });
	});
	it("zoom 을 올리면 여유가 커진다", () => {
		expect(getOffsetLimits(square, VIEWPORT, 2)).toEqual({ x: 100, y: 100 });
	});
});

describe("clampCropOffset", () => {
	it("한계 안의 값은 그대로 둔다", () => {
		expect(clampCropOffset({ x: 40, y: -40 }, square, VIEWPORT, 2)).toEqual({ x: 40, y: -40 });
	});
	it("한계를 넘으면 잘린다", () => {
		expect(clampCropOffset({ x: 999, y: -999 }, square, VIEWPORT, 2)).toEqual({ x: 100, y: -100 });
	});
	it("여유가 없으면 0 으로 고정하고 -0 을 만들지 않는다", () => {
		const result = clampCropOffset({ x: -5, y: 5 }, square, VIEWPORT, 1);
		expect(result).toEqual({ x: 0, y: 0 });
		expect(Object.is(result.x, -0)).toBe(false);
	});
});

describe("getCropRect", () => {
	it("zoom=1 정사각 원본은 원본 전체가 크롭 영역", () => {
		expect(getCropRect(square, VIEWPORT, 1, { x: 0, y: 0 })).toEqual({ x: 0, y: 0, size: 400 });
	});
	it("가로 원본은 중앙 정사각을 자른다", () => {
		// 800×400 → cover 0.5, size=200/0.5=400, x=(800-400)/2=200
		expect(getCropRect(landscape, VIEWPORT, 1, { x: 0, y: 0 })).toEqual({
			x: 200,
			y: 0,
			size: 400,
		});
	});
	it("범위를 넘는 offset 을 넘겨도 이미지 바깥이 잘리지 않는다(내부 재제한)", () => {
		const rect = getCropRect(landscape, VIEWPORT, 1, { x: 99999, y: 0 });
		expect(rect.x).toBeGreaterThanOrEqual(0);
		expect(rect.x + rect.size).toBeLessThanOrEqual(landscape.width);
	});
});
