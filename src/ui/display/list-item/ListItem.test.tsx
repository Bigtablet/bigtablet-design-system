import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListItem } from "./index";

describe("ListItem", () => {
	it("renders label text", () => {
		render(<ListItem label="Test Label" />);
		expect(screen.getByText("Test Label")).toBeInTheDocument();
	});

	it("renders overline when provided", () => {
		render(<ListItem label="Label" overline="Overline" />);
		expect(screen.getByText("Overline")).toBeInTheDocument();
	});

	it("renders supportingText when provided", () => {
		render(<ListItem label="Label" supportingText="Supporting" />);
		expect(screen.getByText("Supporting")).toBeInTheDocument();
	});

	it("renders metadata when provided", () => {
		render(<ListItem label="Label" metadata="Meta info" />);
		expect(screen.getByText("Meta info")).toBeInTheDocument();
	});

	it("renders leading element", () => {
		render(
			<ListItem label="Label" leadingElement={<span>Leading</span>} />,
		);
		expect(screen.getByText("Leading")).toBeInTheDocument();
	});

	it("renders trailing element", () => {
		render(
			<ListItem label="Label" trailingElement={<span>Trailing</span>} />,
		);
		expect(screen.getByText("Trailing")).toBeInTheDocument();
	});

	it("applies top alignment class by default", () => {
		const { container } = render(<ListItem label="Label" />);
		expect(container.firstChild).toHaveClass("list_item_align_top");
	});

	it("applies middle alignment class", () => {
		const { container } = render(
			<ListItem label="Label" alignment="middle" />,
		);
		expect(container.firstChild).toHaveClass("list_item_align_middle");
	});

	it("applies disabled class and prevents click", () => {
		const handleClick = vi.fn();
		const { container } = render(
			<ListItem label="Label" disabled onClick={handleClick} />,
		);
		expect(container.firstChild).toHaveClass("list_item_disabled");
		fireEvent.click(container.firstChild as Element);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("calls onClick when interactive and not disabled", () => {
		const handleClick = vi.fn();
		const { container } = render(
			<ListItem label="Label" onClick={handleClick} />,
		);
		fireEvent.click(container.firstChild as Element);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("applies interactive class when onClick is provided", () => {
		const { container } = render(
			<ListItem label="Label" onClick={() => {}} />,
		);
		expect(container.firstChild).toHaveClass("list_item_interactive");
	});

	it("does not apply interactive class when onClick is not provided", () => {
		const { container } = render(<ListItem label="Label" />);
		expect(container.firstChild).not.toHaveClass("list_item_interactive");
	});

	it("sets role=button and tabIndex when interactive", () => {
		const { container } = render(
			<ListItem label="Label" onClick={() => {}} />,
		);
		expect(container.firstChild).toHaveAttribute("role", "button");
		expect(container.firstChild).toHaveAttribute("tabindex", "0");
	});

	it("applies custom className", () => {
		const { container } = render(
			<ListItem label="Label" className="custom-class" />,
		);
		expect(container.firstChild).toHaveClass("custom-class");
	});

	it("passes through HTML attributes", () => {
		render(<ListItem label="Label" data-testid="test-list-item" />);
		expect(screen.getByTestId("test-list-item")).toBeInTheDocument();
	});
});
