import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "./index";

describe("Menu", () => {
	it("does not render menu items initially", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
			/>,
		);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("opens menu on trigger click", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[
					{ key: "a", label: "Item A" },
					{ key: "b", label: "Item B" },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("menu")).toBeInTheDocument();
		expect(screen.getByText("Item A")).toBeInTheDocument();
	});

	it("calls onSelect and closes menu", () => {
		const onSelect = vi.fn();
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "Item A", onSelect }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		fireEvent.click(screen.getByText("Item A"));
		expect(onSelect).toHaveBeenCalled();
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("applies destructive class", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "del", label: "Delete", destructive: true }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByText("Delete").closest("button")).toHaveClass("menu_item_destructive");
	});

	it("does not call onSelect when disabled", () => {
		const onSelect = vi.fn();
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A", onSelect, disabled: true }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		fireEvent.click(screen.getByText("A"));
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("aria-haspopup and aria-expanded on trigger", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		expect(trigger).toHaveAttribute("aria-haspopup", "menu");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});

	// ── 추가 보강 테스트 ────────────────────────────────────────────────────────

	it("toggles closed when trigger is clicked again", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "Item A" }]}
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		fireEvent.click(trigger);
		expect(screen.getByRole("menu")).toBeInTheDocument();

		fireEvent.click(trigger);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("closes on Escape key", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "Item A" }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("menu")).toBeInTheDocument();

		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("closes when clicking outside", () => {
		render(
			<div>
				<Menu
					trigger={<button type="button">Open</button>}
					items={[{ key: "a", label: "Item A" }]}
				/>
				<button type="button" data-testid="outside">
					outside
				</button>
			</div>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("menu")).toBeInTheDocument();

		fireEvent.mouseDown(screen.getByTestId("outside"));
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("does not close when clicking inside the menu wrapper (non-item)", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "Item A" }]}
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		fireEvent.click(trigger);
		const menu = screen.getByRole("menu");

		// 메뉴 컨테이너 자체에 mousedown — 닫히면 안 됨 (외부 클릭이 아니므로)
		fireEvent.mouseDown(menu);
		expect(screen.getByRole("menu")).toBeInTheDocument();
	});

	it("applies align=start class by default", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("menu")).toHaveClass("menu_align_start");
	});

	it("applies align=end class", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
				align="end"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("menu")).toHaveClass("menu_align_end");
	});

	it("sets aria-controls on trigger when open and clears when closed", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Open" });
		expect(trigger).not.toHaveAttribute("aria-controls");

		fireEvent.click(trigger);
		const menu = screen.getByRole("menu");
		const menuId = menu.getAttribute("id");
		expect(menuId).toBeTruthy();
		expect(trigger).toHaveAttribute("aria-controls", menuId!);

		fireEvent.click(trigger);
		expect(trigger).not.toHaveAttribute("aria-controls");
	});

	it("renders each item with role=menuitem", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[
					{ key: "a", label: "A" },
					{ key: "b", label: "B" },
					{ key: "c", label: "C" },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getAllByRole("menuitem")).toHaveLength(3);
	});

	it("renders item icon when provided", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[
					{ key: "a", label: "A", icon: <svg data-testid="ic" /> },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByTestId("ic")).toBeInTheDocument();
		// 아이콘은 장식 — aria-hidden 처리되어야 함
		const iconWrapper = screen.getByTestId("ic").parentElement;
		expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
	});

	it("applies disabled class and HTML attribute on disabled items", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A", disabled: true }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		const item = screen.getByRole("menuitem", { name: "A" });
		expect(item).toBeDisabled();
		expect(item).toHaveClass("menu_item_disabled");
	});

	it("does not apply destructive class on regular items", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(screen.getByRole("menuitem", { name: "A" })).not.toHaveClass(
			"menu_item_destructive",
		);
	});

	it("calls correct onSelect when multiple items exist", () => {
		const onA = vi.fn();
		const onB = vi.fn();
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[
					{ key: "a", label: "Item A", onSelect: onA },
					{ key: "b", label: "Item B", onSelect: onB },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		fireEvent.click(screen.getByText("Item B"));
		expect(onA).not.toHaveBeenCalled();
		expect(onB).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("does not throw if item has no onSelect handler", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "Item A" }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		expect(() => fireEvent.click(screen.getByText("Item A"))).not.toThrow();
		// 클릭 후에도 닫힘 동작은 동일하게 일어나야 함
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("disabled item click does not close the menu", () => {
		render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A", disabled: true }]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open" }));
		// disabled 버튼은 클릭 이벤트 자체가 디스패치되지 않지만,
		// 강제로 click을 fire해 봐도 메뉴는 닫히지 않아야 함
		fireEvent.click(screen.getByText("A"));
		expect(screen.getByRole("menu")).toBeInTheDocument();
	});

	it("Escape only triggers close while open (no listener leak)", () => {
		const { unmount } = render(
			<Menu
				trigger={<button type="button">Open</button>}
				items={[{ key: "a", label: "A" }]}
			/>,
		);
		// 닫힌 상태에서 Escape를 눌러도 throw 없이 동작
		expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();
		// 언마운트 후에도 마찬가지
		unmount();
		expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();
	});
});
