import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Menu } from "./index";
import "./style.scss";

const items = ["편집", "복제", "이동", "보관", "삭제"].map((label) => ({ key: label, label }));

const openAt = async (pos: React.CSSProperties, align?: "start" | "end") => {
	render(
		<div style={{ position: "fixed", ...pos }}>
			<Menu
				align={align}
				items={items}
				trigger={
					<button type="button" style={{ width: 120 }}>
						더보기
					</button>
				}
			/>
		</div>,
	);
	const trigger = screen.getByRole("button", { name: "더보기" });
	fireEvent.click(trigger);
	const menu = await screen.findByRole("menu");
	return { trigger: trigger.getBoundingClientRect(), menu: menu.getBoundingClientRect() };
};

describe("Menu layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("opens below with its left edge on the trigger by default", async () => {
		const { trigger, menu } = await openAt({ top: 100, left: 200 });
		expect(menu.top).toBeGreaterThanOrEqual(trigger.bottom);
		expect(Math.abs(menu.left - trigger.left)).toBeLessThan(1);
	});

	it("lines up its right edge with the trigger for align=end", async () => {
		const { trigger, menu } = await openAt({ top: 100, left: 400 }, "end");
		expect(Math.abs(menu.right - trigger.right)).toBeLessThan(1);
	});

	it("opens upward at the bottom edge", async () => {
		const { trigger, menu } = await openAt({ bottom: 8, left: 200 });
		expect(menu.bottom).toBeLessThanOrEqual(trigger.top);
		expect(menu.top).toBeGreaterThanOrEqual(8);
	});

	it("shifts inside when a start-aligned trigger hugs the right edge", async () => {
		const { menu } = await openAt({ top: 100, right: 0 });
		expect(menu.right).toBeLessThanOrEqual(800 - 8);
	});

	it("is not clipped by an overflow: hidden ancestor (#586)", async () => {
		render(
			<div style={{ position: "fixed", top: 100, left: 100, height: 40, overflow: "hidden" }}>
				<Menu items={items} trigger={<button type="button">더보기</button>} />
			</div>,
		);
		fireEvent.click(screen.getByRole("button", { name: "더보기" }));
		const menu = (await screen.findByRole("menu")).getBoundingClientRect();
		const last = screen.getByRole("menuitem", { name: "삭제" });
		const r = last.getBoundingClientRect();
		// 맨 아래 항목이 실제로 그 자리에 칠해진다 - 조상이 잘랐으면 다른 요소가 잡힌다
		expect(menu.bottom).toBeGreaterThan(140);
		expect(last.contains(document.elementFromPoint(r.left + 4, r.top + r.height / 2))).toBe(true);
	});
});
