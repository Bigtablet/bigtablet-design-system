import { render, screen } from "@testing-library/react";
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
		render(
			<Container
				ref={(el) => {
					node = el;
				}}
			>
				X
			</Container>,
		);
		expect(node).toBeInstanceOf(HTMLDivElement);
	});

	it("passes the target element's props through as", () => {
		// 예전에는 `as?: React.ElementType` 이라 요소만 갈리고 props 는 div 기준으로 고정돼,
		// `as="a"` 로 바꿔도 `href` 가 타입에 없었다.
		render(
			<Container as="a" href="/orders">
				주문
			</Container>,
		);

		const link = screen.getByRole("link", { name: "주문" });
		expect(link).toHaveAttribute("href", "/orders");
		expect(link).toHaveClass("container");
	});
});
