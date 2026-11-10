/// <reference types="@vitest/browser-playwright" />
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";
import { DateCalendar } from "./index";

const emulateForcedColors = (value: "active" | "none") =>
	cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value }] });

/** 시스템 색의 실제 rgb - 고대비 팔레트마다 다르므로 같은 페이지에서 잰다 */
const systemColor = (name: string) => {
	const probe = document.createElement("span");
	probe.style.cssText = `forced-color-adjust: none; color: ${name}`;
	document.body.appendChild(probe);
	const value = getComputedStyle(probe).color;
	probe.remove();
	return value;
};

describe("DateCalendar in forced-colors mode (Chromium, #1001)", () => {
	afterEach(() => emulateForcedColors("none"));

	// 고른 날은 배경, 오늘은 그림자 테두리로만 표시한다 - 고대비는 둘 다 지운다
	it("marks the selected day with Highlight and today with an outline", async () => {
		await emulateForcedColors("active");
		render(<DateCalendar value="2026-10-16" today="2026-10-01" />);

		const selected = document.querySelector(".date_calendar_day_selected") as Element;
		expect(selected.textContent).toContain("16");
		expect(getComputedStyle(selected).backgroundColor).toBe(systemColor("Highlight"));
		expect(getComputedStyle(selected).color).toBe(systemColor("HighlightText"));
		expect(
			getComputedStyle(document.querySelector(".date_calendar_day_today") as Element).outlineStyle,
		).toBe("solid");
	});
});
