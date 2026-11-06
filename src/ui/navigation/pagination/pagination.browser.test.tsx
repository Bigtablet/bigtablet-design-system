import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination } from "./index";
import "./style.scss";

describe("Pagination (Chromium)", () => {
	// 가운데 정렬이라 너비가 바뀌면 ‹ › 가 좌우로 움직여 연달아 누를 때 엉뚱한 번호를 누른다 (#935)
	it("keeps the same width on every page", () => {
		const { rerender } = render(<Pagination page={1} totalPages={20} onPageChange={() => {}} />);
		const nav = screen.getByRole("navigation");
		const widthOf = () => nav.querySelector(".pagination_pages")?.getBoundingClientRect().width;
		const first = widthOf();
		for (const page of [5, 6, 10, 15, 16, 19, 20]) {
			rerender(<Pagination page={page} totalPages={20} onPageChange={() => {}} />);
			expect(widthOf(), `page ${page}`).toBe(first);
		}
	});
});
