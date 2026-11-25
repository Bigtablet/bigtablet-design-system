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

	// 위 배치는 column-reverse 라 최신(DOM 끝)이 맨 위 모서리 쪽이다 (#1154)
	it("stacks 360px toasts at the top right, 8px apart, newest on top", async () => {
		await page.viewport(1280, 800);
		document.documentElement.dataset.btToastPlacement = "top-right";
		onTestFinished(() => {
			delete document.documentElement.dataset.btToastPlacement;
		});
		Toast("첫 번째", "success");
		Toast("두 번째", "error");

		const [older, newer] = Array.from(document.querySelectorAll(".bt-toast"));
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

	// 기본은 아래 (#1073) - 위로 올리는 건 data-bt-toast-placement="top-right"
	it("sits at the bottom right by default", async () => {
		await page.viewport(1280, 800);
		Toast("아래", "success");

		const r = rect(document.querySelector(".bt-toast") as Element);
		expect(1280 - r.right).toBe(16);
		expect(800 - r.bottom).toBe(16);
	});

	it("scrolls inside the list instead of pushing the newest toast off screen (#1000)", async () => {
		await page.viewport(1280, 400);
		document.documentElement.dataset.btToastPlacement = "bottom-right";
		onTestFinished(() => {
			delete document.documentElement.dataset.btToastPlacement;
		});
		const long = "여러 줄로 넘어가는 긴 안내 문구입니다. ".repeat(4);
		for (let i = 0; i < 5; i++)
			Toast(`${i} ${long}`, "info", { duration: Number.POSITIVE_INFINITY });

		const region = document.querySelector(".bt-toast-container") as HTMLElement;
		const toasts = Array.from(region.querySelectorAll(".bt-toast"));
		expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
		// 최신(DOM 끝 - 맨 아래 모서리 쪽, #1154)이 화면 안에 있고, 줄어들지 않았다
		const newest = toasts.at(-1) as Element;
		expect(rect(newest).top).toBeGreaterThanOrEqual(16);
		expect(rect(newest).bottom).toBeLessThanOrEqual(400 - 16);
		// 상자는 그림자 · 슬라이드용 안쪽 여백(20px)만큼 크다 - 내용 아래끝이 여백 16px 에 남는다
		expect(rect(region).bottom - 20).toBe(400 - 16);
		for (const el of toasts) expect(rect(el).width).toBe(360);
		expect(rect(toasts[0] as Element).height).toBe(rect(toasts[1] as Element).height);
	});

	// 저장을 연달아 누른 재현 (#1154) - 예전에는 새 토스트가 위에 붙고 모서리 쪽이 빠져 묶음이 출렁였다
	it("adds the newest at the corner and drops the far end without moving the rest (#1154)", async () => {
		await page.viewport(1280, 800);
		const inf = { duration: Number.POSITIVE_INFINITY };
		for (let i = 1; i <= 5; i++) Toast(`저장 ${i}`, "success", inf);
		const tops = () =>
			Array.from(
				document.querySelectorAll<HTMLElement>('.bt-toast:not([data-state="closed"])'),
				(el) => [el.textContent, rect(el).top],
			);
		const before = tops();

		Toast("저장 6", "success", inf);
		await expect.poll(() => document.querySelectorAll(".bt-toast").length).toBe(5);
		// 남은 넷은 정확히 한 칸씩 위로, 새것은 모서리(맨 아래) 자리 - 내려앉는 두 번째 움직임이 없다
		expect(tops()).toEqual([
			["저장 2", before[0]?.[1]],
			["저장 3", before[1]?.[1]],
			["저장 4", before[2]?.[1]],
			["저장 5", before[3]?.[1]],
			["저장 6", before[4]?.[1]],
		]);
		expect(800 - rect(document.querySelector(".bt-toast:last-child") as Element).bottom).toBe(16);
	});

	it("collapses the slot while closing so the neighbours glide instead of jumping (#1154)", async () => {
		await page.viewport(1280, 800);
		// browser-setup.ts 가 transition 을 전부 0s 로 눌러 둔다 - 이 테스트만 푼다
		const noTransition = Array.from(document.querySelectorAll("style")).find((s) =>
			s.textContent?.includes("transition-duration: 0s !important"),
		);
		if (noTransition) noTransition.disabled = true;
		onTestFinished(() => {
			if (noTransition) noTransition.disabled = false;
		});

		const inf = { duration: Number.POSITIVE_INFINITY };
		Toast("위", "info", inf);
		const middle = Toast("가운데", "info", inf);
		Toast("아래", "info", inf);
		const [top, mid] = Array.from(document.querySelectorAll<HTMLElement>(".bt-toast"));
		if (!top || !mid) throw new Error("expected toasts");
		await expect.poll(() => top.getAnimations().length).toBe(0);
		const start = rect(top).top;
		const slot = rect(mid).height + 8;

		middle.dismiss();
		await new Promise((r) => setTimeout(r, 120));
		// 접히는 중 - 위 토스트가 한 칸 사이 어딘가에 있다 (한 번에 뛰지 않았다)
		// 높이 자체가 줄고 있다 - 여백만 접히고 상자는 그대로인 채 끝에 한 번에 빠지지 않는다
		expect(rect(mid).height).toBeLessThan(slot - 8);
		expect(rect(mid).height).toBeGreaterThan(0);
		const during = rect(top).top - start;
		expect(during).toBeGreaterThan(0);
		expect(during).toBeLessThan(slot);
		await expect.poll(() => mid.isConnected).toBe(false);
		expect(rect(top).top - start).toBeCloseTo(slot, 0);
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
		// 300ms 였을 때 CI 에서 hover 가 닿기 전에 막대가 다 줄어 토스트가 먼저 닫혔다 - 넉넉히 두고,
		// 멈춘 동안 그 시간을 넘겨 기다려 "멈춤" 을 확인한다
		Toast("타이머", "warning", { duration: 1000 });
		const el = document.querySelector(".bt-toast") as HTMLElement;
		const bar = el.querySelector(".bt-toast__progress") as HTMLElement;

		await userEvent.hover(el);
		expect(getComputedStyle(bar).animationPlayState).toBe("paused");
		await new Promise((r) => setTimeout(r, 1200));
		expect(el.isConnected).toBe(true);

		await userEvent.unhover(el);
		await expect.poll(() => el.isConnected, { timeout: 3000 }).toBe(false);
	});
});
