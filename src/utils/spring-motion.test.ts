import { describe, expect, it } from "vitest";
import {
	OVERLAY_PANEL_CLOSED_TRANSFORM,
	OVERLAY_PANEL_OPEN_TRANSFORM,
	OVERLAY_SPRING_CONFIG,
	springEnterFrom,
} from "./spring-motion";

describe("springEnterFrom", () => {
	it("gives an opacity-only from when no transform is passed", () => {
		// 오버레이에 transform 이 붙으면 position: fixed 자손의 containing block 이 되어버린다.
		expect(springEnterFrom(false)).toEqual({ from: { opacity: 0 } });
	});

	it("includes the transform when one is passed", () => {
		expect(springEnterFrom(false, "scale(0.9)")).toEqual({
			from: { opacity: 0, transform: "scale(0.9)" },
		});
	});

	it("omits from entirely under reduced motion", () => {
		// `from` 을 주면 첫 프레임에 커밋된 뒤 immediate 가 점프해 한 프레임 깜빡임이 남는다.
		expect(springEnterFrom(true)).toEqual({});
		expect(springEnterFrom(true, "scale(0.9)")).toEqual({});
		expect("from" in springEnterFrom(true)).toBe(false);
	});
});

describe("overlay motion constants", () => {
	it("uses the same transform for the enter start and the exit target", () => {
		// 진입 시작값과 퇴출 목표값이 갈리면 열고 닫기가 비대칭이 된다.
		expect(OVERLAY_PANEL_CLOSED_TRANSFORM).toBe("scale(0.96) translateY(-4px)");
		expect(OVERLAY_PANEL_OPEN_TRANSFORM).toBe("scale(1) translateY(0px)");
	});

	it("clamps in both directions", () => {
		expect(OVERLAY_SPRING_CONFIG.clamp).toBe(true);
	});
});
