import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { Pagination as VanillaPagination } from "../../../vanilla/bigtablet.js";
import "../../../vanilla/scss/_custom-properties.scss";
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

	// 현재 쪽은 채운 배경, 포커스는 링 - 키보드로 다닐 때 둘이 같은 모양이면 지금 쪽을 알 수 없다 (#939)
	it("tells the focused page apart from the current page in the Vanilla bundle", async () => {
		const el = document.createElement("nav");
		el.className = "bt-pagination";
		document.body.appendChild(el);
		VanillaPagination(el, { page: 1, totalPages: 20 });
		const current = el.querySelector('[aria-current="page"]') as HTMLElement;
		const other = el.querySelector('[data-page="2"]') as HTMLElement;

		current.focus();
		await userEvent.keyboard("{Tab}");
		expect(other).toHaveFocus();
		const transparent = "rgba(0, 0, 0, 0)";
		expect(getComputedStyle(current).backgroundColor).not.toBe(transparent);
		expect(getComputedStyle(current).boxShadow).toBe("none");
		expect(getComputedStyle(other).backgroundColor).toBe(transparent);
		expect(getComputedStyle(other).boxShadow).toMatch(/0px 0px 0px 4px/);
		el.remove();
	});
});
