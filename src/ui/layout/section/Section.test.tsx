import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./index";

describe("Section", () => {
	it("renders children", () => {
		const { getByText } = render(<Section>Content</Section>);
		expect(getByText("Content")).toBeInTheDocument();
	});

	it("applies default classes (md spacing, default bg)", () => {
		const { container } = render(<Section />);
		expect(container.firstChild).toHaveClass(
			"section",
			"section_spacing_md",
			"section_bg_default",
		);
	});

	it("applies spacing class", () => {
		const { container } = render(<Section spacing="xl" />);
		expect(container.firstChild).toHaveClass("section_spacing_xl");
	});

	it("applies bg class", () => {
		const { container } = render(<Section bg="navy" />);
		expect(container.firstChild).toHaveClass("section_bg_navy");
	});

	it("renders as section element by default", () => {
		const { container } = render(<Section />);
		expect(container.querySelector("section")).toBeInTheDocument();
	});

	it("renders as custom element", () => {
		const { container } = render(<Section as="div" />);
		expect(container.querySelector("div")).toBeInTheDocument();
		expect(container.querySelector("section")).not.toBeInTheDocument();
	});
});
