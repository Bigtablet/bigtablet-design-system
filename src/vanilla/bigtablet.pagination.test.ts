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

	it("renders links from the href template and keeps edge prev/next unclickable", () => {
		const onPageChange = vi.fn();
		const el = document.createElement("nav");
		document.body.appendChild(el);
		Pagination(el, { page: 1, totalPages: 3, href: "/logs?from=a&b&page={page}", onPageChange });

		const hrefs = Array.from(el.querySelectorAll<HTMLAnchorElement>("a"), (a) =>
			a.getAttribute("href"),
		);
		expect(hrefs).toEqual([
			"/logs?from=a&b&page=1",
			"/logs?from=a&b&page=2",
			"/logs?from=a&b&page=3",
			"/logs?from=a&b&page=2",
		]);
		expect(el.querySelector('a[aria-current="page"]')?.textContent).toBe("1");
		const prev = el.querySelector<HTMLButtonElement>('[data-action="prev"]');
		expect(prev?.tagName).toBe("BUTTON");
		expect(prev?.disabled).toBe(true);
		expect(el.querySelector('[data-action="next"]')?.tagName).toBe("A");

		Pagination(el, { page: 3, totalPages: 3, href: "?page={page}" });
		expect(el.querySelector('[data-action="prev"]')?.getAttribute("href")).toBe("?page=2");
		expect(el.querySelector<HTMLButtonElement>('[data-action="next"]')?.disabled).toBe(true);
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("substitutes a URL-encoded {page} and ignores non-http(s) templates", () => {
		const el = document.createElement("nav");
		document.body.appendChild(el);
		Pagination(el, { page: 1, totalPages: 2, href: "/logs?from=a&page=%7Bpage%7D" });
		expect(el.querySelector('[data-page="2"]')?.getAttribute("href")).toBe("/logs?from=a&page=2");

		for (const href of ["javascript:alert(1)", "java\tscript:alert(1)", "data:text/html,x"]) {
			Pagination(el, { page: 1, totalPages: 2, href });
			expect(el.querySelector("a")).toBeNull();
			expect(el.querySelector('[data-page="2"]')?.tagName).toBe("BUTTON");
		}
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
			<nav id="p2" class="bt-pagination" data-bt-pagination></nav>
			<nav id="p3" class="bt-pagination" data-bt-pagination data-page="2" data-total-pages="3" data-href="?page={page}"></nav>`;
		init();
		init();

		type Bound = HTMLElement & Record<string, { getPage?: () => number } | undefined>;
		const $el = (sel: string) => document.querySelector(sel) as Bound;
		expect($el("[data-bt-dropdown]")._btDropdown).toBeTruthy();
		expect($el("[data-bt-toggle]")._btToggle).toBeTruthy();
		expect($el("[data-bt-toggle]").getAttribute("role")).toBe("switch");
		expect($el("[data-bt-pagination]")._btPagination?.getPage?.()).toBe(3);
		expect($el("#p2")._btPagination?.getPage?.()).toBe(1);
		expect($el("#p3").querySelector('[data-page="3"]')?.getAttribute("href")).toBe("?page=3");

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

	it("names prev/next in Korean by default and takes prevLabel/nextLabel (#896)", () => {
		const aria = (el: HTMLElement, action: string) =>
			el.querySelector(`[data-action="${action}"]`)?.getAttribute("aria-label");
		const el = document.createElement("nav");
		document.body.appendChild(el);
		Pagination(el, { page: 2, totalPages: 3 });
		expect(aria(el, "prev")).toBe("이전 페이지");
		expect(aria(el, "next")).toBe("다음 페이지");

		const custom = document.createElement("nav");
		document.body.appendChild(custom);
		Pagination(custom, { page: 2, totalPages: 3, prevLabel: "Prev", nextLabel: 'Next "x"' });
		expect(aria(custom, "prev")).toBe("Prev");
		expect(aria(custom, "next")).toBe('Next "x"');

		document.body.innerHTML =
			'<nav data-bt-pagination data-page="2" data-total-pages="3" data-prev-label="앞" data-next-label="뒤"></nav>';
		init();
		const auto = document.querySelector("nav") as HTMLElement;
		expect(aria(auto, "prev")).toBe("앞");
		expect(aria(auto, "next")).toBe("뒤");
	});
});

describe("Pagination - 점검 회귀 (#898)", () => {
	const make = (opts: Record<string, unknown>) => {
		const el = document.createElement("nav");
		document.body.appendChild(el);
		return { el, api: Pagination(el, opts) };
	};

	it("범위 밖 page 를 보정한다", () => {
		expect(make({ page: 12, totalPages: 10 }).api?.getPage()).toBe(10);
		expect(make({ page: -3, totalPages: 10 }).api?.getPage()).toBe(1);
		const { el } = make({ page: 12, totalPages: 10, href: "/l?page={page}" });
		expect(el.querySelector('[data-action="prev"]')?.getAttribute("href")).toBe("/l?page=9");
	});

	it("totalPages · page 가 숫자가 아니면 1 로 본다", () => {
		const { api, el } = make({ page: Number.NaN, totalPages: undefined });
		expect(api?.getPage()).toBe(1);
		expect(el.querySelectorAll("[data-page]")).toHaveLength(1);
		api?.setTotalPages(Number.NaN);
		expect(api?.getPage()).toBe(1);
	});

	it("setTotalPages(0) 이어도 page 는 1 이다", () => {
		const { api } = make({ page: 3, totalPages: 5 });
		api?.setTotalPages(0);
		expect(api?.getPage()).toBe(1);
	});

	it("링크 모드에서는 setPage 도 onPageChange 를 부르지 않는다", () => {
		const onPageChange = vi.fn();
		const { api } = make({ page: 1, totalPages: 5, href: "/l?page={page}", onPageChange });
		api?.setPage(2);
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("다시 그려도 누른 자리에 포커스가 남는다", () => {
		const { el } = make({ page: 2, totalPages: 5 });
		const next = () => el.querySelector('[data-action="next"]') as HTMLButtonElement;
		next().focus();
		next().click();
		expect(document.activeElement).toBe(next());
		(el.querySelector('[data-page="5"]') as HTMLButtonElement).focus();
		(el.querySelector('[data-page="5"]') as HTMLButtonElement).click();
		expect(document.activeElement?.getAttribute("aria-current")).toBe("page");
	});

	it("nav 에 이름을 단다 - 기본 '페이지 이동', 소비자 이름은 그대로", () => {
		expect(make({}).el.getAttribute("aria-label")).toBe("페이지 이동");
		const el = document.createElement("nav");
		el.setAttribute("aria-label", "로그 페이지");
		document.body.appendChild(el);
		Pagination(el, {});
		expect(el.getAttribute("aria-label")).toBe("로그 페이지");
	});
});
