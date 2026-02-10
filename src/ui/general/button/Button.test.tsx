import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./index";

describe("Button", () => {
    it("renders with default props", () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole("button", { name: "Click me" });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("button", "button_variant_primary", "button_size_md");
    });

    it("renders with different variants", () => {
        const { rerender } = render(<Button variant="secondary">Button</Button>);
        expect(screen.getByRole("button")).toHaveClass("button_variant_secondary");

        rerender(<Button variant="ghost">Button</Button>);
        expect(screen.getByRole("button")).toHaveClass("button_variant_ghost");

        rerender(<Button variant="danger">Button</Button>);
        expect(screen.getByRole("button")).toHaveClass("button_variant_danger");
    });

    it("renders with different sizes", () => {
        const { rerender } = render(<Button size="sm">Button</Button>);
        expect(screen.getByRole("button")).toHaveClass("button_size_sm");

        rerender(<Button size="lg">Button</Button>);
        expect(screen.getByRole("button")).toHaveClass("button_size_lg");
    });

    it("handles click events", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole("button"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("can be disabled", () => {
        const handleClick = vi.fn();
        render(
            <Button disabled onClick={handleClick}>
                Click me
            </Button>
        );

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it("applies custom className", () => {
        render(<Button className="custom-class">Button</Button>);
        expect(screen.getByRole("button")).toHaveClass("custom-class");
    });

    it("applies custom width", () => {
        render(<Button width="200px">Button</Button>);
        expect(screen.getByRole("button")).toHaveStyle({ width: "200px" });
    });
});
