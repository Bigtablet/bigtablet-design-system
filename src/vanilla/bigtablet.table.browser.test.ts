import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
// 번들 CSS 만 본다 - Table 은 소비자가 그린 <table> 에 클래스만 붙인다 (#915).
import "./bigtablet.scss";

const mount = (tableClass: string, rows: [string, string, string][], minWidth?: string) => {
	const wrap = document.createElement("div");
	wrap.className = "bt-table-wrap";
	wrap.innerHTML = `<table class="bt-table ${tableClass}"${minWidth ? ` style="--bt-table-min-width: ${minWidth}"` : ""}>
		<colgroup><col style="width: 12rem"><col style="width: 8rem"><col></colgroup>
		<thead><tr><th scope="col">시각</th><th scope="col">사람</th><th scope="col">내용 <span class="bt-sr-only">전체</span></th></tr></thead>
		<tbody>${rows
			.map(
				([t, w, b]) =>
					`<tr><td class="bt-table__truncate" data-label="시각" title="${t}">${t}</td><td class="bt-table__truncate" data-label="사람" title="${w}">${w}</td><td data-label="내용">${b}</td></tr>`,
			)
			.join("")}</tbody></table>`;
	document.body.appendChild(wrap);
	return wrap;
};
const colLefts = (wrap: HTMLElement) =>
	Array.from(wrap.querySelectorAll("th")).map((th) => Math.round(th.getBoundingClientRect().left));

describe("Vanilla Table (Chromium, #915)", () => {
	afterEach(async () => {
		document.body.innerHTML = "";
		await page.viewport(1280, 800);
	});

	it("--fixed keeps columns in place across pages and truncates one-line cells", async () => {
		await page.viewport(1000, 800);
		const short = mount("bt-table--fixed", [["2026-10-28 09:00:00", "박상민", "짧음"]]);
		const before = colLefts(short);
		short.remove();
		const long = mount("bt-table--fixed", [
			["2026-10-28 09:00:01", "아주아주긴이름을가진사람입니다", "x".repeat(200)],
		]);
		expect(colLefts(long)).toEqual(before);
		const who = long.querySelectorAll("td")[1] as HTMLElement;
		expect(getComputedStyle(who).textOverflow).toBe("ellipsis");
		expect(who.scrollWidth).toBeGreaterThan(who.clientWidth);
		expect(long.scrollWidth).toBe(long.clientWidth);
	});

	it("keeps the visually hidden header text inside the scroll box", async () => {
		await page.viewport(375, 667);
		mount("bt-table--fixed", [["2026-10-28 09:00:00", "박상민", "본문"]], "60rem");
		// sr-only 가 상자 밖 기준이면 문서 폭이 넓어진다
		expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth);
	});

	it("--cards stacks labelled cells on compact screens", async () => {
		await page.viewport(375, 667);
		const wrap = mount(
			"bt-table--fixed bt-table--cards",
			[["2026-10-28 09:00:00", "박상민", "본문"]],
			"60rem",
		);
		expect(wrap.scrollWidth).toBe(wrap.clientWidth);
		expect(
			(wrap.querySelector("thead") as HTMLElement).getBoundingClientRect().height,
		).toBeLessThanOrEqual(1);
		const [a, b] = Array.from(wrap.querySelectorAll("td")).map((c) => c.getBoundingClientRect());
		expect(b?.top).toBeGreaterThanOrEqual(a?.bottom ?? 0);
		expect(getComputedStyle(wrap.querySelector("td") as HTMLElement, "::before").content).toBe(
			'"시각"',
		);
	});

	it("vertically centres a small button with the row text", () => {
		const wrap = mount("", [["2026-10-28 09:00:00", "박상민", ""]]);
		const cell = wrap.querySelectorAll("td")[2] as HTMLElement;
		cell.innerHTML =
			'<button type="button" class="bt-button bt-button--sm bt-button--outline">수정</button>';
		const text = (wrap.querySelectorAll("td")[0] as HTMLElement).getBoundingClientRect();
		const btn = (cell.firstElementChild as HTMLElement).getBoundingClientRect();
		const mid = (r: DOMRect) => r.top + r.height / 2;
		expect(Math.abs(mid(btn) - mid(text))).toBeLessThanOrEqual(1);
	});
});
