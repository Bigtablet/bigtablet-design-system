import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopLoading } from "./index";

describe("TopLoading", () => {
    it("renders when isLoading is true", () => {
        render(<TopLoading isLoading={true} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("does not render when isLoading is false", () => {
        render(<TopLoading isLoading={false} />);
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("renders by default (isLoading defaults to true)", () => {
        render(<TopLoading />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("has correct aria attributes", () => {
        render(<TopLoading />);
        const progressbar = screen.getByRole("progressbar");

        expect(progressbar).toHaveAttribute("aria-valuemin", "0");
        expect(progressbar).toHaveAttribute("aria-valuemax", "100");
        expect(progressbar).toHaveAttribute("aria-label", "Page loading");
    });

    it("uses custom aria-label", () => {
        render(<TopLoading ariaLabel="Loading content" />);
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-label",
            "Loading content"
        );
    });

    it("shows progress value when provided", () => {
        render(<TopLoading progress={50} />);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    });

    it("does not have aria-valuenow in indeterminate mode", () => {
        render(<TopLoading />);
        expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    });

    it("applies indeterminate class when progress is undefined", () => {
        const { container } = render(<TopLoading />);
        const bar = container.querySelector(".top_loading_bar");
        expect(bar).toHaveClass("top_loading_indeterminate");
    });

    it("does not apply indeterminate class when progress is provided", () => {
        const { container } = render(<TopLoading progress={30} />);
        const bar = container.querySelector(".top_loading_bar");
        expect(bar).not.toHaveClass("top_loading_indeterminate");
    });

    it("applies progress width when provided", () => {
        const { container } = render(<TopLoading progress={75} />);
        const bar = container.querySelector(".top_loading_bar");
        expect(bar).toHaveStyle({ width: "75%" });
    });

    it("applies default height", () => {
        const { container } = render(<TopLoading />);
        expect(container.firstChild).toHaveStyle({ height: "3px" });
    });

    it("applies custom height", () => {
        const { container } = render(<TopLoading height={5} />);
        expect(container.firstChild).toHaveStyle({ height: "5px" });
    });

    it("applies custom color", () => {
        const { container } = render(<TopLoading color="#ff0000" />);
        const bar = container.querySelector(".top_loading_bar");
        expect(bar).toHaveStyle({ backgroundColor: "#ff0000" });
    });
});
