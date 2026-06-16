import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./index";

describe("Card", () => {
	it("renders children", () => {
		render(<Card>Card content</Card>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("renders heading when provided", () => {
		render(<Card heading="Card Title">Content</Card>);
		expect(screen.getByText("Card Title")).toBeInTheDocument();
	});

	it("renders heading as h3 by default", () => {
		render(<Card heading="Card Title">Content</Card>);
		expect(screen.getByRole("heading", { level: 3, name: "Card Title" })).toBeInTheDocument();
	});

	it("renders heading with custom headingAs level", () => {
		render(
			<Card heading="Card Title" headingAs="h2">
				Content
			</Card>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Card Title" })).toBeInTheDocument();
	});

	it("does not render heading element when not provided", () => {
		render(<Card>Content</Card>);
		expect(screen.queryByText("Card Title")).not.toBeInTheDocument();
	});

	it("applies default shadow class", () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.firstChild).toHaveClass("card_shadow_sm");
	});

	it("applies custom shadow class", () => {
		const { container } = render(<Card shadow="lg">Content</Card>);
		expect(container.firstChild).toHaveClass("card_shadow_lg");
	});

	it("applies default padding class", () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.firstChild).toHaveClass("card_p_md");
	});

	it("applies custom padding class", () => {
		const { container } = render(<Card padding="lg">Content</Card>);
		expect(container.firstChild).toHaveClass("card_p_lg");
	});

	it("applies bordered class when bordered is true", () => {
		const { container } = render(<Card bordered>Content</Card>);
		expect(container.firstChild).toHaveClass("card_bordered");
	});

	it("does not apply bordered class by default", () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.firstChild).not.toHaveClass("card_bordered");
	});

	it("applies custom className", () => {
		const { container } = render(<Card className="custom-card">Content</Card>);
		expect(container.firstChild).toHaveClass("custom-card");
	});

	it("passes through HTML attributes", () => {
		render(<Card data-testid="test-card">Content</Card>);
		expect(screen.getByTestId("test-card")).toBeInTheDocument();
	});

	it("renders with no shadow", () => {
		const { container } = render(<Card shadow="none">Content</Card>);
		expect(container.firstChild).toHaveClass("card_shadow_none");
	});

	it("renders with no padding", () => {
		const { container } = render(<Card padding="none">Content</Card>);
		expect(container.firstChild).toHaveClass("card_p_none");
	});

	// ── variant (glass / outlined) ──────────────────────────────────────

	it("does not apply a variant class for default variant", () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.firstChild).not.toHaveClass("card_variant_default");
	});

	it("applies accent variant class", () => {
		const { container } = render(<Card variant="accent">Content</Card>);
		expect(container.firstChild).toHaveClass("card_variant_accent");
	});

	it("applies glass variant class", () => {
		const { container } = render(<Card variant="glass">Content</Card>);
		expect(container.firstChild).toHaveClass("card_variant_glass");
	});

	it("applies outlined variant class", () => {
		const { container } = render(<Card variant="outlined">Content</Card>);
		expect(container.firstChild).toHaveClass("card_variant_outlined");
	});

	// ── interactive (hover-lift) ────────────────────────────────────────

	it("applies interactive class when interactive is true", () => {
		const { container } = render(<Card interactive>Content</Card>);
		expect(container.firstChild).toHaveClass("card_interactive");
	});

	it("does not apply interactive class by default", () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.firstChild).not.toHaveClass("card_interactive");
	});

	// ── footer slot ─────────────────────────────────────────────────────

	it("renders footer when provided", () => {
		render(<Card footer={<button type="button">Save</button>}>Content</Card>);
		expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
	});

	it("does not render footer element when not provided", () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.querySelector(".card_footer")).not.toBeInTheDocument();
	});

	it("applies footerAlign=end by default", () => {
		const { container } = render(<Card footer={<span>f</span>}>Content</Card>);
		expect(container.querySelector(".card_footer")).toHaveClass("card_footer_end");
	});

	it("applies custom footerAlign class", () => {
		const { container } = render(
			<Card footer={<span>f</span>} footerAlign="between">
				Content
			</Card>,
		);
		expect(container.querySelector(".card_footer")).toHaveClass("card_footer_between");
	});

	// ── 회귀: 신규 prop 미지정 시 기존 동작 유지 ────────────────────────

	it("keeps default behavior when new props are omitted", () => {
		const { container } = render(<Card heading="T">Content</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card).toHaveClass("card", "card_shadow_sm", "card_p_md");
		expect(card).not.toHaveClass("card_interactive");
		expect(card.querySelector(".card_footer")).not.toBeInTheDocument();
	});
});
