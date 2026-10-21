import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTopInset } from "./use-top-inset";

// jsdom 에는 ResizeObserver 가 없다 - observe 즉시 콜백을 한 번 부르는 최소 대역.
class FakeResizeObserver {
	constructor(private readonly callback: () => void) {}
	observe() {
		this.callback();
	}
	disconnect = vi.fn();
}

const topInset = () => document.documentElement.style.getPropertyValue("--bt-top-inset");

const header = (height: number) => {
	const el = document.createElement("div");
	el.getBoundingClientRect = () => ({ height }) as DOMRect;
	return el;
};

describe("useTopInset", () => {
	beforeEach(() => vi.stubGlobal("ResizeObserver", FakeResizeObserver));
	afterEach(() => {
		vi.unstubAllGlobals();
		document.documentElement.style.removeProperty("--bt-top-inset");
	});

	it("writes the measured height to --bt-top-inset and clears it on detach", () => {
		const { result } = renderHook(() => useTopInset(true));
		const cleanup = result.current(header(64));
		expect(topInset()).toBe("64px");

		cleanup?.();
		expect(topInset()).toBe("");
	});

	it("rounds a fractional height up so the header is never under-padded", () => {
		const { result } = renderHook(() => useTopInset(true));
		result.current(header(60.4));
		expect(topInset()).toBe("61px");
	});

	it("measures the element picked by measure", () => {
		const parent = header(72);
		const child = document.createElement("div");
		parent.appendChild(child);
		const { result } = renderHook(() => useTopInset(true, (el) => el.parentElement));
		result.current(child);
		expect(topInset()).toBe("72px");
	});

	it("does nothing when disabled, detached, or measure returns null", () => {
		expect(renderHook(() => useTopInset(false)).result.current(header(64))).toBeUndefined();
		expect(renderHook(() => useTopInset(true)).result.current(null)).toBeUndefined();
		expect(
			renderHook(() => useTopInset(true, () => null)).result.current(header(64)),
		).toBeUndefined();
		expect(topInset()).toBe("");
	});

	it("does nothing without ResizeObserver (SSR-like environments)", () => {
		vi.unstubAllGlobals();
		vi.stubGlobal("ResizeObserver", undefined);
		expect(renderHook(() => useTopInset(true)).result.current(header(64))).toBeUndefined();
		expect(topInset()).toBe("");
	});
});
