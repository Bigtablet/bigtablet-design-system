import { describe, expect, it } from "vitest";
// 소비자가 받는 그대로 - 번들 CSS 와 `<script>` 전역 (bigtablet.modal.browser.test.ts 와 같은 방식).
// jsdom 에는 Web Animations 가 없어, 퇴출 애니메이션이 실제로 돌고 끝나면 걷히는지는 여기서만 본다.
import "./bigtablet.scss";
import "./bigtablet.js";

type AlertFn = (config: { title?: string; message: string }) => { close: () => void };
const { Alert } = (window as unknown as { Bigtablet: { Alert: AlertFn } }).Bigtablet;

describe("Vanilla Alert exit motion (Chromium, #909)", () => {
	it("plays the exit animation, then removes the overlay and unlocks scroll", async () => {
		Alert({ title: "제목", message: "내용" });
		const overlay = document.querySelector(".bt-alert__overlay") as HTMLElement;
		const panel = overlay.querySelector(".bt-alert__modal") as HTMLElement;

		(overlay.querySelector("[data-alert-confirm]") as HTMLElement).click();

		// 바로 걷지 않고 퇴출 keyframes 가 오버레이·패널 양쪽에서 돈다
		expect(overlay.isConnected).toBe(true);
		const names = [overlay, panel].flatMap((el) =>
			el.getAnimations().map((a) => (a as CSSAnimation).animationName),
		);
		expect(names).toEqual(["bt-alert-fade-out", "bt-alert-slide-down"]);
		expect(document.body.dataset.btOpenModals).toBe("1");

		await expect.poll(() => overlay.isConnected).toBe(false);
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});
});
