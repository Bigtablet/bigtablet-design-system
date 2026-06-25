import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Container } from "./index";

describe("Container", () => {
	it("renders children", () => {
		const { getByText } = render(<Container>Hello</Container>);
		expect(getByText("Hello")).toBeInTheDocument();
	});

	it("applies default classes (xl, center)", () => {
		const { container } = render(<Container />);
		expect(container.firstChild).toHaveClass("container", "container_size_xl", "container_center");
	});

	it("applies size class", () => {
		const { container } = render(<Container size="lg" />);
		expect(container.firstChild).toHaveClass("container_size_lg");
	});

	it("omits center class when center=false", () => {
		const { container } = render(<Container center={false} />);
		expect(container.firstChild).not.toHaveClass("container_center");
	});

	it("renders as custom element", () => {
		const { container } = render(<Container as="main" />);
		expect(container.querySelector("main")).toBeInTheDocument();
	});

	it("accepts custom className", () => {
		const { container } = render(<Container className="custom" />);
		expect(container.firstChild).toHaveClass("custom");
	});

	it("forwards ref to the root element", () => {
		let node: HTMLElement | null = null;
		render(<Container ref={(el) => { node = el; }}>X</Container>);
		expect(node).toBeInstanceOf(HTMLDivElement);
	});

});
