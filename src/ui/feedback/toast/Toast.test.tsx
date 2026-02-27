import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import * as React from "react";
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
    return <button onClick={() => fn(toast)}>{label}</button>;
}

// ── ToastProvider ────────────────────────────────────────────────────────────

describe("ToastProvider", () => {
    it("renders children", () => {
        render(
            <ToastProvider>
                <div data-testid="child">child content</div>
            </ToastProvider>
        );

        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("child content")).toBeInTheDocument();
    });

    it("renders without children", () => {
        expect(() =>
            render(<ToastProvider>{null}</ToastProvider>)
        ).not.toThrow();
    });
});

// ── useToast ─────────────────────────────────────────────────────────────────

describe("useToast", () => {
    it("throws when used outside ToastProvider", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() =>
            renderHook(() => useToast())
        ).toThrow("useToast must be used within ToastProvider");

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
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("저장 완료")).toBeInTheDocument();
    });

    it("shows a toast when error() is called", () => {
        render(
            <ToastProvider>
                <ToastTrigger fn={(t) => t.error("오류 발생")} />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("오류 발생")).toBeInTheDocument();
    });

    it("shows a toast when warning() is called", () => {
        render(
            <ToastProvider>
                <ToastTrigger fn={(t) => t.warning("경고 메시지")} />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("경고 메시지")).toBeInTheDocument();
    });

    it("shows a toast when info() is called", () => {
        render(
            <ToastProvider>
                <ToastTrigger fn={(t) => t.info("정보 메시지")} />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("정보 메시지")).toBeInTheDocument();
    });

    it("shows a toast when message() is called", () => {
        render(
            <ToastProvider>
                <ToastTrigger fn={(t) => t.message("기본 메시지")} />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("기본 메시지")).toBeInTheDocument();
    });

    it("shows multiple toasts at once", () => {
        function MultiTrigger() {
            const t = useToast();
            return (
                <>
                    <button onClick={() => t.success("첫 번째")}>first</button>
                    <button onClick={() => t.error("두 번째")}>second</button>
                </>
            );
        }

        render(
            <ToastProvider>
                <MultiTrigger />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "first" }));
        fireEvent.click(screen.getByRole("button", { name: "second" }));

        const alerts = screen.getAllByRole("alert");
        expect(alerts).toHaveLength(2);
        expect(screen.getByText("첫 번째")).toBeInTheDocument();
        expect(screen.getByText("두 번째")).toBeInTheDocument();
    });

    it("respects maxCount option", () => {
        function SpamTrigger() {
            const t = useToast();
            return (
                <button
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
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "spam" }));

        // maxCount=3 이므로 최대 3개만 표시됨
        const alerts = screen.getAllByRole("alert");
        expect(alerts.length).toBeLessThanOrEqual(3);
    });
});

// ── Toast close ───────────────────────────────────────────────────────────────

describe("Toast close", () => {
    it("removes toast after close button click and animation delay", async () => {
        vi.useFakeTimers();

        render(
            <ToastProvider>
                <ToastTrigger fn={(t) => t.success("닫기 테스트")} />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));
        expect(screen.getByText("닫기 테스트")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "닫기" }));

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
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "trigger" }));

        const closeBtn = screen.getByRole("button", { name: "닫기" });

        // 빠르게 두 번 클릭
        fireEvent.click(closeBtn);
        fireEvent.click(closeBtn);

        // 260ms 지연 setTimeout은 closingRef 덕분에 한 번만 호출되어야 함
        const removalTimeouts = timeoutSpy.mock.calls.filter(
            ([, ms]) => ms === 260
        );
        expect(removalTimeouts).toHaveLength(1);

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(screen.queryByText("중복 닫기")).not.toBeInTheDocument();

        timeoutSpy.mockRestore();
        vi.useRealTimers();
    });
});
