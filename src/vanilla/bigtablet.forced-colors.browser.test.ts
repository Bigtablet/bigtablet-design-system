/// <reference types="@vitest/browser-playwright" />
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";
import "./bigtablet.scss";
import { DatePicker } from "./bigtablet.js";

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

const mount = (html: string) => {
	const host = document.createElement("div");
	host.innerHTML = html;
	document.body.appendChild(host);
	return host;
};

describe("Vanilla in forced-colors mode (Chromium, #1001)", () => {
	beforeEach(async () => {
		await emulateForcedColors("active");
		expect(matchMedia("(forced-colors: active)").matches).toBe(true);
	});
	afterEach(async () => {
		document.body.innerHTML = "";
		await emulateForcedColors("none");
	});

	it("outlines filled · tonal · danger buttons", () => {
		const host = mount(
			'<button class="bt-button bt-button--filled">조회</button>' +
				'<button class="bt-button bt-button--tonal">보기</button>' +
				'<button class="bt-button bt-button--danger">삭제</button>',
		);
		for (const button of host.querySelectorAll("button")) {
			expect(getComputedStyle(button).borderTopStyle).toBe("solid");
		}
	});

	it("outlines the modal and alert panels", () => {
		const host = mount('<div class="bt-modal__panel"></div><div class="bt-alert__modal"></div>');
		for (const panel of host.querySelectorAll("div")) {
			expect(getComputedStyle(panel).borderTopStyle).toBe("solid");
		}
	});

	it("paints the current sidebar item with the system selection colors", () => {
		const host = mount(
			'<nav class="bt-sidebar"><a class="bt-sidebar__item" aria-current="page" href="#">대시보드</a></nav>',
		);
		const item = host.querySelector(".bt-sidebar__item") as Element;
		expect(getComputedStyle(item).backgroundColor).toBe(systemColor("Highlight"));
		expect(getComputedStyle(item).color).toBe(systemColor("HighlightText"));
	});

	it("keeps mask icons visible", () => {
		const host = mount(
			'<div class="bt-inline-alert bt-inline-alert--info"><span class="bt-inline-alert__icon"></span></div>' +
				'<nav class="bt-sidebar"><button class="bt-sidebar__toggle" type="button"></button></nav>',
		);
		const canvas = systemColor("Canvas");
		const icon = host.querySelector(".bt-inline-alert__icon") as Element;
		const toggle = host.querySelector(".bt-sidebar__toggle") as Element;
		expect(getComputedStyle(icon).backgroundColor).not.toBe(canvas);
		expect(getComputedStyle(toggle, "::before").backgroundColor).toBe(systemColor("ButtonText"));
	});

	it("marks the selected day, today and the calendar icons", () => {
		const root = mount(
			'<div class="bt-date-picker"><span class="bt-date-picker__label">날짜</span></div>',
		).firstElementChild as HTMLElement;
		const picker = DatePicker(root, { today: "2026-10-01" }) as { setValue: (v: string) => void };
		picker.setValue("2026-10-20");
		(root.querySelector(".bt-date-picker__trigger") as HTMLButtonElement).click();

		const buttonText = systemColor("ButtonText");
		const icon = root.querySelector(".bt-date-picker__trigger-icon") as Element;
		expect(getComputedStyle(icon).backgroundColor).toBe(buttonText);
		const nav = root.querySelector(".bt-date-picker__nav") as Element;
		expect(getComputedStyle(nav, "::before").backgroundColor).toBe(buttonText);

		const selected = root.querySelector(".bt-date-picker__day--selected") as Element;
		expect(getComputedStyle(selected).backgroundColor).toBe(systemColor("Highlight"));
		const today = root.querySelector(".bt-date-picker__day--today") as Element;
		expect(getComputedStyle(today).outlineStyle).toBe("solid");
	});
});
