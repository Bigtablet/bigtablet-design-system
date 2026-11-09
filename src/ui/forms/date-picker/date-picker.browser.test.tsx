import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { DatePicker as VanillaDatePicker } from "../../../vanilla/bigtablet.js";
import "../../../vanilla/scss/_button.scss";
import "../../../vanilla/scss/_date-picker.scss";
import "../../../vanilla/scss/_dropdown.scss";
import "../../../vanilla/scss/_text-field.scss";
import { Button } from "../../general/button";
import { Dropdown } from "../dropdown";
import { TextField } from "../textfield";
import { DatePicker } from "./index";
import "./style.scss";
import "../../overlay/popover/style.scss";
import "../../general/button/style.scss";
import "../../general/icon-button/style.scss";
import "../dropdown/style.scss";
import "../textfield/style.scss";

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

	// 날짜를 고르기 전에 시 칸을 눌러도 팝오버가 닫히지 않는다 - 예전에는 칸이 막혀 있어 누르면 바깥 클릭으로
	// 판정됐다 (#964)
	it("keeps the panel open when the hour is picked before a date", async () => {
		const { trigger, panel } = mountVanilla("top: 40px; left: 40px");
		await userEvent.click(trigger);
		const hour = panel().querySelector(".bt-date-picker__time select") as HTMLSelectElement;
		expect(hour.disabled).toBe(false);
		await userEvent.click(hour);
		expect(panel().hidden).toBe(false);
		await userEvent.selectOptions(hour, "9");
		await userEvent.click(panel().querySelector('button[data-day="20"]') as HTMLElement);
		expect(trigger.textContent).toContain("09:00");
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

	it("aligns to the trigger's right edge when it would overflow the screen", async () => {
		const { trigger, panel } = mountVanilla("top: 40px; right: 10px");
		await userEvent.click(trigger);
		expect(panel().getBoundingClientRect().right).toBeLessThanOrEqual(800);
		expect(
			Math.abs(panel().getBoundingClientRect().right - trigger.getBoundingClientRect().right),
		).toBeLessThan(1);
	});
});

