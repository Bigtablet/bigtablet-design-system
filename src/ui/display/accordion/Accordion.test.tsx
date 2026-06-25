import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./index";

const items = [
	{ key: "a", title: "Title A", content: "Content A" },
	{ key: "b", title: "Title B", content: "Content B" },
	{ key: "c", title: "Title C", content: "Content C", disabled: true },
];

describe("Accordion", () => {
	it("renders all triggers, all panels hidden initially", () => {
		render(<Accordion items={items} />);
		expect(screen.getByText("Title A")).toBeInTheDocument();
		// panel은 항상 DOM에 있으나 aria-hidden + closed class로 시각적 숨김 (애니메이션 지원)
		const panels = document.querySelectorAll(".accordion_panel");
		panels.forEach((p) => expect(p).toHaveAttribute("aria-hidden", "true"));
	});

	it("toggles panel open state on click", () => {
		render(<Accordion items={items} />);
		const panelA = document
			.getElementById("a-panel") as HTMLElement;
		expect(panelA).toHaveAttribute("aria-hidden", "true");

		fireEvent.click(screen.getByText("Title A"));
		expect(panelA).toHaveAttribute("aria-hidden", "false");
		expect(panelA).toHaveClass("accordion_panel_open");

		fireEvent.click(screen.getByText("Title A"));
		expect(panelA).toHaveAttribute("aria-hidden", "true");
	});

	it("only one item open at a time by default", () => {
		render(<Accordion items={items} />);
		fireEvent.click(screen.getByText("Title A"));
		fireEvent.click(screen.getByText("Title B"));
		const panelA = document.getElementById("a-panel") as HTMLElement;
		const panelB = document.getElementById("b-panel") as HTMLElement;
		expect(panelA).toHaveAttribute("aria-hidden", "true");
		expect(panelB).toHaveAttribute("aria-hidden", "false");
	});

	it("multiple=true allows multiple open", () => {
		render(<Accordion items={items} multiple />);
		fireEvent.click(screen.getByText("Title A"));
		fireEvent.click(screen.getByText("Title B"));
		expect(screen.getByText("Content A")).toBeInTheDocument();
		expect(screen.getByText("Content B")).toBeInTheDocument();
	});

	it("opens defaultOpenKeys initially", () => {
		render(<Accordion items={items} defaultOpenKeys={["b"]} />);
		expect(screen.getByText("Content B")).toBeInTheDocument();
	});

	it("disabled item cannot be opened", () => {
		render(<Accordion items={items} />);
		const cBtn = screen.getByText("Title C").closest("button");
		expect(cBtn).toBeDisabled();
	});

	it("aria-expanded reflects state", () => {
		render(<Accordion items={items} />);
		const trigger = screen.getByText("Title A").closest("button");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trigger as Element);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});

	it("fires onChange callback", () => {
		const onChange = vi.fn();
		render(<Accordion items={items} onChange={onChange} />);
		fireEvent.click(screen.getByText("Title A"));
		expect(onChange).toHaveBeenCalledWith(["a"]);
	});

	it("fires onValueChange (canonical)", () => {
		const onValueChange = vi.fn();
		render(<Accordion items={items} onValueChange={onValueChange} />);
		fireEvent.click(screen.getByText("Title A"));
		expect(onValueChange).toHaveBeenCalledWith(["a"]);
	});

});
