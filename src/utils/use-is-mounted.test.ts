import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIsMounted } from "./use-is-mounted";

describe("useIsMounted", () => {
	it("returns true after mount effect runs", () => {
		const { result } = renderHook(() => useIsMounted());
		// renderHook 은 act 로 effect 를 flush 하므로 마운트 후 true
		expect(result.current).toBe(true);
	});

	it("stays true across re-renders", () => {
		const { result, rerender } = renderHook(() => useIsMounted());
		rerender();
		expect(result.current).toBe(true);
	});
});
