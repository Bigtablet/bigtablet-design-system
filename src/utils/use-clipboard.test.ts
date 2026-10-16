import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyText, useClipboard } from "./use-clipboard";

const setClipboard = (writeText?: (t: string) => Promise<void>) => {
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: writeText ? { writeText: vi.fn(writeText) } : undefined,
	});
};
const setExecCommand = (result: boolean | Error) => {
	const fn = vi.fn(() => {
		if (result instanceof Error) throw result;
		return result;
	});
	Object.defineProperty(document, "execCommand", { configurable: true, value: fn });
	return fn;
};

afterEach(() => {
	setClipboard(undefined);
	vi.useRealTimers();
});

describe("copyText", () => {
	it("uses the Clipboard API when it is there", async () => {
		setClipboard(async () => {});
		const exec = setExecCommand(true);
		await copyText("hello");
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
		expect(exec).not.toHaveBeenCalled();
	});

	it("falls back to execCommand when the API is missing (in-app browser, http)", async () => {
		setClipboard(undefined);
		const exec = setExecCommand(true);
		await copyText("hello");
		expect(exec).toHaveBeenCalledWith("copy");
		// 임시 textarea 는 남지 않는다
		expect(document.querySelector("textarea")).toBeNull();
	});

	it("falls back when permission is denied, and rethrows that error if the fallback fails too", async () => {
		const denied = new DOMException("denied", "NotAllowedError");
		setClipboard(async () => {
			throw denied;
		});
		setExecCommand(true);
		await expect(copyText("a")).resolves.toBeUndefined();

		setExecCommand(false);
		await expect(copyText("a")).rejects.toBe(denied);
	});

	it("rejects when there is no API and the fallback is refused or throws", async () => {
		setClipboard(undefined);
		setExecCommand(false);
		await expect(copyText("a")).rejects.toThrow("Copy command was rejected");
		setExecCommand(new Error("boom"));
		await expect(copyText("a")).rejects.toThrow("Copy command was rejected");
	});
});

describe("useClipboard", () => {
	beforeEach(() => {
		setClipboard(async () => {});
	});

	it("goes idle → copied → idle after resetAfter", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useClipboard({ resetAfter: 1000 }));
		expect(result.current.status).toBe("idle");
		let ok = false;
		await act(async () => {
			ok = await result.current.copy("x");
		});
		expect(ok).toBe(true);
		expect(result.current.status).toBe("copied");
		act(() => vi.advanceTimersByTime(999));
		expect(result.current.status).toBe("copied");
		act(() => vi.advanceTimersByTime(1));
		expect(result.current.status).toBe("idle");
	});

	it("reports error with the cause and does not throw", async () => {
		const denied = new Error("denied");
		setClipboard(async () => {
			throw denied;
		});
		setExecCommand(false);
		const { result } = renderHook(() => useClipboard());
		let ok = true;
		await act(async () => {
			ok = await result.current.copy("x");
		});
		expect(ok).toBe(false);
		expect(result.current.status).toBe("error");
		expect(result.current.error).toBe(denied);
	});

	it("shows copying while the write is pending", async () => {
		let resolve!: () => void;
		setClipboard(() => new Promise<void>((r) => (resolve = r)));
		const { result } = renderHook(() => useClipboard());
		let pending!: Promise<boolean>;
		act(() => {
			pending = result.current.copy("x");
		});
		expect(result.current.status).toBe("copying");
		await act(async () => {
			resolve();
			await pending;
		});
		expect(result.current.status).toBe("copied");
	});

	it("restarts the reset timer on repeated clicks", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useClipboard({ resetAfter: 1000 }));
		await act(async () => {
			await result.current.copy("a");
		});
		act(() => vi.advanceTimersByTime(800));
		await act(async () => {
			await result.current.copy("b");
		});
		act(() => vi.advanceTimersByTime(800));
		// 첫 타이머였다면 이미 idle
		expect(result.current.status).toBe("copied");
		act(() => vi.advanceTimersByTime(200));
		expect(result.current.status).toBe("idle");
	});

	it("ignores a slower earlier copy that finishes after a newer one", async () => {
		const resolvers: Array<() => void> = [];
		setClipboard(() => new Promise<void>((r) => resolvers.push(r)));
		const { result } = renderHook(() => useClipboard({ resetAfter: 0 }));
		let first!: Promise<boolean>;
		let second!: Promise<boolean>;
		act(() => {
			first = result.current.copy("a");
			second = result.current.copy("b");
		});
		await act(async () => {
			resolvers[1]?.();
			await second;
		});
		expect(result.current.status).toBe("copied");
		setClipboard(async () => {});
		await act(async () => {
			result.current.reset();
			resolvers[0]?.();
			await first;
		});
		// 늦게 끝난 첫 복사가 reset 을 덮어쓰지 않는다
		expect(result.current.status).toBe("idle");
	});

	it("keeps copied with resetAfter=0 and resets on demand", async () => {
		const { result } = renderHook(() => useClipboard({ resetAfter: 0 }));
		await act(async () => {
			await result.current.copy("x");
		});
		expect(result.current.status).toBe("copied");
		act(() => result.current.reset());
		expect(result.current.status).toBe("idle");
	});

	it("clears the timer on unmount and ignores results after it", async () => {
		vi.useFakeTimers();
		const clear = vi.spyOn(globalThis, "clearTimeout");
		let resolve!: () => void;
		setClipboard(() => new Promise<void>((r) => (resolve = r)));
		const { result, unmount } = renderHook(() => useClipboard());
		let pending!: Promise<boolean>;
		act(() => {
			pending = result.current.copy("x");
		});
		unmount();
		expect(clear).toHaveBeenCalled();
		resolve();
		await expect(pending).resolves.toBe(true);
		expect(vi.getTimerCount()).toBe(0);
		clear.mockRestore();
	});

	it("drops an in-flight copy when reset is called", async () => {
		let resolve!: () => void;
		setClipboard(() => new Promise<void>((r) => (resolve = r)));
		const { result } = renderHook(() => useClipboard({ resetAfter: 1000 }));
		let pending!: Promise<boolean>;
		act(() => {
			pending = result.current.copy("x");
		});
		act(() => result.current.reset());
		await act(async () => {
			resolve();
			await pending;
		});
		expect(result.current.status).toBe("idle");
	});

	it("reports a throwing text function as an error", async () => {
		const boom = new Error("boom");
		const { result } = renderHook(() => useClipboard());
		let ok = true;
		await act(async () => {
			ok = await result.current.copy(() => {
				throw boom;
			});
		});
		expect(ok).toBe(false);
		expect(result.current.status).toBe("error");
		expect(result.current.error).toBe(boom);
	});
});
