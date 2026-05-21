import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "./index";
import { useToast } from "./use-toast";

// ── Helper ───────────────────────────────────────────────────────────────────

/**
 * ToastProvider 안에서 useToast를 호출해 버튼 클릭으로 토스트를 발생시키는 헬퍼 컴포넌트
 */
function ToastTrigger({
	fn,
	label = "trigger",
}: {
	fn: (t: ReturnType<typeof useToast>) => void;
	label?: string;
}) {
	const toast = useToast();
	return (
		<button type="button" onClick={() => fn(toast)}>
			{label}
		</button>
	);
}

// ── ToastProvider ────────────────────────────────────────────────────────────

describe("ToastProvider", () => {
	it("renders children", () => {
		render(
			<ToastProvider>
				<div data-testid="child">child content</div>
			</ToastProvider>,
		);

		expect(screen.getByTestId("child")).toBeInTheDocument();
		expect(screen.getByText("child content")).toBeInTheDocument();
	});

	it("renders without children", () => {
		expect(() => render(<ToastProvider>{null}</ToastProvider>)).not.toThrow();
	});
});

// ── useToast ─────────────────────────────────────────────────────────────────

describe("useToast", () => {
	it("throws when used outside ToastProvider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => renderHook(() => useToast())).toThrow("[Bigtablet DS]");

		spy.mockRestore();
	});

	it("returns all toast functions when inside ToastProvider", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<ToastProvider>{children}</ToastProvider>
		);

		const { result } = renderHook(() => useToast(), { wrapper });

		expect(result.current.success).toBeDefined();
		expect(result.current.error).toBeDefined();
		expect(result.current.warning).toBeDefined();
		expect(result.current.info).toBeDefined();
		expect(result.current.message).toBeDefined();
	});
});

// ── Toast display ─────────────────────────────────────────────────────────────

describe("Toast display", () => {
	it("shows a toast when success() is called", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("저장 완료")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("저장 완료")).toBeInTheDocument();
	});

	it("shows a toast when error() is called", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.error("오류 발생")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText("오류 발생")).toBeInTheDocument();
	});

	it("shows a toast when warning() is called", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.warning("경고 메시지")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("경고 메시지")).toBeInTheDocument();
	});

	it("shows a toast when info() is called", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.info("정보 메시지")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("정보 메시지")).toBeInTheDocument();
	});

	it("shows a toast when message() is called", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.message("기본 메시지")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("기본 메시지")).toBeInTheDocument();
	});

	it("shows multiple toasts at once", () => {
		function MultiTrigger() {
			const t = useToast();
			return (
				<>
					<button type="button" onClick={() => t.success("첫 번째")}>
						first
					</button>
					<button type="button" onClick={() => t.error("두 번째")}>
						second
					</button>
				</>
			);
		}

		render(
			<ToastProvider>
				<MultiTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "first" }));
		fireEvent.click(screen.getByRole("button", { name: "second" }));

		// 첫 번째는 success(role="status"), 두 번째는 error(role="alert")
		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText("첫 번째")).toBeInTheDocument();
		expect(screen.getByText("두 번째")).toBeInTheDocument();
	});

	it("respects maxCount option", () => {
		function SpamTrigger() {
			const t = useToast();
			return (
				<button
					type="button"
					onClick={() => {
						t.success("msg1");
						t.success("msg2");
						t.success("msg3");
						t.success("msg4");
					}}
				>
					spam
				</button>
			);
		}

		render(
			<ToastProvider maxCount={3}>
				<SpamTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "spam" }));

		// maxCount=3 이므로 최대 3개만 표시됨 (success는 role="status")
		const statuses = screen.getAllByRole("status");
		expect(statuses.length).toBeLessThanOrEqual(3);
	});
});

// ── Toast close ───────────────────────────────────────────────────────────────

