import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToastProvider } from "./index";
import { useToast } from "./use-toast";
import { toast } from "react-toastify";

// react-toastify 목 처리
vi.mock("react-toastify", () => ({
    ToastContainer: ({ containerId }: { containerId: string }) => (
        <div data-testid="toast-container" data-container-id={containerId} />
    ),
    Slide: "Slide",
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    },
}));

describe("ToastProvider", () => {
    it("renders ToastContainer", () => {
        render(<ToastProvider />);
        expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    });

    it("uses default containerId", () => {
        render(<ToastProvider />);
        expect(screen.getByTestId("toast-container")).toHaveAttribute(
            "data-container-id",
            "default"
        );
    });

    it("uses custom containerId", () => {
        render(<ToastProvider containerId="custom" />);
        expect(screen.getByTestId("toast-container")).toHaveAttribute(
            "data-container-id",
            "custom"
        );
    });
});

describe("useToast", () => {
    it("returns toast functions", () => {
        const toastFns = useToast();

        expect(toastFns.success).toBeDefined();
        expect(toastFns.error).toBeDefined();
        expect(toastFns.warning).toBeDefined();
        expect(toastFns.info).toBeDefined();
        expect(toastFns.message).toBeDefined();
    });

    it("calls toast.success with message and containerId", () => {
        const toastFns = useToast("test-container");
        toastFns.success("Success message");

        expect(toast.success).toHaveBeenCalledWith("Success message", {
            containerId: "test-container",
        });
    });

    it("calls toast.error with message and containerId", () => {
        const toastFns = useToast("test-container");
        toastFns.error("Error message");

        expect(toast.error).toHaveBeenCalledWith("Error message", {
            containerId: "test-container",
        });
    });

    it("calls toast.warning with message and containerId", () => {
        const toastFns = useToast("test-container");
        toastFns.warning("Warning message");

        expect(toast.warning).toHaveBeenCalledWith("Warning message", {
            containerId: "test-container",
        });
    });

    it("calls toast.info with message and containerId", () => {
        const toastFns = useToast("test-container");
        toastFns.info("Info message");

        expect(toast.info).toHaveBeenCalledWith("Info message", {
            containerId: "test-container",
        });
    });

    it("uses default containerId when not provided", () => {
        const toastFns = useToast();
        toastFns.success("Test");

        expect(toast.success).toHaveBeenCalledWith("Test", {
            containerId: "default",
        });
    });
});
