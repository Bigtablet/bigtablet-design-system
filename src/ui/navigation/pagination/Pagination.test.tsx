import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./index";

describe("Pagination", () => {
    it("renders pagination navigation", () => {
        render(<Pagination page={1} totalPages={10} onChange={() => {}} />);
        expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Pagination");
    });

    it("renders previous and next buttons", () => {
        render(<Pagination page={5} totalPages={10} onChange={() => {}} />);
        expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
        expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    });

    it("disables previous button on first page", () => {
        render(<Pagination page={1} totalPages={10} onChange={() => {}} />);
        expect(screen.getByLabelText("Previous page")).toBeDisabled();
    });

    it("disables next button on last page", () => {
        render(<Pagination page={10} totalPages={10} onChange={() => {}} />);
        expect(screen.getByLabelText("Next page")).toBeDisabled();
    });

    it("enables both buttons on middle page", () => {
        render(<Pagination page={5} totalPages={10} onChange={() => {}} />);
        expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
        expect(screen.getByLabelText("Next page")).not.toBeDisabled();
    });

    it("calls onChange with previous page when clicking previous", () => {
        const onChange = vi.fn();
        render(<Pagination page={5} totalPages={10} onChange={onChange} />);

        fireEvent.click(screen.getByLabelText("Previous page"));
        expect(onChange).toHaveBeenCalledWith(4);
    });

    it("calls onChange with next page when clicking next", () => {
        const onChange = vi.fn();
        render(<Pagination page={5} totalPages={10} onChange={onChange} />);

        fireEvent.click(screen.getByLabelText("Next page"));
        expect(onChange).toHaveBeenCalledWith(6);
    });

    it("calls onChange when clicking a page number", () => {
        const onChange = vi.fn();
        render(<Pagination page={1} totalPages={5} onChange={onChange} />);

        fireEvent.click(screen.getByText("3"));
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("marks current page with aria-current", () => {
        render(<Pagination page={3} totalPages={5} onChange={() => {}} />);
        expect(screen.getByText("3")).toHaveAttribute("aria-current", "page");
    });

    it("shows all pages when totalPages <= 7", () => {
        render(<Pagination page={1} totalPages={5} onChange={() => {}} />);

        for (let i = 1; i <= 5; i++) {
            expect(screen.getByText(String(i))).toBeInTheDocument();
        }
    });

    it("shows ellipsis for large page counts", () => {
        render(<Pagination page={5} totalPages={20} onChange={() => {}} />);
        const ellipses = screen.getAllByText("…");
        expect(ellipses.length).toBeGreaterThan(0);
    });

    it("applies active class to current page", () => {
        render(<Pagination page={3} totalPages={5} onChange={() => {}} />);
        expect(screen.getByText("3")).toHaveClass("pagination_active");
    });
});
