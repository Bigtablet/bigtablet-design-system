import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./index";

describe("Avatar", () => {
	it("renders image when src provided", () => {
		const { container } = render(<Avatar src="/me.jpg" name="박상민" />);
		const img = container.querySelector("img");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("alt", "박상민");
	});

	it("renders initials when no src", () => {
		const { container } = render(<Avatar name="박상민" />);
		expect(container.querySelector(".avatar_initials")).toHaveTextContent("박");
	});

	it("extracts initials from multi-word name (first + last)", () => {
		const { container } = render(<Avatar name="Sangmin Park" />);
		expect(container.querySelector(".avatar_initials")).toHaveTextContent("SP");
	});

	it("applies size class", () => {
		const { container } = render(<Avatar name="P" size="lg" />);
		expect(container.firstChild).toHaveClass("avatar_size_lg");
	});

	it("applies shape class", () => {
		const { container } = render(<Avatar name="P" shape="square" />);
		expect(container.firstChild).toHaveClass("avatar_shape_square");
	});

	it("uses custom bgColor when no image", () => {
		const { container } = render(<Avatar name="P" bgColor="#7AA5D2" />);
		expect(container.firstChild).toHaveStyle({ background: "#7AA5D2" });
	});
});
