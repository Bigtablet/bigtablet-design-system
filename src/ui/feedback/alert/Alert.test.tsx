import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlertProvider, useAlert } from "./index";

const TestComponent = ({ options }: { options?: Parameters<ReturnType<typeof useAlert>["showAlert"]>[0] }) => {
    const { showAlert } = useAlert();
    return (
        <button onClick={() => showAlert(options || { title: "Test Alert" })}>
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

        expect(() => render(<TestComponent />)).toThrow(
            "useAlert must be used within AlertProvider"
        );

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

    it("closes alert when confirm is clicked", () => {
        renderWithProvider(<TestComponent options={{ title: "Test" }} />);

        fireEvent.click(screen.getByText("Show Alert"));
        expect(screen.getByText("Test")).toBeInTheDocument();

        fireEvent.click(screen.getByText("확인"));
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });

    it("closes alert when cancel is clicked", () => {
        renderWithProvider(<TestComponent options={{ title: "Test", showCancel: true }} />);

        fireEvent.click(screen.getByText("Show Alert"));
        expect(screen.getByText("Test")).toBeInTheDocument();

        fireEvent.click(screen.getByText("취소"));
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });

    it("closes alert when overlay is clicked", () => {
        renderWithProvider(<TestComponent options={{ title: "Test" }} />);

        fireEvent.click(screen.getByText("Show Alert"));
        expect(screen.getByText("Test")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("alertdialog").parentElement!);
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });

    it("has correct accessibility attributes", () => {
        renderWithProvider(<TestComponent options={{ title: "Test", message: "Message" }} />);

        fireEvent.click(screen.getByText("Show Alert"));

        const dialog = screen.getByRole("alertdialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-labelledby", "alert_title");
        expect(dialog).toHaveAttribute("aria-describedby", "alert_message");
    });

    it("applies variant class", () => {
        renderWithProvider(<TestComponent options={{ variant: "error" }} />);

        fireEvent.click(screen.getByText("Show Alert"));

        const dialog = screen.getByRole("alertdialog");
        expect(dialog).toHaveClass("alert_variant_error");
    });

    it("applies actionsAlign class", () => {
        renderWithProvider(<TestComponent options={{ actionsAlign: "center" }} />);

        fireEvent.click(screen.getByText("Show Alert"));

        const actions = screen.getByRole("alertdialog").querySelector(".alert_actions");
        expect(actions).toHaveClass("alert_actions_center");
    });
});
