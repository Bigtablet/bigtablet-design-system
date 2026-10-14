import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Tooltip } from "./index";
import "./style.scss";

/** 트리거를 뷰포트의 지정 좌표에 고정해 렌더하고 툴팁을 연다 */
const openAt = async (
	pos: React.CSSProperties,
	placement: "top" | "bottom" | "left" | "right",
	content = "도움말",
) => {
	render(
		<div style={{ position: "fixed", ...pos }}>
			<Tooltip content={content} placement={placement} delay={0}>
				<button type="button">트리거</button>
			</Tooltip>
		</div>,
	);
	const trigger = screen.getByRole("button");
	fireEvent.focus(trigger);
	const tooltip = await screen.findByRole("tooltip");
	// 최초 측정 전에는 visibility: hidden 이다
	await waitFor(() => expect(tooltip.parentElement).toHaveStyle({ visibility: "visible" }));
	return { trigger: trigger.getBoundingClientRect(), tip: tooltip.getBoundingClientRect() };
};

describe("Tooltip layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("sits above the trigger, centred, when there is room", async () => {
		const { trigger, tip } = await openAt({ top: 300, left: 380 }, "top");
		expect(tip.bottom).toBeLessThanOrEqual(trigger.top);
		expect(trigger.top - tip.bottom).toBeLessThan(12);
		expect(Math.abs(tip.left + tip.width / 2 - (trigger.left + trigger.width / 2))).toBeLessThan(1);
	});

	it("flips below when the trigger is at the top edge", async () => {
		const { trigger, tip } = await openAt({ top: 4, left: 380 }, "top");
		expect(tip.top).toBeGreaterThanOrEqual(trigger.bottom);
	});

	it("flips to the left at the right edge", async () => {
		const { trigger, tip } = await openAt({ top: 300, right: 4 }, "right");
		expect(tip.right).toBeLessThanOrEqual(trigger.left);
	});

	it("narrows below its 240px max-width on a tiny viewport", async () => {
		await page.viewport(200, 600);
		const { tip } = await openAt({ top: 300, left: 4 }, "top", "아주 긴 도움말 ".repeat(20));
		expect(tip.left).toBeGreaterThanOrEqual(8);
		expect(tip.right).toBeLessThanOrEqual(192);
	});
});
