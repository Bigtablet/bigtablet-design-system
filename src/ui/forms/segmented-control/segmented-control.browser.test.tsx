import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SegmentedControl } from "./index";
import "./style.scss";

const items = [
	{ value: "USD", label: "USD" },
	{ value: "KRW", label: "KRW" },
	{ value: "JPY", label: "JPY", disabled: true },
];

describe("SegmentedControl (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("moves and selects with the arrow keys natively, skipping disabled items", async () => {
		render(
			<>
				<button type="button">앞</button>
				<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />
			</>,
		);
		await userEvent.click(screen.getByRole("button", { name: "앞" }));
		await userEvent.keyboard("{Tab}");
		expect(screen.getByRole("radio", { name: "USD" })).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "KRW" })).toBeChecked();
		// 다음 칸 JPY 는 비활성이라 처음으로 돌아간다
		await userEvent.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "USD" })).toBeChecked();
	});

	it("draws the focus ring on the item for keyboard focus only", async () => {
		render(
			<>
				<button type="button">앞</button>
				<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />
			</>,
		);
		const usd = screen.getByRole("radio", { name: "USD" }).closest("label") as HTMLElement;
		const krw = screen.getByRole("radio", { name: "KRW" }).closest("label") as HTMLElement;
		await userEvent.click(krw);
		// box-shadow 전환(200ms)이 끝난 값을 본다
		await expect.poll(() => getComputedStyle(krw).boxShadow).not.toMatch(/0\.\d+px/);
		expect(getComputedStyle(krw).boxShadow).not.toMatch(/0px 0px 0px 3px/);

		await userEvent.click(screen.getByRole("button", { name: "앞" }));
		await userEvent.keyboard("{Tab}");
		// 선택된 칸(KRW)으로 들어온다 - 그림자(elevation) 위에 포커스 링이 겹친다
		await expect.poll(() => getComputedStyle(krw).boxShadow).toMatch(/0px 0px 0px 3px/);
		expect(getComputedStyle(usd).boxShadow).toBe("none");
	});

	it("grows to a touch-sized target on a compact screen", async () => {
		render(<SegmentedControl aria-label="통화" items={items} size="sm" />);
		const item = () => screen.getByRole("radio", { name: "USD" }).closest("label") as HTMLElement;
		expect(item().getBoundingClientRect().height).toBe(32);
		await page.viewport(375, 667);
		expect(item().getBoundingClientRect().height).toBe(40);
	});

	it("splits the width evenly with fullWidth", () => {
		render(
			<div style={{ width: 300 }}>
				<SegmentedControl aria-label="통화" items={items} fullWidth />
			</div>,
		);
		const widths = screen
			.getAllByRole("radio")
			.map((r) => (r.closest("label") as HTMLElement).getBoundingClientRect().width);
		expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
	});
});
