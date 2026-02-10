import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./index";

describe("Spinner", () => {
    it("renders with default size", () => {
        render(<Spinner />);
        const spinner = screen.getByRole("status");
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveStyle({ width: "24px", height: "24px" });
    });

    it("renders with custom size", () => {
        render(<Spinner size={48} />);
        const spinner = screen.getByRole("status");
        expect(spinner).toHaveStyle({ width: "48px", height: "48px" });
    });

    it("has correct accessibility attributes", () => {
        render(<Spinner />);
        const spinner = screen.getByRole("status");
        expect(spinner).toHaveAttribute("aria-label");
    });

    it("has spinner class", () => {
        render(<Spinner />);
        expect(screen.getByRole("status")).toHaveClass("spinner");
    });
});
