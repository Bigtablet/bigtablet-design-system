import { describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { init, Pagination } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

describe("Pagination", () => {
	const mount = (page: number, totalPages: number, onPageChange?: (p: number) => void) => {
		const el = document.createElement("nav");
		el.className = "bt-pagination";
		document.body.appendChild(el);
		return { el, api: Pagination(el, { page, totalPages, onPageChange }) };
	};
	const labels = (el: HTMLElement) =>
		Array.from(el.querySelectorAll(".bt-pagination__pages > *"), (n) =>
			n.classList.contains("bt-pagination__ellipsis") ? "…" : (n.textContent ?? "").trim(),
		);

	it("lists every page up to 7 and collapses with ellipses beyond", () => {
		expect(labels(mount(1, 7).el)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
		expect(labels(mount(4, 20).el)).toEqual(["1", "2", "3", "4", "5", "…", "20"]);
		expect(labels(mount(5, 20).el)).toEqual(["1", "…", "3", "4", "5", "6", "7", "…", "20"]);
		expect(labels(mount(16, 20).el)).toEqual(["1", "…", "14", "15", "16", "17", "18", "…", "20"]);
		expect(labels(mount(17, 20).el)).toEqual(["1", "…", "16", "17", "18", "19", "20"]);
	});

	it("marks the current page and disables prev/next at the ends", () => {
		const { el } = mount(1, 3);
		const current = el.querySelector('[aria-current="page"]');
		expect(current?.textContent?.trim()).toBe("1");
		expect(current).toHaveClass("bt-pagination__page--active");
		expect(el.querySelectorAll(".bt-pagination__page--active")).toHaveLength(1);
		expect(el.querySelector<HTMLButtonElement>('[data-action="prev"]')?.disabled).toBe(true);
		expect(el.querySelector<HTMLButtonElement>('[data-action="next"]')?.disabled).toBe(false);

		const last = mount(3, 3).el;
		expect(last.querySelector<HTMLButtonElement>('[data-action="prev"]')?.disabled).toBe(false);
		expect(last.querySelector<HTMLButtonElement>('[data-action="next"]')?.disabled).toBe(true);
	});

	it("moves by page buttons and prev/next, reporting each change once", () => {
		const onPageChange = vi.fn();
		const { el, api } = mount(2, 5, onPageChange);
		el.querySelector<HTMLButtonElement>('[data-page="4"]')?.click();
		expect(api?.getPage()).toBe(4);
		el.querySelector<HTMLButtonElement>('[data-action="next"]')?.click();
		expect(api?.getPage()).toBe(5);
		el.querySelector<HTMLButtonElement>('[data-action="prev"]')?.click();
		expect(api?.getPage()).toBe(4);
		expect(onPageChange.mock.calls.map(([p]) => p)).toEqual([4, 5, 4]);
	});

	it("ignores setPage outside the range or on the current page", () => {
		const onPageChange = vi.fn();
		const { api } = mount(2, 5, onPageChange);
		api?.setPage(0);
		api?.setPage(6);
		api?.setPage(2);
		expect(api?.getPage()).toBe(2);
		expect(onPageChange).not.toHaveBeenCalled();
		api?.setPage(1);
		api?.setPage(5);
		expect(onPageChange.mock.calls.map(([p]) => p)).toEqual([1, 5]);
	});

	it("clamps the page when the total shrinks and accepts a selector", () => {
		const { el, api } = mount(5, 5);
		api?.setTotalPages(3);
		expect(api?.getPage()).toBe(3);
		expect(labels(el)).toEqual(["1", "2", "3"]);
		api?.setTotalPages(10);
		expect(api?.getPage()).toBe(3);

		el.id = "pg";
		expect(Pagination("#pg", { totalPages: 2 })?.getPage()).toBe(1);
		expect(Pagination("#missing")).toBeNull();
	});
});

describe("init", () => {
	it("binds data-bt-* elements once, including modal triggers and pagination attributes", () => {
		document.body.innerHTML = `
			<div class="bt-dropdown" data-bt-dropdown>
				<button type="button" class="bt-dropdown__control"></button>
				<ul class="bt-dropdown__list"><li class="bt-dropdown__option" data-value="a">A</li></ul>
			</div>
			<button id="opener" data-bt-modal-open="m">open</button>
			<div id="m" class="bt-modal" data-bt-modal><div class="bt-modal__panel"><button>x</button></div></div>
			<button class="bt-toggle" data-bt-toggle></button>
			<nav class="bt-pagination" data-bt-pagination data-page="3" data-total-pages="9"></nav>
			<nav id="p2" class="bt-pagination" data-bt-pagination></nav>`;
		init();
		init();

		type Bound = HTMLElement & Record<string, { getPage?: () => number } | undefined>;
		const $el = (sel: string) => document.querySelector(sel) as Bound;
		expect($el("[data-bt-dropdown]")._btDropdown).toBeTruthy();
		expect($el("[data-bt-toggle]")._btToggle).toBeTruthy();
		expect($el("[data-bt-toggle]").getAttribute("role")).toBe("switch");
		expect($el("[data-bt-pagination]")._btPagination?.getPage?.()).toBe(3);
		expect($el("#p2")._btPagination?.getPage?.()).toBe(1);

		const modal = $el("#m");
		const opener = $el("#opener");
		expect(opener.dataset.btBound).toBe("true");
		const open = vi.spyOn(modal._btModal as unknown as { open: () => void }, "open");
		// 두 번 init 해도 리스너는 하나다
		opener.click();
		expect(open).toHaveBeenCalledTimes(1);
		expect(modal.classList.contains("is-open")).toBe(true);
		(modal._btModal as unknown as { destroy: () => void }).destroy();
	});
});
