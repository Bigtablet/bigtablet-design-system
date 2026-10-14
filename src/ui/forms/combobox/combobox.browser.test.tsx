import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Combobox } from "./index";
import "./style.scss";

const options = Array.from({ length: 40 }, (_, i) => ({ value: `${i}`, label: `사람 ${i}` }));

const openAt = async (pos: React.CSSProperties) => {
	render(
		<div style={{ position: "fixed", width: 260, ...pos }}>
			<Combobox
				ariaLabel="담당자"
				fullWidth
				onSearch={async () => options}
				defaultOptions={options}
			/>
		</div>,
	);
	fireEvent.focus(screen.getByRole("combobox"));
	const list = await screen.findByRole("listbox");
	// 앵커는 입력 칸이 아니라 컴포넌트 루트다 - 입력은 컨트롤 패딩만큼 안쪽에 있다
	const control = document.querySelector(".combobox") as HTMLElement;
	return { input: control.getBoundingClientRect(), list: list.getBoundingClientRect() };
};

describe("Combobox layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("lines the list up under the input", async () => {
		const { input, list } = await openAt({ top: 40, left: 100 });
		expect(list.top).toBeGreaterThanOrEqual(input.bottom);
		// listbox 는 1px 테두리 패널 안쪽이다
		expect(Math.abs(list.left - input.left)).toBeLessThanOrEqual(1);
	});

	it("opens upward near the bottom edge and stays on screen", async () => {
		const { input, list } = await openAt({ bottom: 8, left: 100 });
		expect(list.bottom).toBeLessThanOrEqual(input.top);
		expect(list.top).toBeGreaterThanOrEqual(8);
	});

	it("shrinks to the space it opens into instead of covering the input (#621)", async () => {
		await page.viewport(800, 320);
		const { input, list } = await openAt({ top: 140, left: 100 });
		expect(list.top >= input.bottom || list.bottom <= input.top).toBe(true);
		expect(list.top).toBeGreaterThanOrEqual(8);
		expect(list.bottom).toBeLessThanOrEqual(320 - 8);
	});
});