describe("Toast close", () => {
	it("removes toast after close button click and animation delay", async () => {
		vi.useFakeTimers();

		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("닫기 테스트")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		expect(screen.getByText("닫기 테스트")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		// 슬라이드 아웃 setTimeout(260ms) 완료 대기
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(screen.queryByText("닫기 테스트")).not.toBeInTheDocument();

		vi.useRealTimers();
	});

	it("does not double-close when close is called twice rapidly", async () => {
		vi.useFakeTimers();

		const timeoutSpy = vi.spyOn(globalThis, "setTimeout");

		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("중복 닫기")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const closeBtn = screen.getByRole("button", { name: "Close" });

		// 빠르게 두 번 클릭
		fireEvent.click(closeBtn);
		fireEvent.click(closeBtn);

		// 260ms 지연 setTimeout은 closingRef 덕분에 한 번만 호출되어야 함
		const removalTimeouts = timeoutSpy.mock.calls.filter(([, ms]) => ms === 260);
		expect(removalTimeouts).toHaveLength(1);

		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(screen.queryByText("중복 닫기")).not.toBeInTheDocument();

		timeoutSpy.mockRestore();
		vi.useRealTimers();
	});
});

// ── useToast error message ──────────────────────────────────────────────────

describe("useToast error message", () => {
	it("throws with the full Korean guidance message when used outside ToastProvider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => renderHook(() => useToast())).toThrow(
			"[Bigtablet DS] useToast는 <ToastProvider>",
		);

		spy.mockRestore();
	});

	it("returns five distinct toast methods", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<ToastProvider>{children}</ToastProvider>
		);

		const { result } = renderHook(() => useToast(), { wrapper });

		expect(typeof result.current.success).toBe("function");
		expect(typeof result.current.error).toBe("function");
		expect(typeof result.current.warning).toBe("function");
		expect(typeof result.current.info).toBe("function");
		expect(typeof result.current.message).toBe("function");

		// 각 메서드는 서로 다른 함수 인스턴스여야 함
		const fns = new Set([
			result.current.success,
			result.current.error,
			result.current.warning,
			result.current.info,
			result.current.message,
		]);
		expect(fns.size).toBe(5);
	});
});

// ── Toast portal & a11y ─────────────────────────────────────────────────────

describe("Toast portal & a11y", () => {
	it("renders the toast container into document.body via createPortal", () => {
		render(
			<ToastProvider>
				<div data-testid="app-root">
					<ToastTrigger fn={(t) => t.success("포탈 테스트")} />
				</div>
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const container = document.querySelector(".toast_container");
		expect(container).not.toBeNull();
		// 포탈은 document.body 직속 자식으로 렌더링됨 (app-root 안이 아님)
		const appRoot = screen.getByTestId("app-root");
		expect(appRoot.contains(container)).toBe(false);
	});

	it("sets the proper aria attributes on the toast region", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.info("aria 검사")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const region = screen.getByRole("region", { name: "Notifications" });
		expect(region).toHaveAttribute("aria-live", "polite");
		expect(region).toHaveAttribute("aria-atomic", "false");
	});

	it("uses role=alert only for error variant and role=status for the rest", () => {
		function AllVariants() {
			const t = useToast();
			return (
				<>
					<button type="button" onClick={() => t.success("s")}>
						s
					</button>
					<button type="button" onClick={() => t.warning("w")}>
						w
					</button>
					<button type="button" onClick={() => t.info("i")}>
						i
					</button>
					<button type="button" onClick={() => t.message("m")}>
						m
					</button>
					<button type="button" onClick={() => t.error("e")}>
						e
					</button>
				</>
			);
		}

		render(
			<ToastProvider>
				<AllVariants />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "s" }));
		fireEvent.click(screen.getByRole("button", { name: "w" }));
		fireEvent.click(screen.getByRole("button", { name: "i" }));
		fireEvent.click(screen.getByRole("button", { name: "m" }));
		fireEvent.click(screen.getByRole("button", { name: "e" }));

		// error 1개만 alert
		expect(screen.getAllByRole("alert")).toHaveLength(1);
		// 나머지 4개는 status
		expect(screen.getAllByRole("status")).toHaveLength(4);
	});

	it("respects custom closeAriaLabel prop", () => {
		render(
			<ToastProvider closeAriaLabel="닫기">
				<ToastTrigger fn={(t) => t.success("커스텀 라벨")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
	});
});

// ── Toast variant classes ───────────────────────────────────────────────────

describe("Toast variant classes", () => {
	it.each([
		["success", "toast_progress_success", "toast_icon_success"],
		["error", "toast_progress_error", "toast_icon_error"],
		["warning", "toast_progress_warning", "toast_icon_warning"],
		["info", "toast_progress_info", "toast_icon_info"],
		["default", "toast_progress_default", "toast_icon_default"],
	] as const)(
		"applies %s variant classes to progress bar and icon",
		(variant, progressClass, iconClass) => {
			render(
				<ToastProvider>
					<ToastTrigger
						fn={(t) => {
							if (variant === "default") t.message("variant");
							else t[variant]("variant");
						}}
					/>
				</ToastProvider>,
			);

			fireEvent.click(screen.getByRole("button", { name: "trigger" }));

			const progress = document.querySelector(`.${progressClass}`);
			const icon = document.querySelector(`.${iconClass}`);
			expect(progress).not.toBeNull();
			expect(icon).not.toBeNull();
		},
	);

	it("sets --toast-duration CSS variable from duration prop", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("듀레이션 검사", 5000)} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const progress = document.querySelector(".toast_progress") as HTMLElement | null;
		expect(progress).not.toBeNull();
		expect(progress?.style.getPropertyValue("--toast-duration")).toBe("5000ms");
	});

	it("falls back to default 3000ms duration when not provided", () => {
		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("기본 듀레이션")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const progress = document.querySelector(".toast_progress") as HTMLElement | null;
		expect(progress?.style.getPropertyValue("--toast-duration")).toBe("3000ms");
	});
});

