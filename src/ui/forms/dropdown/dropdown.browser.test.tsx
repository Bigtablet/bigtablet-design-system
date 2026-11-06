import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Dropdown as VanillaDropdown } from "../../../vanilla/bigtablet.js";
import "../../../vanilla/scss/_dropdown.scss";
import { Dropdown } from "./index";
import "./style.scss";

const options = Array.from({ length: 40 }, (_, i) => ({ value: `v${i}`, label: `옵션 ${i}` }));

const openAt = async (pos: React.CSSProperties) => {
	render(
		<div style={{ position: "fixed", ...pos }}>
			<Dropdown label="항목" options={options} onValueChange={() => {}} />
		</div>,
	);
	const trigger = screen.getByRole("combobox");
	fireEvent.click(trigger);
	const listbox = await screen.findByRole("listbox");
	return { trigger: trigger.getBoundingClientRect(), list: listbox.getBoundingClientRect() };
};

describe("Dropdown layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("lines the list up with the trigger's left edge and width", async () => {
		const { trigger, list } = await openAt({ top: 40, left: 100, width: 240 });
		expect(Math.abs(list.left - trigger.left)).toBeLessThan(1);
		expect(list.width).toBeGreaterThanOrEqual(trigger.width - 1);
	});

	it("shrinks the list to the space it opens into instead of covering the trigger (#621)", async () => {
		// 320px 높이 화면 중간 - 위아래 어느 쪽도 목록 기본 높이가 안 들어간다
		await page.viewport(800, 320);
		const { trigger, list } = await openAt({ top: 140, left: 100, width: 240 });
		expect(list.top >= trigger.bottom || list.bottom <= trigger.top).toBe(true);
		expect(list.top).toBeGreaterThanOrEqual(8);
		expect(list.bottom).toBeLessThanOrEqual(320 - 8);
	});

	it("opens upward near the bottom edge", async () => {
		const { trigger, list } = await openAt({ bottom: 8, left: 100, width: 240 });
		expect(list.bottom).toBeLessThanOrEqual(trigger.top);
		expect(list.top).toBeGreaterThanOrEqual(8);
	});

	it("does not spill past a 375px screen with a full-width trigger", async () => {
		await page.viewport(375, 667);
		const { list } = await openAt({ top: 40, left: 0, right: 0 });
		expect(list.left).toBeGreaterThanOrEqual(0);
		expect(list.right).toBeLessThanOrEqual(375 - 8);
	});
});

// 패널이 열리며 검색칸에 포커스가 간다 - 링이면 열 때마다 패널 안에 상자가 하나 더 생긴다 (#936)
describe("Dropdown focus (Chromium)", () => {
	const DARK = "rgb(18, 18, 18)"; // --bt-color-border-focus (라이트)

	it("draws no ring on the React search input", async () => {
		render(<Dropdown label="항목" options={options} searchable onValueChange={() => {}} />);
		await userEvent.click(screen.getByRole("combobox"));
		await expect.poll(() => document.querySelector(".dropdown_search_input")).not.toBeNull();
		const search = document.querySelector(".dropdown_search_input") as HTMLElement;
		await userEvent.click(search);
		expect(search).toHaveFocus();
		expect(getComputedStyle(search).boxShadow).toBe("none");
	});

	it.each(["outline", "filled"])(
		"shows the open Vanilla %s control with the border colour only and no ring in the search input",
		async (variant) => {
			const { container } = render(<span />);
			container.insertAdjacentHTML(
				"beforeend",
				`<div class="bt-dropdown"><button type="button" class="bt-dropdown__control bt-dropdown__control--${variant} bt-dropdown__control--md"><span class="bt-dropdown__placeholder">선택</span><span class="bt-dropdown__icon">▼</span></button><ul class="bt-dropdown__list"><li class="bt-dropdown__option" data-value="1">하나</li><li class="bt-dropdown__option" data-value="2">둘</li></ul></div>`,
			);
			VanillaDropdown(container.querySelector(".bt-dropdown") as HTMLElement, { searchable: true });
			const control = container.querySelector(".bt-dropdown__control") as HTMLElement;
			await userEvent.click(control);
			const search = document.querySelector(".bt-dropdown__search-input") as HTMLElement;
			await expect.poll(() => document.activeElement).toBe(search);
			expect(getComputedStyle(search).boxShadow).toBe("none");
			expect(getComputedStyle(control).boxShadow).toBe("none");
			expect(getComputedStyle(control).borderColor).toBe(DARK);
		},
	);
});
