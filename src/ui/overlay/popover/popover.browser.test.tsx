import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Popover } from "./index";
import "./style.scss";

const openAt = async (pos: React.CSSProperties, placement: "top" | "bottom" | "left" | "right") => {
	render(
		<div style={{ position: "fixed", ...pos }}>
			<Popover
				aria-label="필터"
				placement={placement}
				trigger={<button type="button">열기</button>}
				content={<div style={{ width: 200, height: 120 }}>내용</div>}
			/>
		</div>,
	);
	const trigger = screen.getByRole("button", { name: "열기" });
	fireEvent.click(trigger);
	const panel = await screen.findByRole("dialog");
	await waitFor(() => expect(panel.parentElement).toHaveStyle({ visibility: "visible" }));
	return { trigger: trigger.getBoundingClientRect(), panel: panel.getBoundingClientRect() };
};

describe("Popover layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("opens below the trigger when there is room", async () => {
		const { trigger, panel } = await openAt({ top: 100, left: 300 }, "bottom");
		expect(panel.top).toBeGreaterThanOrEqual(trigger.bottom);
		expect(panel.bottom).toBeLessThanOrEqual(600 - 8);
		expect(panel.left).toBeGreaterThanOrEqual(8);
	});

	it("flips above when there is no room below", async () => {
		const { trigger, panel } = await openAt({ bottom: 8, left: 300 }, "bottom");
		expect(panel.bottom).toBeLessThanOrEqual(trigger.top);
	});

	it("flips to the left at the right edge and stays in the viewport", async () => {
		const { trigger, panel } = await openAt({ top: 250, right: 8 }, "right");
		expect(panel.right).toBeLessThanOrEqual(trigger.left);
		expect(panel.left).toBeGreaterThanOrEqual(8);
	});

	it("shifts back inside when the trigger hugs the left edge", async () => {
		const { panel } = await openAt({ top: 100, left: 0 }, "bottom");
		expect(panel.left).toBeGreaterThanOrEqual(8);
	});
});
