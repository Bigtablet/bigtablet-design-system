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

/**
 * jsdom 의 `scrollHeight`/`clientHeight` 는 0 이라 "문서가 스크롤된다" 를 만들 수 없다.
 * 새 로직이 그 판정으로 분기하므로 직접 세운다.
 */
const setDocumentScrolls = (scrolls: boolean) => {
	Object.defineProperty(document.documentElement, "scrollHeight", {
		value: scrolls ? 4000 : 800,
		configurable: true,
	});
	Object.defineProperty(document.documentElement, "clientHeight", {
		value: 800,
		configurable: true,
	});
};

/**
 * `scrollbar-gutter` 지원 여부. jsdom 의 `CSS` 에는 `supports` 가 아예 없어서 - 그래서
 * 구현 쪽에 `typeof CSS.supports === "function"` 가드가 있다 - 스텁을 직접 심는다.
 * 지원을 끄면 Safari 18.2 미만의 padding 폴백 경로가 재현된다.
 */
const setGutterSupport = (supported: boolean) => {
	Object.defineProperty(globalThis.CSS, "supports", {
		value: (condition: string) => (condition.includes("scrollbar-gutter") ? supported : false),
		configurable: true,
		writable: true,
	});
};

describe("scroll-lock", () => {
	beforeEach(() => {
		setDocumentScrolls(true);
		setGutterSupport(true);
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

	it("reserves the gutter instead of releasing it, and adds no padding", () => {
		// 놓으면(`auto`) ICB 폭이 변해 `position: fixed; left: 50%` 요소가 스크롤바 폭의 절반만큼
		// 움직인다(#574 - 실측 592.5 → 600). 예약하면 폭이 그대로라 padding 보정도 불필요하다.
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);

		lockBodyScroll();

		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.body.style.paddingRight).toBe("");
		// 오버레이가 예약된 거터를 넘어가 덮을 수 있도록 폭은 계속 노출한다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
	});

	it("measures the gutter from the ICB, not from clientWidth", () => {
		// `scrollbar-gutter: stable` 에서는 clientWidth 가 innerWidth 와 같게 보고한다(Chromium
		// 실측). 그래서 폭은 fixed 프로브로 잰다.
		document.documentElement.style.scrollbarGutter = "stable";
		Object.defineProperty(document.documentElement, "clientWidth", {
			value: 1280,
			configurable: true,
		});
		setViewportInset(15);

		lockBodyScroll();

		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
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

	it("adds to the consumer's existing body padding in the fallback path", () => {
		// `scrollbar-gutter` 미지원(Safari 18.2 미만)에서만 padding 을 쓴다. 덮어쓰면 소비자가
		// 준 여백만큼 콘텐츠가 되레 움직인다.
		setGutterSupport(false);
		document.body.style.paddingRight = "20px";
		setViewportInset(15);

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("35px");
		// 폴백에서는 거터를 건드리지 않는다.
		expect(document.documentElement.style.scrollbarGutter).toBe("");
	});

	it("does nothing when the document does not scroll", () => {
		// 앱 셸이 내부 컨테이너를 스크롤 컨테이너로 삼으면 문서에는 스크롤바가 없다. 그때
		// 보정하면 없는 스크롤바를 없애느라 레이아웃이 흔들린다 - 예약된 거터를 스크롤바로
		// 오인해 실제로 그렇게 됐다(#574).
		setDocumentScrolls(false);
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);

		lockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.body.style.paddingRight).toBe("");
		// 폭은 노출한다 - 앱이 예약해 둔 거터는 화면에 남아 있고 오버레이가 넘어가 덮어야 한다.
		// 노출하지 않으면 dim 옆에 밝은 띠가 그대로 남는다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
	});

	it("dims the reserved gutter by compositing the dim onto the canvas", () => {
		// 예약된 거터는 캔버스(루트 배경)가 칠하는 영역이라 오버레이가 덮을 수 없다(#580).
		// 딤을 지금 보이는 캔버스 색 위에 합성해 루트 배경색으로 심는 것이 유일한 방법이다.
		setViewportInset(15);
		// 기본값(검정 50%)이 아닌 색을 일부러 넣는다 - 폴백 기본값과 같으면 딤 색을 엉뚱한
		// 프로퍼티에서 읽어도 드러나지 않는다.
		document.documentElement.style.setProperty("--bt-color-bg-overlay", "rgba(0, 0, 255, 0.5)");
		document.documentElement.style.backgroundColor = "rgb(255, 233, 168)";

		lockBodyScroll();

		// rgba(0,0,255,.5) over rgb(255,233,168) = (127.5, 116.5, 211.5) → 반올림
		expect(document.documentElement.style.backgroundColor).toBe("rgb(128, 117, 212)");
		expect(document.documentElement.hasAttribute("data-bt-scroll-locked")).toBe(true);

		unlockBodyScroll();

		expect(document.documentElement.style.backgroundColor).toBe("rgb(255, 233, 168)");
		expect(document.documentElement.hasAttribute("data-bt-scroll-locked")).toBe(false);
	});

	it("falls back to the body background when the root is transparent", () => {
		// 루트가 투명하면 `body` 배경이 캔버스로 전파된다 - 거터에 보이는 색도 그것이다.
		setViewportInset(15);
		document.documentElement.style.setProperty("--bt-color-bg-overlay", "rgba(0, 0, 0, 0.5)");
		document.body.style.backgroundColor = "rgb(0, 0, 200)";

		lockBodyScroll();

		expect(document.documentElement.style.backgroundColor).toBe("rgb(0, 0, 100)");

		unlockBodyScroll();

		// 원래 인라인 배경이 없었으므로 인라인 값도 남지 않아야 한다.
		expect(document.documentElement.style.backgroundColor).toBe("");
	});

	it("does not paint the canvas on the padding fallback - there is no gutter there", () => {
		setGutterSupport(false);
		setViewportInset(15);
		document.documentElement.style.setProperty("--bt-color-bg-overlay", "rgba(0, 0, 0, 0.5)");
		document.documentElement.style.backgroundColor = "rgb(255, 233, 168)";

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("15px");
		expect(document.documentElement.style.backgroundColor).toBe("rgb(255, 233, 168)");
	});

	it("uses the browser's scrolling element, not documentElement", () => {
		// 앱이 `html` 에 overflow 를 걸면 `body` 가 실제 스크롤 요소가 된다. documentElement 를
		// 하드코딩하면 그 구성에서 판정이 어긋난다.
		Object.defineProperty(document, "scrollingElement", {
			value: document.body,
			configurable: true,
		});
		Object.defineProperty(document.body, "scrollHeight", { value: 4000, configurable: true });
		Object.defineProperty(document.body, "clientHeight", { value: 800, configurable: true });
		// documentElement 쪽은 스크롤되지 않는 것처럼 세운다.
		setDocumentScrolls(false);
		setViewportInset(15);

		lockBodyScroll();

		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
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
		setViewportInset(15);
		lockBodyScroll();
		lockBodyScroll();

		unlockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("measures only once so a nested lock cannot double the compensation", () => {
		setGutterSupport(false);
		setViewportInset(15);

		lockBodyScroll();
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
