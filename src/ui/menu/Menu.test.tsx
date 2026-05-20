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
});
