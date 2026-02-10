import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
