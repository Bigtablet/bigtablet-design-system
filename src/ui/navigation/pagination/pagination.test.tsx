import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./index";

describe("Pagination", () => {
	it("renders pagination navigation", () => {
		render(<Pagination page={1} totalPages={10} onChange={() => {}} />);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "페이지 이동");
	});

	it("renders previous and next buttons", () => {
		render(<Pagination page={5} totalPages={10} onChange={() => {}} />);
		expect(screen.getByLabelText("이전 페이지")).toBeInTheDocument();
		expect(screen.getByLabelText("다음 페이지")).toBeInTheDocument();
	});

	it("disables previous button on first page", () => {
		render(<Pagination page={1} totalPages={10} onChange={() => {}} />);
		expect(screen.getByLabelText("이전 페이지")).toBeDisabled();
	});

	it("disables next button on last page", () => {
		render(<Pagination page={10} totalPages={10} onChange={() => {}} />);
		expect(screen.getByLabelText("다음 페이지")).toBeDisabled();
	});

	it("enables both buttons on middle page", () => {
		render(<Pagination page={5} totalPages={10} onChange={() => {}} />);
		expect(screen.getByLabelText("이전 페이지")).not.toBeDisabled();
		expect(screen.getByLabelText("다음 페이지")).not.toBeDisabled();
	});

	it("calls onChange with previous page when clicking previous", () => {
		const onChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onChange={onChange} />);

		fireEvent.click(screen.getByLabelText("이전 페이지"));
		expect(onChange).toHaveBeenCalledWith(4);
	});

	it("calls onChange with next page when clicking next", () => {
		const onChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onChange={onChange} />);

		fireEvent.click(screen.getByLabelText("다음 페이지"));
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

	it("calls onPageChange (canonical) when clicking previous", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByLabelText("이전 페이지"));
		expect(onPageChange).toHaveBeenCalledWith(4);
	});

	it("prefers onPageChange over the deprecated onChange when both are given", () => {
		const onPageChange = vi.fn();
		const onChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} onChange={onChange} />);

		fireEvent.click(screen.getByLabelText("이전 페이지"));

		expect(onPageChange).toHaveBeenCalledTimes(1);
		expect(onPageChange).toHaveBeenCalledWith(4);
		expect(onChange).not.toHaveBeenCalled();
	});

	// <nav> 랜드마크 이름은 스크린리더의 리전 목록에 그대로 뜬다. 이전엔 영문 하드코딩이었다.
	it("lets the app override the nav landmark name", () => {
		render(<Pagination page={2} totalPages={5} onPageChange={() => {}} navLabel="Pagination" />);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Pagination");
	});
});
