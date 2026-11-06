import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination as VanillaPagination } from "../../../vanilla/bigtablet.js";
import "../../../vanilla/scss/_pagination.scss";
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

	it("keeps the same width on every page in the Vanilla bundle", () => {
		const el = document.createElement("nav");
		el.className = "bt-pagination";
		document.body.appendChild(el);
		const api = VanillaPagination(el, { page: 1, totalPages: 20 });
		const widthOf = () => el.querySelector(".bt-pagination__pages")?.getBoundingClientRect().width;
		const first = widthOf();
		for (const page of [5, 6, 10, 15, 16, 19, 20]) {
			api?.setPage(page);
			expect(widthOf(), `page ${page}`).toBe(first);
		}
		el.remove();
	});
});
