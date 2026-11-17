import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
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

	// 열린 첫 렌더는 위치를 재기 전이라 visibility: hidden 이다 - 실제 브라우저는 그 요소에 focus() 를
	// 주지 않아, 위치를 잰 뒤 포커스해야 한다 (#1033). jsdom 은 visibility 를 보지 않아 잡지 못한다.
	it("moves focus to the first item when opened, so arrows and Enter pick an item (#1033)", async () => {
		const onSelect = vi.fn();
		render(
			<Menu
				items={[
					{ key: "edit", label: "편집" },
					{ key: "copy", label: "복제", onSelect },
				]}
				trigger={<button type="button">더보기</button>}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "더보기" }));
		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole("menuitem", { name: "편집" }));

		await userEvent.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "복제" }));
		await userEvent.keyboard("{Enter}");
		expect(onSelect).toHaveBeenCalledOnce();
	});

	// 닫으면 위치 측정(ready)이 처음으로 돌아가야 다음 열림에서도 측정 뒤 포커스한다 - 재오픈도 같은 결과
	it("focuses the first item again when reopened after Escape (#1033)", async () => {
		render(<Menu items={items} trigger={<button type="button">더보기</button>} />);
		const trigger = screen.getByRole("button", { name: "더보기" });
		const first = () => screen.getByRole("menuitem", { name: "편집" });

		await userEvent.click(trigger);
		await expect.poll(() => document.activeElement).toBe(first());
		await userEvent.keyboard("{Escape}");
		await expect.poll(() => screen.queryByRole("menu")).toBeNull();

		await userEvent.click(trigger);
		await expect.poll(() => document.activeElement).toBe(first());
	});
});
