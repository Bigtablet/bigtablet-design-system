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
		const { container } = render(<Badge shape="dot" tone="error" />);
		const dot = container.firstChild as HTMLElement;
		expect(dot).toHaveClass("badge_shape_dot");
		expect(dot).toHaveClass("badge_variant_error");
		expect(dot.textContent).toBe("");
	});

	it("applies tone class", () => {
		const { container } = render(<Badge tone="success">OK</Badge>);
		expect(container.firstChild).toHaveClass("badge_variant_success");
	});

	// 옛 이름 `variant` 는 deprecated 별칭으로 계속 받는다. 둘 다 주면 `tone` 이 이긴다.
	it("still accepts the deprecated variant prop, tone wins when both are set", () => {
		const { container, rerender } = render(<Badge variant="warning">OK</Badge>);
		expect(container.firstChild).toHaveClass("badge_variant_warning");
		rerender(
			<Badge variant="warning" tone="error">
				OK
			</Badge>,
		);
		expect(container.firstChild).toHaveClass("badge_variant_error");
		expect(container.firstChild).not.toHaveClass("badge_variant_warning");
	});

	it("default appearance is solid", () => {
		const { container } = render(<Badge tone="success">OK</Badge>);
		expect(container.firstChild).toHaveClass("badge_appearance_solid");
	});

	it("applies appearance=soft class when specified", () => {
		const { container } = render(
			<Badge tone="success" appearance="soft">
				+5%
			</Badge>,
		);
		expect(container.firstChild).toHaveClass("badge_appearance_soft");
		expect(container.firstChild).toHaveClass("badge_variant_success");
	});

	it("soft + accent tone uses accent_subtle bg via class", () => {
		const { container } = render(
			<Badge tone="accent" appearance="soft">
				New
			</Badge>,
		);
		expect(container.firstChild).toHaveClass("badge_appearance_soft");
		expect(container.firstChild).toHaveClass("badge_variant_accent");
	});
});
