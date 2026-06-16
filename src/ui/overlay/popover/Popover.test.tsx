import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./index";

describe("Popover", () => {
	it("does not render content initially", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
	});

	it("opens on trigger click and shows content", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Panel content")).toBeInTheDocument();
	});

	it("toggles closed when trigger is clicked again", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		fireEvent.click(trigger);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		fireEvent.click(trigger);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("closes on Escape and restores focus to trigger", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<button type="button">inner</button>}
				aria-label="popover"
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		trigger.focus();
		fireEvent.click(trigger);
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(trigger).toHaveFocus();
	});

	it("closes when clicking outside", () => {
		render(
			<div>
				<Popover
					trigger={<button type="button">Open</button>}
					content={<span>Panel content</span>}
					aria-label="popover"
				/>
				<button type="button" data-testid="outside">
					outside
				</button>
			</div>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		fireEvent.mouseDown(screen.getByTestId("outside"));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("does not close when clicking inside the panel", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		const dialog = screen.getByRole("dialog");
		fireEvent.mouseDown(dialog);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("moves focus to first focusable inside the panel on open", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<button type="button">inner</button>}
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("button", { name: "inner" })).toHaveFocus();
	});

	it("focuses the panel itself when no focusable content", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>just text</span>}
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("dialog")).toHaveFocus();
	});

	it("sets aria attributes on the trigger", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		expect(trigger).not.toHaveAttribute("aria-controls");

		fireEvent.click(trigger);
		const dialog = screen.getByRole("dialog");
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(trigger).toHaveAttribute("aria-controls", dialog.getAttribute("id")!);

		fireEvent.click(trigger);
		expect(trigger).not.toHaveAttribute("aria-controls");
	});

	it("applies placement class (default bottom)", () => {
		const { rerender } = render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("dialog").parentElement).toHaveClass("popover_placement_bottom");

		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		rerender(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				placement="right"
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("dialog").parentElement).toHaveClass("popover_placement_right");
	});

	it("propagates aria-label to the dialog", () => {
		render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="필터 옵션"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("dialog", { name: "필터 옵션" })).toBeInTheDocument();
	});

	it("preserves the trigger's own onClick handler", () => {
		const onClick = vi.fn();
		render(
			<Popover
				trigger={
					<button type="button" onClick={onClick}>
						Open
					</button>
				}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("controlled mode: open prop drives visibility and onOpenChange fires", () => {
		const onOpenChange = vi.fn();
		const { rerender } = render(
			<Popover
				open={false}
				onOpenChange={onOpenChange}
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		// 제어 모드: 클릭해도 내부 state 로 열리지 않고 콜백만 호출
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(onOpenChange).toHaveBeenCalledWith(true);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		// 부모가 open=true 로 반영해야 보임
		rerender(
			<Popover
				open
				onOpenChange={onOpenChange}
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("uncontrolled mode: respects defaultOpen", () => {
		render(
			<Popover
				defaultOpen
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("Escape while closed does not throw", () => {
		const { unmount } = render(
			<Popover
				trigger={<button type="button">Open</button>}
				content={<span>Panel content</span>}
				aria-label="popover"
			/>,
		);
		expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();
		unmount();
		expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();
	});
});