// ── Toast auto-dismiss ──────────────────────────────────────────────────────

describe("Toast auto-dismiss", () => {
	it.skip("auto-closes the toast when the progress animation ends", async () => {
		vi.useFakeTimers();

		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("자동 닫힘")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		expect(screen.getByText("자동 닫힘")).toBeInTheDocument();

		const progress = document.querySelector(".toast_progress") as HTMLElement;

		// 진행 바 애니메이션 종료 이벤트가 close()를 트리거
		await act(async () => {
			fireEvent.animationEnd(progress);
		});

		// 슬라이드 아웃 setTimeout(260ms) 완료 대기
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(screen.queryByText("자동 닫힘")).not.toBeInTheDocument();

		vi.useRealTimers();
	});

	it("adds toast_item_exiting class during slide-out animation", async () => {
		vi.useFakeTimers();

		render(
			<ToastProvider>
				<ToastTrigger fn={(t) => t.success("exiting 상태")} />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const item = document.querySelector(".toast_item") as HTMLElement;
		expect(item.className).not.toContain("toast_item_exiting");

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Close" }));
		});

		// 아직 setTimeout(260ms) 완료 전 — DOM은 유지되고 exiting 클래스만 부여됨
		const exitingItem = document.querySelector(".toast_item") as HTMLElement | null;
		expect(exitingItem).not.toBeNull();
		expect(exitingItem?.className).toContain("toast_item_exiting");

		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(document.querySelector(".toast_item")).toBeNull();

		vi.useRealTimers();
	});
});

// ── Toast unique ids & stack order ──────────────────────────────────────────

describe("Toast stack & ids", () => {
	it("stacks newer toasts at the top of the container", () => {
		function StackTrigger() {
			const t = useToast();
			return (
				<>
					<button type="button" onClick={() => t.success("첫째")}>
						a
					</button>
					<button type="button" onClick={() => t.success("둘째")}>
						b
					</button>
					<button type="button" onClick={() => t.success("셋째")}>
						c
					</button>
				</>
			);
		}

		render(
			<ToastProvider>
				<StackTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "a" }));
		fireEvent.click(screen.getByRole("button", { name: "b" }));
		fireEvent.click(screen.getByRole("button", { name: "c" }));

		const items = Array.from(document.querySelectorAll(".toast_item .toast_message")).map(
			(el) => el.textContent,
		);

		// addToast가 prepend(`[new, ...prev]`)이므로 가장 최근 토스트가 맨 앞
		expect(items[0]).toBe("셋째");
		expect(items[1]).toBe("둘째");
		expect(items[2]).toBe("첫째");
	});

	it("removes the oldest toast when maxCount is exceeded", () => {
		function SpamTrigger() {
			const t = useToast();
			return (
				<button
					type="button"
					onClick={() => {
						t.success("old");
						t.success("mid");
						t.success("new");
					}}
				>
					spam
				</button>
			);
		}

		render(
			<ToastProvider maxCount={2}>
				<SpamTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "spam" }));

		// maxCount=2, prepend 후 slice(0,2)이므로 가장 오래된 "old"가 잘려나감
		expect(screen.queryByText("old")).not.toBeInTheDocument();
		expect(screen.getByText("mid")).toBeInTheDocument();
		expect(screen.getByText("new")).toBeInTheDocument();
	});

	it("assigns a unique id to every toast (separate DOM nodes)", () => {
		function MultiTrigger() {
			const t = useToast();
			return (
				<button
					type="button"
					onClick={() => {
						t.success("같은 메시지");
						t.success("같은 메시지");
						t.success("같은 메시지");
					}}
				>
					dup
				</button>
			);
		}

		render(
			<ToastProvider>
				<MultiTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "dup" }));

		// 동일한 메시지라도 별도의 DOM 노드(서로 다른 id)로 렌더링되어야 함
		expect(screen.getAllByText("같은 메시지")).toHaveLength(3);
		expect(document.querySelectorAll(".toast_item")).toHaveLength(3);
	});
});
