import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertProvider, useAlert } from "./index";

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
		renderWithProvider(<TestComponent options={{ title: "Test" }} />);

		fireEvent.click(screen.getByText("Show Alert"));
		expect(screen.getByText("Test")).toBeInTheDocument();

		fireEvent.click(screen.getByText("확인"));
		// Exit animation in progress (spring) - overlay still mounted with role="presentation"
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("starts exit animation when cancel is clicked", () => {
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

	it("applies variant class", () => {
		renderWithProvider(<TestComponent options={{ variant: "error" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		const dialog = screen.getByRole("alertdialog");
		expect(dialog).toHaveClass("alert_variant_error");
	});

	it("does not render icon by default", () => {
		renderWithProvider(<TestComponent options={{ variant: "info" }} />);

		fireEvent.click(screen.getByText("Show Alert"));

		expect(document.querySelector(".alert_icon")).not.toBeInTheDocument();
	});

	it("renders variant icon when showIcon=true", () => {
		renderWithProvider(<TestComponent options={{ variant: "error", showIcon: true }} />);

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
});
