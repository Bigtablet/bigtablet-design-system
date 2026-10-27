import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { stubPendingAnimation } from "../../../test/stub-animation";
import { AlertProvider, type ConfirmOptions, useAlert, useConfirm } from "./index";

const TestComponent = ({
	options,
}: {
	options?: Parameters<ReturnType<typeof useAlert>["showAlert"]>[0];
}) => {
	const { showAlert } = useAlert();
	return (
		<button type="button" onClick={() => showAlert(options || { title: "Test Alert" })}>
			Show Alert
		</button>
	);
};

const renderWithProvider = (ui: React.ReactElement) => {
	return render(<AlertProvider>{ui}</AlertProvider>);
};

describe("Alert", () => {
	it("keeps Tab inside the alert even though the panel stops other keys from bubbling", () => {
		const T = () => {
			const { showAlert } = useAlert();
			return (
				<button
					type="button"
					onClick={() => showAlert({ title: "A", message: "m", showCancel: true })}
				>
					open
				</button>
			);
		};
		render(
			<AlertProvider>
				<T />
			</AlertProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "open" }));
		const confirm = screen.getByRole("button", { name: "확인" });
		confirm.focus();
		fireEvent.keyDown(confirm, { key: "Tab" });
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "취소" }));
	});

	it("does not cancel when a drag that started on the panel is released on the overlay", () => {
		// 메시지를 드래그로 선택하다 오버레이에서 놓으면 `click` 이 공통 조상(오버레이)에 디스패치된다.
		// target 검사만으로는 진짜 오버레이 클릭과 구분되지 않는다 - Modal 과 같은 pointerdown 판정.
		const onCancel = vi.fn();
		const T = () => {
			const { showAlert } = useAlert();
			return (
				<button type="button" onClick={() => showAlert({ title: "A", onCancel })}>
					open
				</button>
			);
		};
		render(
			<AlertProvider>
				<T />
			</AlertProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "open" }));
		const panel = screen.getByRole("alertdialog");
		const overlay = panel.parentElement as HTMLElement;
		fireEvent.pointerDown(panel);
		fireEvent.click(overlay);
		expect(onCancel).not.toHaveBeenCalled();

		// 진짜 오버레이 클릭(누름·놓음 모두 오버레이)은 취소다.
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("throws error when useAlert is used outside provider", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => render(<TestComponent />)).toThrow("[Bigtablet DS]");

		consoleError.mockRestore();
	});

	it("shows alert with title", () => {
		renderWithProvider(<TestComponent options={{ title: "Alert Title" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("Alert Title")).toBeInTheDocument();
	});

	it("shows alert with message", () => {
		renderWithProvider(<TestComponent options={{ message: "Alert message content" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("Alert message content")).toBeInTheDocument();
	});

	it("shows confirm button with default text", () => {
		renderWithProvider(<TestComponent />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("확인")).toBeInTheDocument();
	});

	it("shows confirm button with custom text", () => {
		renderWithProvider(<TestComponent options={{ confirmText: "OK" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("OK")).toBeInTheDocument();
	});

	it("shows cancel button when showCancel is true", () => {
		renderWithProvider(<TestComponent options={{ showCancel: true }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("취소")).toBeInTheDocument();
	});

	it("shows cancel button with custom text", () => {
		renderWithProvider(<TestComponent options={{ showCancel: true, cancelText: "No" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("No")).toBeInTheDocument();
	});

	it("does not show cancel button by default", () => {
		renderWithProvider(<TestComponent />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.queryByText("취소")).not.toBeInTheDocument();
	});

	it("calls onConfirm when confirm button is clicked", () => {
		const onConfirm = vi.fn();
		renderWithProvider(<TestComponent options={{ onConfirm }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		fireEvent.click(screen.getByText("확인"));

		expect(onConfirm).toHaveBeenCalled();
	});

	it("calls onCancel when cancel button is clicked", () => {
		const onCancel = vi.fn();
		renderWithProvider(<TestComponent options={{ showCancel: true, onCancel }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		fireEvent.click(screen.getByText("취소"));

		expect(onCancel).toHaveBeenCalled();
	});

	it("starts exit animation when confirm is clicked", () => {
		stubPendingAnimation();
		renderWithProvider(<TestComponent options={{ title: "Test" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("Test")).toBeInTheDocument();

		fireEvent.click(screen.getByText("확인"));
		// 퇴출 transition 진행 중 - 오버레이가 아직 마운트돼 있다
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("starts exit animation when cancel is clicked", () => {
		stubPendingAnimation();
		renderWithProvider(<TestComponent options={{ title: "Test", showCancel: true }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("Test")).toBeInTheDocument();

		fireEvent.click(screen.getByText("취소"));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("starts exit animation when overlay is clicked", () => {
		renderWithProvider(<TestComponent options={{ title: "Test" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("Test")).toBeInTheDocument();

		const overlay = screen.getByRole("alertdialog").parentElement;
		if (overlay) fireEvent.click(overlay);
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("has correct accessibility attributes", () => {
		renderWithProvider(<TestComponent options={{ title: "Test", message: "Message" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		const dialog = screen.getByRole("alertdialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
		expect(dialog).toHaveAttribute("aria-labelledby");
		expect(dialog).toHaveAttribute("aria-describedby");
	});

	it("applies tone class", () => {
		renderWithProvider(<TestComponent options={{ tone: "error" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		const dialog = screen.getByRole("alertdialog");
		expect(dialog).toHaveClass("alert_variant_error");
	});

	it("does not render icon by default", () => {
		renderWithProvider(<TestComponent options={{ tone: "info" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		expect(document.querySelector(".alert_icon")).not.toBeInTheDocument();
	});

	it("renders tone icon when showIcon=true", () => {
		renderWithProvider(<TestComponent options={{ tone: "error", showIcon: true }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		expect(document.querySelector(".alert_icon_error")).toBeInTheDocument();
	});

	it("destructive=true marks confirm as filled+danger (red), cancel as outline", () => {
		renderWithProvider(<TestComponent options={{ destructive: true, showCancel: true }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		const cancelBtn = screen.getByText("취소").closest("button");
		const confirmBtn = screen.getByText("확인").closest("button");
		// 위험 액션(confirm)은 빨간 강조 - 사용자에게 위험성 명확히 표시
		expect(confirmBtn).toHaveClass("button_variant_filled");
		expect(confirmBtn).toHaveClass("button_danger");
		expect(cancelBtn).toHaveClass("button_variant_outline");
	});

	it("applies actionsAlign class", () => {
		renderWithProvider(<TestComponent options={{ actionsAlign: "center" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		const actions = screen.getByRole("alertdialog").querySelector(".alert_actions");
		expect(actions).toHaveClass("alert_actions_center");
	});

	it("activates the focus trap when opened via showAlert (mounted closed)", () => {
		// AlertProvider 는 AlertModal 을 항상 isOpen=false 로 마운트해 두고 showAlert() 로 연다.
		// 이 deferred-mount 경로에서도 트랩이 걸려 초기 포커스가 alertdialog 안으로 이동해야 함.
		renderWithProvider(<TestComponent options={{ title: "Trap", showCancel: true }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		const dialog = screen.getByRole("alertdialog");
		expect(dialog.contains(document.activeElement)).toBe(true);
	});

	it("closes on Escape after opening via showAlert", async () => {
		// 포커스가 alertdialog 안에 있어야 overlay onKeyDown 까지 버블되어 Escape 가 동작한다
		// (트랩 미활성 시 포커스가 트리거에 남아 Escape 가 절대 발화하지 않던 회귀 방지).
		renderWithProvider(<TestComponent options={{ title: "Esc" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();

		fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
		// 퇴출 spring 애니메이션 완료 후 unmount 되므로 대기
		await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
	});

	it("routes Escape and overlay-click dismissal through onCancel (APG alertdialog)", () => {
		const onCancel = vi.fn();
		renderWithProvider(<TestComponent options={{ title: "C", onCancel }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
		expect(onCancel).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText("Show Alert"));
		const overlay = screen.getByRole("alertdialog").parentElement as HTMLElement;
		// 진짜 오버레이 클릭 = 누름·놓음 모두 오버레이. 패널에서 시작한 드래그와 구분한다.
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(onCancel).toHaveBeenCalledTimes(2);
	});

	it("closeOnOverlay=false ignores overlay clicks", () => {
		const onCancel = vi.fn();
		renderWithProvider(<TestComponent options={{ title: "C", onCancel, closeOnOverlay: false }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		const overlay = screen.getByRole("alertdialog").parentElement as HTMLElement;
		// 진짜 오버레이 클릭 = 누름·놓음 모두 오버레이. 패널에서 시작한 드래그와 구분한다.
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);

		expect(onCancel).not.toHaveBeenCalled();
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("renders without motion when prefers-reduced-motion is set", () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: query.includes("prefers-reduced-motion"),
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		);
		renderWithProvider(<TestComponent options={{ title: "Reduced" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		// reduced-motion 은 CSS(token.presence)가 transition 을 끈다. JS 는 인라인 모션 값을 쓰지 않는다.
		const dialog = screen.getByRole("alertdialog");
		expect(dialog.style.transform).toBe("");
		vi.unstubAllGlobals();
	});

	it("locks body scroll while open (data-open-modals counter)", async () => {
		renderWithProvider(<TestComponent options={{ title: "S" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("1");

		fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
		// 퇴출 spring 은 act 밖에서 setState 하므로 portal 이 DOM 에서 빠진 커밋 시점과
		// useEffect cleanup(스크롤락 해제) flush 시점이 한 tick 벌어진다. DOM 제거만 기다리면
		// 부하가 걸린 러너에서 cleanup 전에 단언이 실행돼 flaky - 잠금 해제까지 함께 기다린다.
		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			expect(document.body.style.overflow).toBe("");
			expect(document.body.dataset.openModals).toBeUndefined();
		});
	});
});

/** 버튼을 누르면 confirm 을 열고, 결과를 콜백으로 넘긴다 */
const Opener = ({
	options = {},
	onResult,
	label = "열기",
}: {
	options?: ConfirmOptions;
	onResult: (ok: boolean) => void;
	label?: string;
}) => {
	const confirm = useConfirm();
	return (
		<button
			type="button"
			onClick={() => void confirm({ title: "삭제할까요?", ...options }).then(onResult)}
		>
			{label}
		</button>
	);
};

const open = (label = "열기") => fireEvent.click(screen.getByRole("button", { name: label }));
const flush = () => act(async () => {});

describe("useConfirm", () => {
	it("resolves true on confirm and false on cancel, with a cancel button always shown", async () => {
		const onResult = vi.fn();
		render(
			<AlertProvider>
				<Opener onResult={onResult} />
			</AlertProvider>,
		);
		open();
		expect(screen.getByRole("alertdialog", { name: "삭제할까요?" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "확인" }));
		await flush();
		expect(onResult).toHaveBeenLastCalledWith(true);

		open();
		fireEvent.click(screen.getByRole("button", { name: "취소" }));
		await flush();
		expect(onResult).toHaveBeenLastCalledWith(false);
		expect(onResult).toHaveBeenCalledTimes(2);
	});

	it("resolves false on Escape and on an overlay click, exactly once", async () => {
		const onResult = vi.fn();
		render(
			<AlertProvider>
				<Opener onResult={onResult} />
			</AlertProvider>,
		);
		open();
		fireEvent.keyDown(document, { key: "Escape" });
		// 닫히는 중 다시 눌러도 두 번 resolve 되지 않는다
		fireEvent.keyDown(document, { key: "Escape" });
		await flush();
		expect(onResult).toHaveBeenCalledTimes(1);
		expect(onResult).toHaveBeenLastCalledWith(false);

		open();
		const overlay = document.querySelector(".alert_overlay") as HTMLElement;
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		await flush();
		expect(onResult).toHaveBeenCalledTimes(2);
		expect(onResult).toHaveBeenLastCalledWith(false);
	});

	it("replaces an open confirm - the earlier one resolves false", async () => {
		const first = vi.fn();
		const second = vi.fn();
		render(
			<AlertProvider>
				<Opener onResult={first} label="첫째" />
				<Opener onResult={second} label="둘째" options={{ title: "버릴까요?" }} />
			</AlertProvider>,
		);
		open("첫째");
		open("둘째");
		await flush();
		expect(first).toHaveBeenCalledWith(false);
		expect(screen.getByRole("alertdialog", { name: "버릴까요?" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "확인" }));
		await flush();
		expect(second).toHaveBeenCalledWith(true);
		expect(first).toHaveBeenCalledTimes(1);
	});

	it("keeps the replacement when the earlier async confirm finishes later", async () => {
		let finishFirst!: () => void;
		const firstAction = vi.fn(() => new Promise<void>((r) => (finishFirst = r)));
		const first = vi.fn();
		const second = vi.fn();
		render(
			<AlertProvider>
				<Opener onResult={first} label="첫째" options={{ onConfirm: firstAction }} />
				<Opener onResult={second} label="둘째" options={{ title: "버릴까요?" }} />
			</AlertProvider>,
		);
		open("첫째");
		fireEvent.click(screen.getByRole("button", { name: "확인" }));
		await flush();
		expect(firstAction).toHaveBeenCalledTimes(1);

		// 첫째가 아직 진행 중일 때 둘째로 교체 - 교체 시점에 첫째는 false 로 끝난다
		open("둘째");
		await flush();
		expect(first).toHaveBeenCalledWith(false);

		// 늦게 끝난 첫째 작업이 둘째를 닫거나 둘째 promise 를 resolve 하지 않는다
		await act(async () => finishFirst());
		const dialog = screen.getByRole("alertdialog", { name: "버릴까요?" });
		expect(dialog).not.toHaveAttribute("aria-busy");
		expect(second).not.toHaveBeenCalled();
		expect(first).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: "확인" }));
		await flush();
		expect(second).toHaveBeenCalledWith(true);
	});

	it("keeps the dialog open while an async onConfirm runs and blocks double submit and dismiss", async () => {
		let finish!: () => void;
		const action = vi.fn(() => new Promise<void>((r) => (finish = r)));
		const onResult = vi.fn();
		render(
			<AlertProvider>
				<Opener onResult={onResult} options={{ onConfirm: action, destructive: true }} />
			</AlertProvider>,
		);
		open();
		const confirmButton = screen.getByRole("button", { name: "확인" });
		confirmButton.focus();
		fireEvent.click(confirmButton);
		fireEvent.click(confirmButton);
		expect(action).toHaveBeenCalledTimes(1);
		expect(confirmButton).toHaveAttribute("aria-disabled", "true");
		expect(confirmButton).toHaveFocus();
		expect(screen.getByRole("alertdialog")).toHaveAttribute("aria-busy", "true");

		fireEvent.keyDown(document, { key: "Escape" });
		fireEvent.click(screen.getByRole("button", { name: "취소" }));
		await flush();
		expect(onResult).not.toHaveBeenCalled();
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();

		await act(async () => finish());
		expect(onResult).toHaveBeenCalledWith(true);
	});

	it("stays open for a retry when the async onConfirm fails", async () => {
		const action = vi
			.fn()
			.mockRejectedValueOnce(new Error("network"))
			.mockResolvedValueOnce(undefined);
		const onResult = vi.fn();
		render(
			<AlertProvider>
				<Opener onResult={onResult} options={{ onConfirm: action }} />
			</AlertProvider>,
		);
		open();
		fireEvent.click(screen.getByRole("button", { name: "확인" }));
		await flush();
		expect(onResult).not.toHaveBeenCalled();
		const confirmButton = screen.getByRole("button", { name: "확인" });
		expect(confirmButton).not.toHaveAttribute("aria-disabled");

		fireEvent.click(confirmButton);
		await flush();
		expect(action).toHaveBeenCalledTimes(2);
		expect(onResult).toHaveBeenCalledWith(true);
	});

	it("resolves false when the provider unmounts while waiting", async () => {
		const onResult = vi.fn();
		const { unmount } = render(
			<AlertProvider>
				<Opener onResult={onResult} />
			</AlertProvider>,
		);
		open();
		unmount();
		await flush();
		expect(onResult).toHaveBeenCalledWith(false);
	});

	it("puts the first focus on cancel, so a destructive confirm is not one Enter away", async () => {
		render(
			<AlertProvider>
				<Opener onResult={() => {}} options={{ destructive: true, confirmText: "삭제" }} />
			</AlertProvider>,
		);
		open();
		await waitFor(() => expect(screen.getByRole("button", { name: "취소" })).toHaveFocus());
	});

	it("leaves useAlert as it was - a plain alert has no cancel and runs its callbacks", async () => {
		const onConfirm = vi.fn();
		const T = () => {
			const { showAlert } = useAlert();
			return (
				<button type="button" onClick={() => showAlert({ title: "알림", onConfirm })}>
					열기
				</button>
			);
		};
		render(
			<AlertProvider>
				<T />
			</AlertProvider>,
		);
		open();
		expect(screen.queryByRole("button", { name: "취소" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "확인" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("throws outside the provider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		const Bare = () => {
			useConfirm();
			return null;
		};
		expect(() => render(<Bare />)).toThrow(/AlertProvider/);
		spy.mockRestore();
	});
});