// 조회 조건 한 줄 - Dropdown · TextField · DatePicker · Button 을 아래 맞춤으로 나란히 두면 라벨 · 칸 윗선 ·
// 높이 · 모서리가 같아야 한다 (#960). Vanilla 는 칸이 패딩으로 높이를 정해 49px · 8px, DatePicker 만 40px ·
// 12px 이었고, React 는 TextField 테두리가 높이 밖에 붙어 42px 이었다
describe("form field row alignment (Chromium)", () => {
	const SIZES = [
		["sm", 40],
		["md", 40],
		["lg", 48],
	] as const;
	const rowStyle = "display:flex;align-items:flex-end;gap:8px;width:1000px";
	const box = (el: Element | null) => {
		if (!el) throw new Error("missing element");
		const r = el.getBoundingClientRect();
		return { top: r.top, height: r.height, radius: getComputedStyle(el).borderRadius };
	};

	beforeEach(async () => {
		await page.viewport(1280, 800);
	});

	// 칸 sm · md 는 높이가 같아(40) Button md 와 짝이다 - Button sm 은 32 로 더 낮다
	it.each(SIZES)("lines up React %s fields and button", (size, height) => {
		const { container } = render(
			<div style={{ display: "flex", alignItems: "flex-end", gap: 8, width: 1000 }}>
				<Dropdown label="직원" size={size} options={[{ value: "a", label: "가" }]} />
				<TextField label="대상 주소" size={size} />
				<DatePicker label="시작" size={size} variant="calendar" onValueChange={() => {}} />
				<Button size={size === "sm" ? "md" : size} style={{ flexShrink: 0 }}>
					조회
				</Button>
			</div>,
		);
		const q = (s: string) => container.querySelector(s);
		const fields = [".dropdown_fieldset", ".text_field_container", ".date_picker_trigger"].map(
			(s) => box(q(s)),
		);
		const labels = [".dropdown_label", ".text_field_label", ".date_picker_label"].map((s) =>
			box(q(s)),
		);
		for (const f of fields) expect(f).toEqual({ ...fields[0], height, radius: "12px" });
		for (const l of labels) expect(l.top).toBe(labels[0]?.top);
		// 같은 높이 단계의 버튼은 칸과 위아래가 같다
		expect(box(q("button.button")).top).toBe(fields[0]?.top);
	});

	it.each(SIZES)("lines up Vanilla %s fields and button", (size, height) => {
		const { container } = render(<span />);
		container.insertAdjacentHTML(
			"beforeend",
			`<div style="${rowStyle}">
				<div class="bt-dropdown"><label class="bt-dropdown__label">직원</label><button type="button" class="bt-dropdown__control bt-dropdown__control--outline bt-dropdown__control--${size}"><span class="bt-dropdown__placeholder">선택</span></button></div>
				<div class="bt-text-field"><label class="bt-text-field__label">대상 주소</label><div class="bt-text-field__wrap"><input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--${size}"></div></div>
				<div class="bt-date-picker" data-size="${size}"><span class="bt-date-picker__label">시작</span></div>
				<button class="bt-button bt-button--${size === "sm" ? "md" : size} bt-button--filled" style="flex-shrink:0">조회</button>
			</div>`,
		);
		VanillaDatePicker(container.querySelector(".bt-date-picker") as HTMLElement);
		const q = (s: string) => container.querySelector(s);
		const fields = [
			".bt-dropdown__control",
			".bt-text-field__input",
			".bt-date-picker__trigger",
		].map((s) => box(q(s)));
		const labels = [".bt-dropdown__label", ".bt-text-field__label", ".bt-date-picker__label"].map(
			(s) => box(q(s)),
		);
		for (const f of fields) expect(f).toEqual({ ...fields[0], height, radius: "12px" });
		for (const l of labels) expect(l).toEqual(labels[0]);
		expect(box(q(".bt-button")).top).toBe(fields[0]?.top);
	});

	it("keeps the Vanilla date selects at the field height", () => {
		const { container } = render(<span />);
		container.insertAdjacentHTML(
			"beforeend",
			`<div class="bt-date-picker"><div class="bt-date-picker__fields"><select class="bt-date-picker__select" aria-label="연도"><option>2026</option></select></div></div>`,
		);
		expect(box(container.querySelector(".bt-date-picker__select"))).toMatchObject({
			height: 40,
			radius: "12px",
		});
	});
});

// 지우기(×)는 칸 오른쪽 안쪽에 세로 가운데로 겹치고, 글자와 겹치지 않는다 (#965)
describe("DatePicker clear button placement (Chromium)", () => {
	const check = (trigger: Element | null, clear: Element | null, text: Element | null) => {
		const t = (trigger as HTMLElement).getBoundingClientRect();
		const c = (clear as HTMLElement).getBoundingClientRect();
		const v = (text as HTMLElement).getBoundingClientRect();
		expect(c.right).toBeLessThanOrEqual(t.right);
		expect(c.left).toBeGreaterThan(t.left);
		expect(Math.abs(c.top + c.height / 2 - (t.top + t.height / 2))).toBeLessThanOrEqual(0.5);
		expect(v.right).toBeLessThanOrEqual(c.left);
	};

	beforeEach(async () => {
		await page.viewport(1280, 800);
	});

	it.each(["md", "lg"] as const)("places the React clear button inside the %s field", (size) => {
		const { container } = render(
			<div style={{ width: 220 }}>
				<DatePicker
					clearable
					size={size}
					variant="calendar"
					value="2026-11-09"
					onValueChange={() => {}}
				/>
			</div>,
		);
		const q = (s: string) => container.querySelector(s);
		check(q(".date_picker_trigger"), q(".date_picker_clear"), q(".date_picker_trigger_value"));
	});

	it.each(["md", "lg"])("places the Vanilla clear button inside the %s field", (size) => {
		const { container } = render(<span />);
		container.insertAdjacentHTML(
			"beforeend",
			`<div style="width:220px"><div class="bt-date-picker" data-size="${size}" data-clearable data-value="2026-11-09"></div></div>`,
		);
		VanillaDatePicker(container.querySelector(".bt-date-picker") as HTMLElement);
		const q = (s: string) => container.querySelector(s);
		check(
			q(".bt-date-picker__trigger"),
			q(".bt-date-picker__clear"),
			q(".bt-date-picker__trigger-value"),
		);
	});
});
