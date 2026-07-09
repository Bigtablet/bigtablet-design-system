import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./index";

describe("Modal", () => {
	it("renders when open", () => {
		render(
			<Modal open onClose={() => {}}>
				Modal content
			</Modal>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Modal content")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		render(
			<Modal open={false} onClose={() => {}}>
				Modal content
			</Modal>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders with title", () => {
		render(
			<Modal open onClose={() => {}} title="Modal Title">
				Content
			</Modal>,
		);
		expect(screen.getByText("Modal Title")).toBeInTheDocument();
	});

	it("calls onClose when overlay is clicked", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);

		fireEvent.click(screen.getByRole("dialog"));
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("does not close on overlay click when closeOnOverlay is false", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose} closeOnOverlay={false}>
				Content
			</Modal>,
		);

		fireEvent.click(screen.getByRole("dialog"));
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("does not close when clicking inside modal panel", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				<button type="button">Inside button</button>
			</Modal>,
		);

		fireEvent.click(screen.getByText("Inside button"));
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("closes on Escape key press", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);

		fireEvent.keyDown(screen.getByRole("document"), { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("has correct accessibility attributes", () => {
		render(
			<Modal open onClose={() => {}}>
				Content
			</Modal>,
		);

		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
	});

	it("applies custom width", () => {
		render(
			<Modal open onClose={() => {}} width={800}>
				Content
			</Modal>,
		);

		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel).toHaveStyle({ width: "800px" });
	});

	it("applies custom className to panel", () => {
		render(
			<Modal open onClose={() => {}} className="custom-modal">
				Content
			</Modal>,
		);

		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel).toHaveClass("custom-modal");
	});

	it("keeps scroll locked when one of multiple open modals is closed", () => {
		const { rerender } = render(
			<>
				<Modal open onClose={() => {}}>
					First
				</Modal>
				<Modal open onClose={() => {}}>
					Second
				</Modal>
			</>,
		);

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("2");

		// Close the second modal
		rerender(
			<>
				<Modal open onClose={() => {}}>
					First
				</Modal>
				<Modal open={false} onClose={() => {}}>
					Second
				</Modal>
			</>,
		);

		// First modal still open - scroll must remain locked
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("activates the focus trap when toggled open after mounting closed", () => {
		// 닫힌 채로 마운트 → open=true 로 전환하는 일반적인 controlled 패턴에서도 트랩이 걸려야 함
		const { rerender } = render(
			<Modal open={false} onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Modal>,
		);
		rerender(
			<Modal open onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Modal>,
		);
		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel?.contains(document.activeElement)).toBe(true);
	});

	it("calls onClose once on Escape from inside the modal (no duplicate handler)", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);
		fireEvent.keyDown(screen.getByRole("document"), { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

});
