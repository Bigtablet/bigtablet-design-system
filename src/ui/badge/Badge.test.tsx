import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./index";

describe("Badge", () => {
	it("renders label children", () => {
		render(<Badge>New</Badge>);
		expect(screen.getByText("New")).toBeInTheDocument();
	});

	it("renders count number", () => {
		render(<Badge shape="count" count={5} />);
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("caps count at max with '+'", () => {
		render(<Badge shape="count" count={150} max={99} />);
		expect(screen.getByText("99+")).toBeInTheDocument();
	});

	it("renders empty dot", () => {
		const { container } = render(<Badge shape="dot" variant="error" />);
		const dot = container.firstChild as HTMLElement;
		expect(dot).toHaveClass("badge_shape_dot");
		expect(dot).toHaveClass("badge_variant_error");
		expect(dot.textContent).toBe("");
	});

	it("applies variant class", () => {
		const { container } = render(<Badge variant="success">OK</Badge>);
		expect(container.firstChild).toHaveClass("badge_variant_success");
	});
});
