/// <reference types="@vitest/browser-playwright" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cdp, userEvent } from "vitest/browser";
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
