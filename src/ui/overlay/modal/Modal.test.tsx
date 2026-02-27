import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./index";

describe("Modal", () => {
    it("renders when open", () => {
        render(
            <Modal open onClose={() => {}}>
                Modal content
            </Modal>
        );
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Modal content")).toBeInTheDocument();
    });

    it("does not render when closed", () => {
        render(
            <Modal open={false} onClose={() => {}}>
                Modal content
            </Modal>
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders with title", () => {
        render(
            <Modal open onClose={() => {}} title="Modal Title">
                Content
            </Modal>
        );
        expect(screen.getByText("Modal Title")).toBeInTheDocument();
    });

    it("calls onClose when overlay is clicked", () => {
        const handleClose = vi.fn();
        render(
            <Modal open onClose={handleClose}>
                Content
            </Modal>
        );

        fireEvent.click(screen.getByRole("dialog"));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does not close on overlay click when closeOnOverlay is false", () => {
        const handleClose = vi.fn();
        render(
            <Modal open onClose={handleClose} closeOnOverlay={false}>
                Content
            </Modal>
        );

        fireEvent.click(screen.getByRole("dialog"));
        expect(handleClose).not.toHaveBeenCalled();
    });

    it("does not close when clicking inside modal panel", () => {
        const handleClose = vi.fn();
        render(
            <Modal open onClose={handleClose}>
                <button>Inside button</button>
            </Modal>
        );

        fireEvent.click(screen.getByText("Inside button"));
        expect(handleClose).not.toHaveBeenCalled();
    });

    it("closes on Escape key press", () => {
        const handleClose = vi.fn();
        render(
            <Modal open onClose={handleClose}>
                Content
            </Modal>
        );

        fireEvent.keyDown(document, { key: "Escape" });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("has correct accessibility attributes", () => {
        render(
            <Modal open onClose={() => {}}>
                Content
            </Modal>
        );

        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("applies custom width", () => {
        render(
            <Modal open onClose={() => {}} width={800}>
                Content
            </Modal>
        );

        const panel = screen.getByRole("dialog").querySelector(".modal_panel");
        expect(panel).toHaveStyle({ width: "800px" });
    });

    it("applies custom className to panel", () => {
        render(
            <Modal open onClose={() => {}} className="custom-modal">
                Content
            </Modal>
        );

        const panel = screen.getByRole("dialog").querySelector(".modal_panel");
        expect(panel).toHaveClass("custom-modal");
    });

    it("keeps scroll locked when one of multiple open modals is closed", () => {
        const { rerender } = render(
            <>
                <Modal open onClose={() => {}}>First</Modal>
                <Modal open onClose={() => {}}>Second</Modal>
            </>
        );

        expect(document.body.style.overflow).toBe("hidden");
        expect(document.body.dataset.openModals).toBe("2");

        // Close the second modal
        rerender(
            <>
                <Modal open onClose={() => {}}>First</Modal>
                <Modal open={false} onClose={() => {}}>Second</Modal>
            </>
        );

        // First modal still open — scroll must remain locked
        expect(document.body.style.overflow).toBe("hidden");
        expect(document.body.dataset.openModals).toBe("1");
    });
});
