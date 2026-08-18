import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lockBodyScroll, unlockBodyScroll } from "./scroll-lock";

/**
 * jsdom 은 레이아웃을 하지 않아 `innerWidth - documentElement.clientWidth` 가 항상 0 이다.
 * 스크롤바가 있는 상황을 만들려면 그 두 값을 직접 세워야 한다.
 */
const setScrollbarWidth = (width: number) => {
	Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true, writable: true });
	vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1280 - width);
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
		setScrollbarWidth(0);
		lockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("compensates the scrollbar width and releases the stable gutter", () => {
		document.documentElement.style.scrollbarGutter = "stable";
		setScrollbarWidth(15);

		lockBodyScroll();

		// 거터를 놓아 fixed 오버레이의 컨테이닝 블록을 전폭으로 만든다.
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		// 놓은 폭은 body padding 이 대신 잡아 콘텐츠가 안 움직인다.
		expect(document.body.style.paddingRight).toBe("15px");
		// 앱의 `right: 0` 고정 요소가 쓸 수 있도록 폭을 노출한다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
	});

	it("adds to the consumer's existing body padding instead of replacing it", () => {
		document.body.style.paddingRight = "20px";
		setScrollbarWidth(15);

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("35px");
	});

	it("skips compensation when there is no scrollbar to hide", () => {
		setScrollbarWidth(0);

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
	});

	it("restores every touched property on the last unlock", () => {
		document.documentElement.style.scrollbarGutter = "stable";
		document.body.style.paddingRight = "20px";
		setScrollbarWidth(15);

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
		setScrollbarWidth(15);

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
		setScrollbarWidth(15);

		lockBodyScroll();
		// 첫 잠금 뒤에는 스크롤바가 사라져 실제 브라우저에서도 0 이 잰다.
		setScrollbarWidth(0);
		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("15px");
	});

	it("does not drive the counter negative on a repeated unlock", () => {
		setScrollbarWidth(0);
		lockBodyScroll();
		unlockBodyScroll();
		unlockBodyScroll();

		expect(document.body.dataset.openModals).toBeUndefined();
		expect(document.body.style.overflow).toBe("");
	});

	it("restores an inline --bt-scrollbar-width the consumer had set", () => {
		// 소비자가 이 변수를 직접 잡아둔 경우 - 오버레이 한 번 열고 닫았다고 지워지면 안 된다.
		document.documentElement.style.setProperty("--bt-scrollbar-width", "10px");
		setScrollbarWidth(15);

		lockBodyScroll();
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		unlockBodyScroll();
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("10px");
	});

	it("restores an inline overflow the consumer had set", () => {
		document.body.style.overflow = "auto";
		setScrollbarWidth(0);

		lockBodyScroll();
		expect(document.body.style.overflow).toBe("hidden");

		unlockBodyScroll();
		expect(document.body.style.overflow).toBe("auto");
	});
});
