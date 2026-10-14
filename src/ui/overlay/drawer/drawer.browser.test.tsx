import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Drawer } from "./index";
import "./style.scss";

const panelRect = () =>
	(document.querySelector(".drawer_panel") as HTMLElement).getBoundingClientRect();

describe("Drawer layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("pins a right drawer to the real right edge over the freed scrollbar, without moving the page", async () => {
		const Page = ({ open }: { open: boolean }) => (
			<>
				<div data-testid="content" style={{ height: 3000 }}>
					긴 페이지
				</div>
				<Drawer open={open} onClose={() => {}} title="필터">
					본문
				</Drawer>
			</>
		);
		const { rerender } = render(<Page open={false} />);
		window.scrollTo(0, 300);
		const before = screen.getByTestId("content").getBoundingClientRect();

		rerender(<Page open />);
		await screen.findByRole("dialog");
		const panel = panelRect();
		// 스크롤바 자리까지 패널이 덮는다 - 잠금으로 넓어진 ICB 를 그대로 쓴다(#635)
		expect(Math.abs(panel.right - window.innerWidth)).toBeLessThan(1);
		expect(Math.abs(panel.width - 360)).toBeLessThan(1);
		expect(Math.abs(panel.height - 600)).toBeLessThan(1);
		const during = screen.getByTestId("content").getBoundingClientRect();
		expect(Math.abs(during.width - before.width)).toBeLessThan(1);

		rerender(<Page open={false} />);
		await waitFor(() =>
			expect(document.documentElement).not.toHaveAttribute("data-bt-scroll-locked"),
		);
		expect(window.scrollY).toBe(300);
	});

	it("never grows past a narrow screen", async () => {
		await page.viewport(320, 640);
		render(
			<Drawer open onClose={() => {}} title="필터" size={480}>
				본문
			</Drawer>,
		);
		await screen.findByRole("dialog");
		const panel = panelRect();
		expect(panel.left).toBeGreaterThanOrEqual(0);
		expect(panel.right).toBeLessThanOrEqual(320);
		const close = screen.getByRole("button", { name: /닫기|close/i }).getBoundingClientRect();
		expect(close.right).toBeLessThanOrEqual(320);
	});

	it("spans the full width at the bottom", async () => {
		render(
			<Drawer open onClose={() => {}} title="필터" placement="bottom" size={240}>
				본문
			</Drawer>,
		);
		await screen.findByRole("dialog");
		const panel = panelRect();
		expect(Math.abs(panel.bottom - 600)).toBeLessThan(1);
		expect(panel.left).toBe(0);
		expect(Math.abs(panel.width - window.innerWidth)).toBeLessThan(1);
		expect(Math.abs(panel.height - 240)).toBeLessThan(1);
	});
});
