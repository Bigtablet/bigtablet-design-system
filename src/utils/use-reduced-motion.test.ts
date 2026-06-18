import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./use-reduced-motion";

type Listener = (e: { matches: boolean }) => void;

const originalMatchMedia = window.matchMedia;

/** 제어 가능한 matchMedia 목 - matches 값 + change 이벤트 발화 지원 */
function mockMatchMedia(initial: boolean) {
	const listeners = new Set<Listener>();
	const mql = {
		matches: initial,
		media: "(prefers-reduced-motion: reduce)",
		addEventListener: (_: string, cb: Listener) => listeners.add(cb),
		removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
		emit(next: boolean) {
			mql.matches = next;
			for (const cb of listeners) cb({ matches: next });
		},
	};
	window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
	return mql;
}

afterEach(() => {
	window.matchMedia = originalMatchMedia;
	vi.restoreAllMocks();
});

describe("useReducedMotion", () => {
	it("returns false when the user has no reduced-motion preference", () => {
		mockMatchMedia(false);
		const { result } = renderHook(() => useReducedMotion());
		expect(result.current).toBe(false);
	});

	it("returns true when prefers-reduced-motion: reduce matches", () => {
		mockMatchMedia(true);
		const { result } = renderHook(() => useReducedMotion());
		expect(result.current).toBe(true);
	});

	it("updates reactively when the preference changes", () => {
		const mql = mockMatchMedia(false);
		const { result } = renderHook(() => useReducedMotion());
		expect(result.current).toBe(false);

		act(() => mql.emit(true));
		expect(result.current).toBe(true);

		act(() => mql.emit(false));
		expect(result.current).toBe(false);
	});

	it("unsubscribes the listener on unmount", () => {
		const mql = mockMatchMedia(true);
		const removeSpy = vi.spyOn(mql, "removeEventListener");
		const { unmount } = renderHook(() => useReducedMotion());
		unmount();
		expect(removeSpy).toHaveBeenCalled();
	});

	it("falls back to false when matchMedia is unavailable (SSR-safe)", () => {
		(window as { matchMedia?: typeof window.matchMedia }).matchMedia = undefined;
		const { result } = renderHook(() => useReducedMotion());
		expect(result.current).toBe(false);
	});
});
