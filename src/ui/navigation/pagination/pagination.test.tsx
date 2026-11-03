import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./index";

describe("Pagination", () => {
	it("renders pagination navigation", () => {
		render(<Pagination page={1} totalPages={10} onPageChange={() => {}} />);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "페이지 이동");
	});

	it("renders previous and next buttons", () => {
		render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);
		expect(screen.getByLabelText("이전 페이지")).toBeInTheDocument();
		expect(screen.getByLabelText("다음 페이지")).toBeInTheDocument();
	});

	it("disables previous button on first page", () => {
		render(<Pagination page={1} totalPages={10} onPageChange={() => {}} />);
		expect(screen.getByLabelText("이전 페이지")).toBeDisabled();
	});

	it("disables next button on last page", () => {
		render(<Pagination page={10} totalPages={10} onPageChange={() => {}} />);
		expect(screen.getByLabelText("다음 페이지")).toBeDisabled();
	});

	it("enables both buttons on middle page", () => {
		render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);
		expect(screen.getByLabelText("이전 페이지")).not.toBeDisabled();
		expect(screen.getByLabelText("다음 페이지")).not.toBeDisabled();
	});

	it("calls onChange with previous page when clicking previous", () => {
		const onChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onPageChange={onChange} />);

		fireEvent.click(screen.getByLabelText("이전 페이지"));
		expect(onChange).toHaveBeenCalledWith(4);
	});

	it("calls onChange with next page when clicking next", () => {
		const onChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onPageChange={onChange} />);

		fireEvent.click(screen.getByLabelText("다음 페이지"));
		expect(onChange).toHaveBeenCalledWith(6);
	});

	it("calls onChange when clicking a page number", () => {
		const onChange = vi.fn();
		render(<Pagination page={1} totalPages={5} onPageChange={onChange} />);

		fireEvent.click(screen.getByText("3"));
		expect(onChange).toHaveBeenCalledWith(3);
	});

	it("marks current page with aria-current", () => {
		render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
		expect(screen.getByText("3")).toHaveAttribute("aria-current", "page");
	});

	it("shows all pages when totalPages <= 7", () => {
		render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);

		for (let i = 1; i <= 5; i++) {
			expect(screen.getByText(String(i))).toBeInTheDocument();
		}
	});

	it("shows ellipsis for large page counts", () => {
		render(<Pagination page={5} totalPages={20} onPageChange={() => {}} />);
		const ellipses = screen.getAllByText("…");
		expect(ellipses.length).toBeGreaterThan(0);
	});

	it("applies active class to current page", () => {
		render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
		expect(screen.getByText("3")).toHaveClass("pagination_active");
	});

	it("calls onPageChange (canonical) when clicking previous", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByLabelText("이전 페이지"));
		expect(onPageChange).toHaveBeenCalledWith(4);
	});

	// <nav> 랜드마크 이름은 스크린리더의 리전 목록에 그대로 뜬다. 이전엔 영문 하드코딩이었다.
	it("lets the app override the nav landmark name", () => {
		render(<Pagination page={2} totalPages={5} onPageChange={() => {}} navLabel="Pagination" />);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Pagination");
	});

	// ── 뮤테이션 테스트(`pnpm test:mutation`)에서 살아남은 분기 ──────────────────────

	const labels = () =>
		Array.from(document.querySelectorAll(".pagination_pages > li"), (li) =>
			(li.textContent ?? "").trim(),
		);

	it("lays out the start, middle and end windows at their boundaries", () => {
		const cases: [number, number, string[]][] = [
			[1, 8, ["1", "2", "3", "4", "5", "…", "8"]],
			[4, 20, ["1", "2", "3", "4", "5", "…", "20"]],
			[5, 20, ["1", "…", "3", "4", "5", "6", "7", "…", "20"]],
			[16, 20, ["1", "…", "14", "15", "16", "17", "18", "…", "20"]],
			[17, 20, ["1", "…", "16", "17", "18", "19", "20"]],
			[7, 7, ["1", "2", "3", "4", "5", "6", "7"]],
		];
		for (const [page, total, expected] of cases) {
			const { unmount } = render(
				<Pagination page={page} totalPages={total} onPageChange={() => {}} />,
			);
			expect(labels()).toEqual(expected);
			expect(document.querySelectorAll(".pagination_active")).toHaveLength(1);
			unmount();
		}
	});

	describe("showPageJump (#905)", () => {
		const setup = (page = 1, totalPages = 3650) => {
			const onPageChange = vi.fn();
			render(
				<Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} showPageJump />,
			);
			const input = screen.getByRole("textbox", { name: `이동할 쪽 번호 (1–${totalPages})` });
			const go = (value: string) => {
				fireEvent.change(input, { target: { value } });
				return fireEvent.keyDown(input, { key: "Enter" });
			};
			return { onPageChange, input, go };
		};

		it("is off by default", () => {
			render(<Pagination page={1} totalPages={10} onPageChange={() => {}} />);
			expect(screen.queryByRole("textbox")).toBeNull();
		});

		it("renders 이동 [ ] 쪽 without a button", () => {
			setup();
			expect(document.querySelector(".pagination_jump")?.textContent).toBe("이동쪽");
			expect(screen.queryByRole("button", { name: "이동" })).toBeNull();
		});

		it("moves to the typed page on Enter and blocks the outer form submit", () => {
			const { onPageChange, input, go } = setup();
			expect(go("1,234")).toBe(false); // preventDefault - 바깥 <form> 제출 방지
			expect(onPageChange).toHaveBeenLastCalledWith(1234);
			expect(input).toHaveValue("");
		});

		it("ignores Enter while composing (IME)", () => {
			const { onPageChange, input } = setup();
			fireEvent.change(input, { target: { value: "12" } });
			fireEvent.keyDown(input, { key: "Enter", isComposing: true });
			expect(onPageChange).not.toHaveBeenCalled();
		});

		it("clamps out-of-range values and ignores non-numbers", () => {
			const { onPageChange, input, go } = setup(5);
			go("99999");
			expect(onPageChange).toHaveBeenLastCalledWith(3650);
			go("0");
			expect(onPageChange).toHaveBeenLastCalledWith(1);

			onPageChange.mockClear();
			go("abc");
			go("-3");
			expect(onPageChange).not.toHaveBeenCalled();
			expect(input).toHaveValue("-3"); // 고칠 수 있게 남긴다
		});

		it("does not call onPageChange for the current page", () => {
			const { onPageChange, go } = setup(7);
			go("7");
			expect(onPageChange).not.toHaveBeenCalled();
		});

		it("takes custom labels", () => {
			render(
				<Pagination
					page={1}
					totalPages={5}
					onPageChange={() => {}}
					showPageJump
					pageJumpLabel="Page number"
					pageJumpPrefix="Go to"
					pageJumpSuffix="page"
				/>,
			);
			expect(screen.getByRole("textbox", { name: "Page number" })).toBeInTheDocument();
			expect(document.querySelector(".pagination_jump")?.textContent).toBe("Go topage");
		});
	});
});
