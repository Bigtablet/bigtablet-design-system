/// <reference types="@vitest/browser-playwright" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { Table, type TableColumn } from "./index";
import "./style.scss";

const rows = [
	{ id: 1, name: "회의 A", owner: "박상민" },
	{ id: 2, name: "회의 B", owner: "김민준" },
];
type Row = (typeof rows)[number];
const columns: TableColumn<Row>[] = [
	{ key: "name", header: "이름" },
	{ key: "owner", header: "담당" },
];

const cellShadows = (row: HTMLElement) =>
	Array.from(row.children).map((c) => getComputedStyle(c).boxShadow);

describe("Table clickable row focus (Chromium)", () => {
	it("draws a 2px focus border around the row on keyboard focus (#802)", async () => {
		render(
			<>
				<button type="button">앞</button>
				<Table columns={columns} data={rows} keyExtractor={(r) => r.id} onRowClick={() => {}} />
			</>,
		);
		await userEvent.click(screen.getByRole("button", { name: "앞" }));
		await userEvent.keyboard("{Tab}");
		const row = document.activeElement as HTMLElement;
		expect(row.tagName).toBe("TR");
		expect(row.matches(":focus-visible")).toBe(true);

		const [first, last] = cellShadows(row);
		// 첫 셀은 왼쪽 변 + 위아래, 마지막 셀은 오른쪽 변 + 위아래
		expect(first).toContain("inset");
		expect(first).toMatch(/2px 0px 0px 0px/);
		expect(last).toMatch(/-2px 0px 0px 0px/);
		for (const shadow of [first, last]) {
			expect(shadow).toMatch(/0px 2px 0px 0px/);
			expect(shadow).toMatch(/0px -2px 0px 0px/);
		}
		// 고대비 모드 폴백 - 평소엔 투명이고 forced-colors 에서 시스템 색으로 칠해진다
		const style = getComputedStyle(row);
		expect(style.outlineStyle).toBe("solid");
		expect(style.outlineWidth).toBe("2px");
		expect(style.outlineColor).toBe("rgba(0, 0, 0, 0)");
	});

	it("shows no border when the row is clicked with the mouse", async () => {
		render(
			<Table columns={columns} data={rows} keyExtractor={(r) => r.id} onRowClick={() => {}} />,
		);
		const row = screen.getByText("회의 A").closest("tr") as HTMLElement;
		await userEvent.click(row);
		expect(row.matches(":focus-visible")).toBe(false);
		for (const shadow of cellShadows(row)) expect(shadow).toBe("none");
	});

	it("flips the border to the dark theme's focus colour", async () => {
		document.documentElement.setAttribute("data-theme", "dark");
		try {
			render(
				<>
					<button type="button">앞</button>
					<Table columns={columns} data={rows} keyExtractor={(r) => r.id} onRowClick={() => {}} />
				</>,
			);
			await userEvent.click(screen.getByRole("button", { name: "앞" }));
			await userEvent.keyboard("{Tab}");
			const [first] = cellShadows(document.activeElement as HTMLElement);
			// `--bt-color-border-focus` 가 다크에서 흰색(neutral 0)이다
			expect(first).toContain("rgb(255, 255, 255)");
		} finally {
			document.documentElement.removeAttribute("data-theme");
		}
	});

	// theme.scss 의 forced-colors 전역 outline 은 offset 을 important 로 덮지 않는다 -
	// 행은 셀 안쪽(-2px)에 그리는 자기 offset 을 유지해야 이웃 행과 겹치지 않는다.
	it("keeps the row's inset outline offset in forced-colors mode", async () => {
		const setForcedColors = (value: "active" | "none") =>
			cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value }] });
		await setForcedColors("active");
		try {
			render(
				<>
					<button type="button">앞</button>
					<Table columns={columns} data={rows} keyExtractor={(r) => r.id} onRowClick={() => {}} />
				</>,
			);
			await userEvent.click(screen.getByRole("button", { name: "앞" }));
			await userEvent.keyboard("{Tab}");
			const style = getComputedStyle(document.activeElement as HTMLElement);
			expect(style.outlineStyle).toBe("solid");
			expect(style.outlineWidth).toBe("2px");
			expect(style.outlineOffset).toBe("-2px");
		} finally {
			await setForcedColors("none");
		}
	});
});

