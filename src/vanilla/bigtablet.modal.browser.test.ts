import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
// 소비자가 받는 그대로 - 번들 CSS 와 `<script>` 전역. 브라우저 ESM 에서는 UMD 의 `this` 가
// undefined 라 `self.Bigtablet` 에 붙는다(unit 의 named import 는 Vite 의 CJS 변환 덕분이다).
import "./bigtablet.scss";
import "./bigtablet.js";

type VanillaModal = { open: () => void; close: () => void; destroy?: () => void };
const { Modal } = (window as unknown as { Bigtablet: { Modal: (el: Element) => VanillaModal } })
	.Bigtablet;
let opened: VanillaModal[] = [];

const mount = (width = 480) => {
	const el = document.createElement("div");
	el.className = "bt-modal";
	el.innerHTML = `<div class="bt-modal__panel" style="width: ${width}px;">
		<button class="bt-modal__close" data-modal-close aria-label="닫기">×</button>
		<div class="bt-modal__header">제목</div>
		<div class="bt-modal__body">본문</div>
	</div>`;
	document.body.appendChild(el);
	const m = Modal(el);
	opened.push(m);
	return { el, m };
};

const rect = (sel: string) => (document.querySelector(sel) as HTMLElement).getBoundingClientRect();

describe("Vanilla Modal layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});
	afterEach(() => {
		for (const m of opened) {
			m.close();
			m.destroy?.();
		}
		opened = [];
		document.body.innerHTML = "";
		window.scrollTo(0, 0);
	});

	it("keeps a 480px panel and its close button inside a 375px screen", async () => {
		await page.viewport(375, 667);
		mount(480).m.open();
		const panel = rect(".bt-modal__panel");
		const close = rect(".bt-modal__close");
		expect(panel.left).toBeGreaterThanOrEqual(0);
		expect(panel.right).toBeLessThanOrEqual(375);
		expect(close.right).toBeLessThanOrEqual(panel.right);
	});

	it("locks without moving the page, covers the scrollbar strip and keeps the panel centred", () => {
		const content = document.createElement("div");
		content.style.height = "3000px";
		document.body.appendChild(content);
		window.scrollTo(0, 300);
		const before = content.getBoundingClientRect();
		const layoutWidth = document.documentElement.clientWidth;

		const { el, m } = mount(400);
		m.open();

		const during = content.getBoundingClientRect();
		expect(Math.abs(during.width - before.width)).toBeLessThan(1);
		expect(el.contains(document.elementFromPoint(window.innerWidth - 1, 300))).toBe(true);
		const panel = rect(".bt-modal__panel");
		expect(Math.abs(panel.left + panel.width / 2 - layoutWidth / 2)).toBeLessThan(1);

		m.close();
		expect(window.scrollY).toBe(300);
		expect(document.body.style.paddingRight).toBe("");
	});
});
