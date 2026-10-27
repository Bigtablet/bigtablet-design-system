import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
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