describe("Table fixed layout · cards (Chromium, #915)", () => {
	type Log = { id: number; time: string; who: string; body: string };
	const logCols: TableColumn<Log>[] = [
		{ key: "time", header: "시각", width: "12rem", truncate: true },
		{ key: "who", header: "사람", width: "8rem", truncate: true },
		{ key: "body", header: "내용" },
	];
	const page1: Log[] = [{ id: 1, time: "2026-10-28 09:00:00", who: "박상민", body: "짧음" }];
	const page2: Log[] = [
		{
			id: 2,
			time: "2026-10-28 09:00:01",
			who: "아주아주긴이름을가진사람입니다",
			body: "x".repeat(200),
		},
	];
	const colLefts = (container: HTMLElement) =>
		Array.from(container.querySelectorAll("th")).map((th) =>
			Math.round(th.getBoundingClientRect().left),
		);

	it("keeps column positions across pages with different content", async () => {
		const { container, rerender } = render(
			<div style={{ width: 900 }}>
				<Table columns={logCols} data={page1} keyExtractor={(r) => r.id} layout="fixed" />
			</div>,
		);
		const before = colLefts(container);
		rerender(
			<div style={{ width: 900 }}>
				<Table columns={logCols} data={page2} keyExtractor={(r) => r.id} layout="fixed" />
			</div>,
		);
		expect(colLefts(container)).toEqual(before);
		// 긴 이름은 잘리고(말줄임) 긴 본문은 칸 안에서 끊겨 표가 넘치지 않는다
		const who = screen.getByText("아주아주긴이름을가진사람입니다");
		expect(getComputedStyle(who).textOverflow).toBe("ellipsis");
		expect(who.scrollWidth).toBeGreaterThan(who.clientWidth);
		const wrapper = container.querySelector(".table_wrapper") as HTMLElement;
		expect(wrapper.scrollWidth).toBe(wrapper.clientWidth);
	});

	it("holds minWidth and scrolls the wrapper instead of squashing", () => {
		const { container } = render(
			<div style={{ width: 320 }}>
				<Table
					columns={logCols}
					data={page1}
					keyExtractor={(r) => r.id}
					layout="fixed"
					minWidth="40rem"
				/>
			</div>,
		);
		const table = container.querySelector("table") as HTMLElement;
		expect(table.getBoundingClientRect().width).toBe(640);
		const wrapper = container.querySelector(".table_wrapper") as HTMLElement;
		expect(wrapper.scrollWidth).toBeGreaterThan(wrapper.clientWidth);
	});

	it("applies minWidth in the default auto layout too", () => {
		const { container } = render(
			<div style={{ width: 320 }}>
				<Table columns={logCols} data={page1} keyExtractor={(r) => r.id} minWidth="40rem" />
			</div>,
		);
		expect((container.querySelector("table") as HTMLElement).getBoundingClientRect().width).toBe(
			640,
		);
	});

	it("keeps sort buttons and select-all visible and clickable on cards", async () => {
		await page.viewport(375, 667);
		const sortable = logCols.map((c) => (c.key === "time" ? { ...c, sortable: true } : c));
		const onSortChange = vi.fn();
		const { container } = render(
			<Table
				columns={sortable}
				data={page1}
				keyExtractor={(r) => r.id}
				cards
				onSortChange={onSortChange}
				selectable
				rowKey={(r) => String(r.id)}
			/>,
		);
		const sortButton = screen.getByRole("button", { name: /시각/ });
		// Checkbox 는 native input 을 화면에서 숨기고 상자를 따로 그린다 - 그 칸을 잰다
		const selectAll = screen
			.getByRole("checkbox", { name: "전체 선택" })
			.closest("th") as HTMLElement;
		for (const el of [sortButton, selectAll]) {
			const r = el.getBoundingClientRect();
			expect(r.width).toBeGreaterThan(8);
			expect(r.height).toBeGreaterThan(8);
		}
		// 조작할 것이 없는 머리 칸(사람 · 내용)은 여전히 화면 읽기용
		const plainTh = Array.from(container.querySelectorAll("th")).find(
			(th) => th.textContent === "사람",
		) as HTMLElement;
		// 열 width 인라인 스타일이 1px 를 이겨 폭은 남지만, absolute + clip 이라 보이지도 자리를 차지하지도 않는다
		expect(getComputedStyle(plainTh).position).toBe("absolute");
		expect(getComputedStyle(plainTh).clipPath).toContain("inset(50%)");
		await userEvent.click(sortButton);
		expect(onSortChange).toHaveBeenCalledWith({ key: "time", direction: "asc" });
		await page.viewport(1280, 800);
	});

	it("stacks rows as labelled cards on compact screens and hides the head visually", async () => {
		await page.viewport(375, 667);
		const { container } = render(
			<Table
				columns={logCols}
				data={page2}
				keyExtractor={(r) => r.id}
				layout="fixed"
				minWidth="60rem"
				cards
			/>,
		);
		const wrapper = container.querySelector(".table_wrapper") as HTMLElement;
		// 카드에서는 minWidth 를 풀어 가로로 넘치지 않는다
		expect(wrapper.scrollWidth).toBe(wrapper.clientWidth);
		const thead = container.querySelector("thead") as HTMLElement;
		expect(thead.getBoundingClientRect().height).toBeLessThanOrEqual(1);
		const cells = Array.from(container.querySelectorAll("tbody td")) as HTMLElement[];
		// 칸이 세로로 쌓이고 한 줄을 다 쓴다
		const [a, b] = cells.map((c) => c.getBoundingClientRect());
		expect(b?.top).toBeGreaterThanOrEqual(a?.bottom ?? 0);
		expect(Math.round(a?.width ?? 0)).toBe(Math.round(b?.width ?? 0));
		expect(getComputedStyle(cells[0] as HTMLElement, "::before").content).toBe('"시각"');
		await page.viewport(1280, 800);
	});
});
