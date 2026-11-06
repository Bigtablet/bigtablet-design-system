import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { DatePicker as VanillaDatePicker } from "../../../vanilla/bigtablet.js";
import "../../../vanilla/scss/_date-picker.scss";
import { DatePicker } from "./index";
import "./style.scss";
import "../../overlay/popover/style.scss";

const openAt = async (pos: React.CSSProperties) => {
	render(
		<div style={{ position: "fixed", ...pos }}>
			<DatePicker label="날짜" variant="calendar" onValueChange={() => {}} />
		</div>,
	);
	const trigger = document.querySelector(".date_picker_trigger") as HTMLElement;
	fireEvent.click(trigger);
	const panel = await screen.findByRole("dialog");
	return { trigger: trigger.getBoundingClientRect(), panel: panel.getBoundingClientRect() };
};

describe("DatePicker layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("opens the calendar below the field", async () => {
		const { trigger, panel } = await openAt({ top: 40, left: 100, width: 240 });
		expect(panel.top).toBeGreaterThanOrEqual(trigger.bottom);
		expect(panel.bottom).toBeLessThanOrEqual(600 - 8);
	});

	it("opens the calendar upward when the field is at the bottom", async () => {
		const { trigger, panel } = await openAt({ bottom: 8, left: 100, width: 240 });
		expect(panel.bottom).toBeLessThanOrEqual(trigger.top);
	});

	it("keeps the calendar and all seven weekday columns inside a 320px screen", async () => {
		await page.viewport(320, 640);
		const { panel } = await openAt({ top: 40, left: 0, right: 0 });
		expect(panel.left).toBeGreaterThanOrEqual(8);
		expect(panel.right).toBeLessThanOrEqual(312);
		// 패널이 화면 안이어도 안의 달력 표가 넘치면 일요일·토요일이 잘린다
		for (const cell of screen.getAllByRole("columnheader")) {
			const r = cell.getBoundingClientRect();
			expect(r.left).toBeGreaterThanOrEqual(panel.left - 0.5);
			expect(r.right).toBeLessThanOrEqual(panel.right + 0.5);
		}
	});
});

// Vanilla 달력형 DatePicker (#937)
describe("Vanilla calendar DatePicker (Chromium)", () => {
	const mountVanilla = (style: string) => {
		const { container } = render(<span />);
		container.insertAdjacentHTML(
			"beforeend",
			`<div style="position: fixed; ${style}; width: 280px"><div class="bt-date-picker"><span class="bt-date-picker__label">시작</span></div></div>`,
		);
		const root = container.querySelector(".bt-date-picker") as HTMLElement;
		VanillaDatePicker(root, { time: true, today: "2026-10-16" });
		return {
			trigger: root.querySelector(".bt-date-picker__trigger") as HTMLElement,
			panel: () => root.querySelector(".bt-date-picker__panel") as HTMLElement,
		};
	};

	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("draws the trigger at the React calendar trigger height and opens the panel below", async () => {
		const { trigger, panel } = mountVanilla("top: 40px; left: 40px");
		expect(trigger.getBoundingClientRect().height).toBe(40);
		await userEvent.click(trigger);
		const t = trigger.getBoundingClientRect();
		const p = panel().getBoundingClientRect();
		expect(p.top).toBeGreaterThanOrEqual(t.bottom);
		expect(p.bottom).toBeLessThanOrEqual(600);
		// 7칸 × 40px 달력 + 시각 줄이 한 팝오버에 들어간다
		expect(p.width).toBeGreaterThanOrEqual(280);
	});

	it("opens upward near the bottom edge", async () => {
		const { trigger, panel } = mountVanilla("bottom: 20px; left: 40px");
		await userEvent.click(trigger);
		expect(panel().getBoundingClientRect().bottom).toBeLessThanOrEqual(
			trigger.getBoundingClientRect().top,
		);
	});
});
