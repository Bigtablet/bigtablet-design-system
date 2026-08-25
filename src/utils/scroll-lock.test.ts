import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lockBodyScroll, unlockBodyScroll } from "./scroll-lock";

/**
 * jsdom 은 레이아웃을 하지 않아 fixed 프로브의 `getBoundingClientRect().width` 가 0 이다.
 * 스크롤바나 예약된 거터가 있는 상황을 만들려면 프로브가 재는 ICB 폭을 직접 세워야 한다.
 *
 * 이 스텁이 `clientWidth` 가 아니라 프로브를 세우는 것이 핵심이다 - `scrollbar-gutter: stable`
 * 에서는 `clientWidth` 가 거터를 포함해 보고하므로(Chromium 실측) 거기서는 잴 수 없다.
 */
const setViewportInset = (inset: number) => {
	Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true, writable: true });
	vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
		width: 1280 - inset,
		height: 0,
		top: 0,
		left: 0,
		right: 1280 - inset,
		bottom: 0,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect);
};

describe("scroll-lock", () => {
	beforeEach(() => {
		document.body.style.cssText = "";
		document.documentElement.style.cssText = "";
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("locks overflow and counts one open overlay", () => {
		setViewportInset(0);
		lockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("compensates the scrollbar width and releases the stable gutter", () => {
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);

		lockBodyScroll();

		// 거터를 놓아 fixed 오버레이의 컨테이닝 블록을 전폭으로 만든다.
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		// 놓은 폭은 body padding 이 대신 잡아 콘텐츠가 안 움직인다.
		expect(document.body.style.paddingRight).toBe("15px");
		// 앱의 `right: 0` 고정 요소가 쓸 수 있도록 폭을 노출한다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
	});

	it("measures the gutter from the ICB, not from clientWidth", () => {
		// `scrollbar-gutter: stable` 의 정의가 이 상황이다 - 거터 15px 이 예약돼 있는데
		// clientWidth 는 innerWidth 와 같게 보고한다(Chromium 실측).
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);
		vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1280);

		// 옛 측정식은 이 상황에서 0 을 낸다 - 그래서 보정이 한 번도 걸리지 않았다.
		// 이 단정이 위 clientWidth 스텁을 의미 있게 만든다.
		expect(window.innerWidth - document.documentElement.clientWidth).toBe(0);

		lockBodyScroll();

		// 그런데도 거터를 놓고 그 폭을 보정한다 - 측정이 clientWidth 와 무관하다는 뜻이다.
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.style.paddingRight).toBe("15px");
	});

	it("skips compensation when the environment does not lay out", () => {
		// jsdom 처럼 레이아웃이 없으면 프로브 폭이 0 이다. innerWidth 를 그대로 쓰면
		// body 에 뷰포트 폭(1280px)만큼 padding 이 붙는다.
		Object.defineProperty(window, "innerWidth", {
			value: 1280,
			configurable: true,
			writable: true,
		});

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("");
	});

	it("adds to the consumer's existing body padding instead of replacing it", () => {
		document.body.style.paddingRight = "20px";
		setViewportInset(15);

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("35px");
	});

	it("skips compensation when there is no scrollbar to hide", () => {
		setViewportInset(0);

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
	});

	it("restores every touched property on the last unlock", () => {
		document.documentElement.style.scrollbarGutter = "stable";
		document.body.style.paddingRight = "20px";
		setViewportInset(15);

		lockBodyScroll();
		unlockBodyScroll();

		expect(document.body.style.overflow).toBe("");
		expect(document.body.style.paddingRight).toBe("20px");
		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
		expect(document.body.dataset.openModals).toBeUndefined();
	});

	it("keeps the lock while a nested overlay is still open", () => {
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);

		lockBodyScroll(); // Modal
		lockBodyScroll(); // Modal 위 Alert
		unlockBodyScroll(); // Alert 만 닫힘

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.style.paddingRight).toBe("15px");
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.dataset.openModals).toBe("1");

		unlockBodyScroll(); // 마지막까지 닫힘

		expect(document.body.style.overflow).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
	});

	it("measures only once so a nested lock cannot double the padding", () => {
		setViewportInset(15);

		lockBodyScroll();
		// 첫 잠금 뒤에는 스크롤바가 사라져 실제 브라우저에서도 0 이 잰다.
		setViewportInset(0);
		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("15px");
	});

	it("does not drive the counter negative on a repeated unlock", () => {
		setViewportInset(0);
		lockBodyScroll();
		unlockBodyScroll();
		unlockBodyScroll();

		expect(document.body.dataset.openModals).toBeUndefined();
		expect(document.body.style.overflow).toBe("");
	});

	it("restores an inline --bt-scrollbar-width the consumer had set", () => {
		// 소비자가 이 변수를 직접 잡아둔 경우 - 오버레이 한 번 열고 닫았다고 지워지면 안 된다.
		document.documentElement.style.setProperty("--bt-scrollbar-width", "10px");
		setViewportInset(15);

		lockBodyScroll();
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		unlockBodyScroll();
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("10px");
	});

	it("restores an inline overflow the consumer had set", () => {
		document.body.style.overflow = "auto";
		setViewportInset(0);

		lockBodyScroll();
		expect(document.body.style.overflow).toBe("hidden");

		unlockBodyScroll();
		expect(document.body.style.overflow).toBe("auto");
	});
});
