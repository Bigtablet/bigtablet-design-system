import { afterEach, describe, expect, it, onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";
// 번들 CSS 와 소스 진입점 (bigtablet.modal.browser.test.ts 와 같은 방식).
import "./bigtablet.scss";
import { Toast } from "./bigtablet.js";

const rect = (el: Element) => el.getBoundingClientRect();

describe("Vanilla Toast (Chromium, #910)", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("stacks 360px toasts at the top right, 8px apart, newest first", async () => {
		await page.viewport(1280, 800);
		Toast("첫 번째", "success");
		Toast("두 번째", "error");

		const [newer, older] = Array.from(document.querySelectorAll(".bt-toast"));
		if (!newer || !older) throw new Error("expected two toasts");
		expect(newer.textContent).toContain("두 번째");
		expect(rect(newer).width).toBe(360);
		expect(1280 - rect(newer).right).toBe(16);
		expect(rect(newer).top).toBe(16);
		expect(rect(older).top - rect(newer).bottom).toBe(8);
	});

	it("fills the bottom edge on compact screens", async () => {
		await page.viewport(375, 667);
		Toast("안내", "info");

		const r = rect(document.querySelector(".bt-toast") as Element);
		expect(r.left).toBe(16);
		expect(r.right).toBe(375 - 16);
		expect(667 - r.bottom).toBe(16);
	});

	it("moves to the bottom right with <html data-bt-toast-placement> (#998)", async () => {
		await page.viewport(1280, 800);
		document.documentElement.dataset.btToastPlacement = "bottom-right";
		onTestFinished(() => {
			delete document.documentElement.dataset.btToastPlacement;
		});
		Toast("아래", "success");

		const r = rect(document.querySelector(".bt-toast") as Element);
		expect(1280 - r.right).toBe(16);
		expect(800 - r.bottom).toBe(16);
	});

	it("runs the presence transition out, then removes the toast", async () => {
		// browser-setup.ts 가 레이아웃 실측용으로 transition 을 전부 0s 로 눌러 둔다 - 이 테스트만 푼다
		const noTransition = Array.from(document.querySelectorAll("style")).find((s) =>
			s.textContent?.includes("transition-duration: 0s !important"),
		);
		if (noTransition) noTransition.disabled = true;
		onTestFinished(() => {
			if (noTransition) noTransition.disabled = false;
		});

		const t = Toast("닫힘", "neutral", { duration: Number.POSITIVE_INFINITY });
		const el = document.querySelector(".bt-toast") as HTMLElement;
		// 진입 transition 이 끝난 뒤 닫는다
		await expect.poll(() => el.getAnimations().length).toBe(0);

		t.dismiss();
		expect(el.getAnimations().length).toBeGreaterThan(0);
		expect(el.isConnected).toBe(true);
		await expect.poll(() => el.isConnected).toBe(false);
	});

	it("pauses the timer while hovered and closes once the bar runs out", async () => {
		await page.viewport(1280, 800);
		Toast("타이머", "warning", { duration: 300 });
		const el = document.querySelector(".bt-toast") as HTMLElement;
		const bar = el.querySelector(".bt-toast__progress") as HTMLElement;

		await userEvent.hover(el);
		expect(getComputedStyle(bar).animationPlayState).toBe("paused");
		await new Promise((r) => setTimeout(r, 500));
		expect(el.isConnected).toBe(true);

		await userEvent.unhover(el);
		await expect.poll(() => el.isConnected, { timeout: 2000 }).toBe(false);
	});
});
