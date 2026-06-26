import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "./index";

describe("Stack", () => {
	it("renders children", () => {
		const { getByText } = render(
			<Stack>
				<span>A</span>
				<span>B</span>
			</Stack>,
		);
		expect(getByText("A")).toBeInTheDocument();
		expect(getByText("B")).toBeInTheDocument();
	});

	it("applies vertical direction by default", () => {
		const { container } = render(<Stack />);
		expect(container.firstChild).toHaveClass("stack", "stack_vertical");
	});

	it("applies horizontal direction", () => {
		const { container } = render(<Stack direction="horizontal" />);
		expect(container.firstChild).toHaveClass("stack_horizontal");
	});

	it("applies gap as CSS variable", () => {
		const { container } = render(<Stack gap={24} />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.getPropertyValue("--stack-gap")).toBe("24px");
	});

	it("applies align class", () => {
		const { container } = render(<Stack align="center" />);
		expect(container.firstChild).toHaveClass("stack_align_center");
	});

	it("applies justify class", () => {
		const { container } = render(<Stack justify="between" />);
		expect(container.firstChild).toHaveClass("stack_justify_between");
	});

	it("applies wrap class", () => {
		const { container } = render(<Stack wrap="wrap" />);
		expect(container.firstChild).toHaveClass("stack_wrap_wrap");
	});

	it("renders as custom element", () => {
		const { container } = render(<Stack as="ul" />);
		expect(container.querySelector("ul")).toBeInTheDocument();
	});

	it("forwards ref to the root element", () => {
		let node: HTMLElement | null = null;
		render(<Stack ref={(el) => { node = el; }}>X</Stack>);
		expect(node).toBeInstanceOf(HTMLDivElement);
	});

});
