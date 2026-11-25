import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vitest";
import { page } from "vitest/browser";
// 번들 CSS 와 소스 진입점. 소스는 ES 모듈이라(#926) named import 로 받는다 - 전역 `Bigtablet`
// 은 빌드된 bigtablet.min.js(IIFE)에만 생긴다.
import "./bigtablet.scss";
import { Modal as createModal } from "./bigtablet.js";

type VanillaModal = {
	open: () => void;
	close: () => void;
	destroy?: () => void;
	isOpen: () => boolean;
};
const Modal = (el: HTMLElement) => createModal(el) as VanillaModal;
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

	// 내용이 늘어도 윗변은 제자리, 아래로만 자란다 (#1157, React 와 같음)
	it("keeps the panel top in place when its content grows (#1157)", async () => {
		await page.viewport(1024, 940);
		const { el, m } = mount(400);
		m.open();
		const before = rect(".bt-modal__panel");
		expect(before.top).toBe(128);

		const alert = document.createElement("div");
		alert.style.height = "62px";
		el.querySelector(".bt-modal__body")?.prepend(alert);
		const after = rect(".bt-modal__panel");
		expect(after.height).toBe(before.height + 62);
		expect(after.top).toBe(before.top);
	});

	it("scrolls a panel taller than the screen inside the overlay", () => {
		const { el, m } = mount(400);
		(el.querySelector(".bt-modal__body") as HTMLElement).style.height = "2000px";
		m.open();
		expect(rect(".bt-modal__panel").top).toBe(90);
		expect(el.scrollHeight).toBeGreaterThan(el.clientHeight);
		el.scrollTop = el.scrollHeight;
		// 끝까지 내리면 패널 아래끝이 화면 안 32px 위에 온다 - 잘려서 못 닿지 않는다
		expect(rect(".bt-modal__panel").bottom).toBe(600 - 32);
	});

	it("opens a server-rendered is-open modal without moving the scrolled page (#919)", () => {
		const content = document.createElement("div");
		content.style.height = "3000px";
		document.body.appendChild(content);
		// 주소 앵커로 내려온 상태 - 초기화가 포커스를 옮기며 페이지를 끌어올리면 안 된다
		window.scrollTo(0, 300);

		const el = document.createElement("div");
		el.className = "bt-modal is-open";
		el.innerHTML = `<div class="bt-modal__panel" style="width: 400px;">
			<div class="bt-modal__header">수정</div>
			<div class="bt-modal__body"><input id="edit-name"></div>
		</div>`;
		document.body.appendChild(el);
		const m = Modal(el);
		opened.push(m);

		expect(m.isOpen()).toBe(true);
		expect(document.activeElement?.id).toBe("edit-name");
		expect(window.scrollY).toBe(300);

		m.close();
		expect(window.scrollY).toBe(300);
	});

	it("plays the exit transition, then hides and unlocks; reopening mid-exit cancels it (#913)", async () => {
		// browser-setup.ts 가 레이아웃 실측용으로 transition 을 전부 0s 로 눌러 둔다 - 이 테스트만 푼다
		const noTransition = Array.from(document.querySelectorAll("style")).find((st) =>
			st.textContent?.includes("transition-duration: 0s !important"),
		);
		if (noTransition) noTransition.disabled = true;
		onTestFinished(() => {
			if (noTransition) noTransition.disabled = false;
		});

		const { el, m } = mount(400);
		const panel = el.querySelector(".bt-modal__panel") as HTMLElement;
		m.open();
		await expect.poll(() => [el, panel].flatMap((x) => x.getAnimations()).length).toBe(0);

		m.close();
		expect(el.classList.contains("is-open")).toBe(true);
		expect([el, panel].flatMap((x) => x.getAnimations()).length).toBeGreaterThan(0);
		expect(document.body.dataset.btOpenModals).toBe("1");

		// 닫히는 중 다시 열면 그대로 열린 채 남는다
		m.open();
		await expect.poll(() => getComputedStyle(el).opacity).toBe("1");
		expect(el.classList.contains("is-open")).toBe(true);

		m.close();
		await expect.poll(() => el.classList.contains("is-open")).toBe(false);
		expect(getComputedStyle(el).display).toBe("none");
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});
});

// 같은 모달 안에서 단계를 바꿀 때 높이가 이어진다 (#1162, React ModalSteps 와 같음)
describe("Vanilla Modal steps (Chromium, #1162)", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("eases the panel height into the taller step, slides it in, then leaves no inline height", async () => {
		await page.viewport(1024, 940);
		const el = document.createElement("div");
		el.className = "bt-modal";
		el.innerHTML = `<div class="bt-modal__panel" style="width: 400px" aria-label="기기 등록">
			<div class="bt-modal__body">
				<section data-bt-modal-step="form"><input aria-label="이름"></section>
				<section data-bt-modal-step="verify"><input aria-label="인증 번호"><div style="height: 160px"></div></section>
			</div>
		</div>`;
		document.body.appendChild(el);
		const m = createModal(el) as VanillaModal & { showStep: (name: string) => void };
		m.open();
		const panel = el.querySelector(".bt-modal__panel") as HTMLElement;
		const before = panel.getBoundingClientRect().height;

		m.showStep("verify");
		const verify = el.querySelector('[data-bt-modal-step="verify"]') as HTMLElement;
		expect(verify.getAnimations().length).toBe(1);
		await new Promise((r) => setTimeout(r, 60));
		const during = panel.getBoundingClientRect().height;
		expect(during).toBeGreaterThan(before);

		await expect.poll(() => panel.getAnimations().length).toBe(0);
		expect(panel.style.height).toBe("");
		expect(panel.getBoundingClientRect().height - before).toBeCloseTo(160, 0);
		m.close();
		m.destroy?.();
	});
});
