import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./index";

const items = [
	{ key: "a", title: "Title A", content: "Content A" },
	{ key: "b", title: "Title B", content: "Content B" },
	{ key: "c", title: "Title C", content: "Content C", disabled: true },
];

describe("Accordion", () => {
	it("renders all triggers, no content initially", () => {
		render(<Accordion items={items} />);
		expect(screen.getByText("Title A")).toBeInTheDocument();
		expect(screen.queryByText("Content A")).not.toBeInTheDocument();
	});

	it("toggles content on click", () => {
		render(<Accordion items={items} />);
		fireEvent.click(screen.getByText("Title A"));
		expect(screen.getByText("Content A")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Title A"));
		expect(screen.queryByText("Content A")).not.toBeInTheDocument();
	});

	it("only one item open at a time by default", () => {
		render(<Accordion items={items} />);
		fireEvent.click(screen.getByText("Title A"));
		fireEvent.click(screen.getByText("Title B"));
		expect(screen.queryByText("Content A")).not.toBeInTheDocument();
		expect(screen.getByText("Content B")).toBeInTheDocument();
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
});
