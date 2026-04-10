import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Divider } from "./index";

describe("Divider", () => {
	it("renders as hr element", () => {
		const { container } = render(<Divider />);
		expect(container.querySelector("hr")).toBeInTheDocument();
	});

	it("applies standard weight by default", () => {
		const { container } = render(<Divider />);
		expect(container.firstChild).toHaveClass("divider_weight_standard");
	});

	it("applies heavy weight class", () => {
		const { container } = render(<Divider weight="heavy" />);
		expect(container.firstChild).toHaveClass("divider_weight_heavy");
	});

	it("accepts custom className", () => {
		const { container } = render(<Divider className="custom-divider" />);
		expect(container.firstChild).toHaveClass("custom-divider");
	});

	it("passes through HTML attributes", () => {
		const { container } = render(<Divider data-testid="test-divider" />);
		expect(container.querySelector("[data-testid='test-divider']")).toBeInTheDocument();
	});
});
