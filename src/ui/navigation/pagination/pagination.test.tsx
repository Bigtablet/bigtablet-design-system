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

	it("shows all pages when totalPages <= 9", () => {
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
			[1, 10, ["1", "2", "3", "4", "5", "6", "7", "…", "10"]],
			[5, 20, ["1", "2", "3", "4", "5", "6", "7", "…", "20"]],
			[6, 20, ["1", "…", "4", "5", "6", "7", "8", "…", "20"]],
			[15, 20, ["1", "…", "13", "14", "15", "16", "17", "…", "20"]],
			[16, 20, ["1", "…", "14", "15", "16", "17", "18", "19", "20"]],
			[9, 9, ["1", "2", "3", "4", "5", "6", "7", "8", "9"]],
		];
		for (const [page, total, expected] of cases) {
			const { unmount } = render(
				<Pagination page={page} totalPages={total} onPageChange={() => {}} />,
			);
			expect(labels()).toEqual(expected);
			expect(document.querySelectorAll(".pagination_active")).toHaveLength(1);
			// 쪽이 많으면 칸 수가 늘 9 - ‹ › 가 움직이지 않는다 (#935)
			if (total > 9) expect(labels()).toHaveLength(9);
			unmount();
		}
	});

	describe("showPageJump (#905)", () => {
		const setup = (page = 1234, totalPages = 3650) => {
			const onPageChange = vi.fn();
			const view = render(
				<Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} showPageJump />,
			);
			const input = screen.getByRole("textbox", {
				name: `현재 ${page}쪽 - 이동할 쪽 번호 (1–${totalPages})`,
			}) as HTMLInputElement;
			const go = (value: string) => {
				fireEvent.change(input, { target: { value } });
				return fireEvent.keyDown(input, { key: "Enter" });
			};
			return { onPageChange, input, go, view };
		};

		// 적다 만 값을 되돌린 Escape 는 처리했다고 알린다 - 바깥 Modal 이 같이 닫히지 않게 (#976)
		it("marks Escape handled only when it resets a typed value", () => {
			const { input } = setup(2, 50);
			expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(true);
			fireEvent.change(input, { target: { value: "9" } });
			expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(false);
			expect(input.value).toBe("2");
		});

		it("is off by default - the current page stays a button", () => {
			render(<Pagination page={1} totalPages={10} onPageChange={() => {}} />);
			expect(screen.queryByRole("textbox")).toBeNull();
			expect(document.querySelector(".pagination_active")).toHaveAttribute("aria-current", "page");
		});

		it("turns the current page into an input showing its number", () => {
			const { input } = setup();
			expect(input).toHaveValue("1234");
			expect(input).toHaveAttribute("aria-current", "page");
			expect(document.querySelector(".pagination_active")).toBeNull();
		});

		it("moves to the typed page on Enter and blocks the outer form submit", () => {
			const { onPageChange, go } = setup();
			expect(go("2,000")).toBe(false); // preventDefault - 바깥 <form> 제출 방지
			expect(onPageChange).toHaveBeenLastCalledWith(2000);
		});

		it("keeps the same input focused after the page changes", () => {
			const { input, view } = setup(5, 100);
			input.focus();
			view.rerender(<Pagination page={42} totalPages={100} onPageChange={() => {}} showPageJump />);
			expect(document.activeElement).toBe(input);
			expect(input).toHaveValue("42");
			// 새 번호가 선택돼 있어 다음 입력이 덮어쓴다
			expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]);
		});

		it("ignores Enter while composing (IME)", () => {
			const { onPageChange, input } = setup();
			fireEvent.change(input, { target: { value: "12" } });
			fireEvent.keyDown(input, { key: "Enter", isComposing: true });
			expect(onPageChange).not.toHaveBeenCalled();
		});

		it("clamps out-of-range values", () => {
			const { onPageChange, go } = setup(5);
			go("99999");
			expect(onPageChange).toHaveBeenLastCalledWith(3650);
			go("0");
			expect(onPageChange).toHaveBeenLastCalledWith(1);
		});

		it("marks non-numbers invalid without moving, and Escape or blur restores the page", () => {
			const { onPageChange, input, go } = setup(7);
			go("abc");
			expect(onPageChange).not.toHaveBeenCalled();
			expect(input).toHaveAttribute("aria-invalid", "true");
			expect(input).toHaveValue("abc"); // 고칠 수 있게 남긴다

			fireEvent.keyDown(input, { key: "Escape" });
			expect(input).toHaveValue("7");
			expect(input).not.toHaveAttribute("aria-invalid");

			fireEvent.change(input, { target: { value: "30" } });
			fireEvent.blur(input);
			expect(input).toHaveValue("7");
			expect(onPageChange).not.toHaveBeenCalled();
		});

		it("does not call onPageChange for the current page", () => {
			const { onPageChange, go } = setup(7);
			go("7");
			expect(onPageChange).not.toHaveBeenCalled();
		});

		it("takes a custom label", () => {
			render(
				<Pagination
					page={1}
					totalPages={5}
					onPageChange={() => {}}
					showPageJump
					pageJumpLabel="Page number"
				/>,
			);
			expect(screen.getByRole("textbox", { name: "Page number" })).toBeInTheDocument();
		});
	});

	// 범위 밖 page 는 마지막 쪽으로 보고 그린다 (#984)
	it("treats a page beyond totalPages as the last page", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={5} totalPages={3} onPageChange={onPageChange} />);
		expect(screen.getByRole("button", { name: /3/ })).toHaveAttribute("aria-current", "page");
		fireEvent.click(screen.getByRole("button", { name: "이전 페이지" }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});
});
