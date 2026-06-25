import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid } from "./index";

describe("Grid", () => {
	it("renders children", () => {
		const { getByText } = render(
			<Grid>
				<span>Card 1</span>
				<span>Card 2</span>
			</Grid>,
		);
		expect(getByText("Card 1")).toBeInTheDocument();
	});

	it("applies default classes", () => {
		const { container } = render(<Grid />);
		expect(container.firstChild).toHaveClass("grid_layout", "grid_layout_mobile_single");
	});

	it("sets grid-template-columns for fixed cols", () => {
		const { container } = render(<Grid cols={4} />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.getPropertyValue("--grid-cols")).toBe("repeat(4, 1fr)");
	});

	it("sets auto-fill template for cols=auto", () => {
		const { container } = render(<Grid cols="auto" minColWidth="200px" />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.getPropertyValue("--grid-cols")).toBe(
			"repeat(auto-fill, minmax(200px, 1fr))",
		);
	});

	it("sets gap as CSS variable", () => {
		const { container } = render(<Grid gap={16} />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.getPropertyValue("--grid-gap")).toBe("16px");
	});

	it("sets independent rowGap and colGap", () => {
		const { container } = render(<Grid rowGap={32} colGap={8} />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.getPropertyValue("--grid-row-gap")).toBe("32px");
		expect(el.style.getPropertyValue("--grid-col-gap")).toBe("8px");
	});

	it("omits mobile-single class when singleColOnMobile=false", () => {
		const { container } = render(<Grid singleColOnMobile={false} />);
		expect(container.firstChild).not.toHaveClass("grid_layout_mobile_single");
	});

	it("renders as custom element", () => {
		const { container } = render(<Grid as="ul" />);
		expect(container.querySelector("ul")).toBeInTheDocument();
	});

	it("forwards ref to the root element", () => {
		let node: HTMLDivElement | null = null;
		render(<Grid ref={(el) => { node = el; }}>X</Grid>);
		expect(node).toBeInstanceOf(HTMLDivElement);
	});

});
