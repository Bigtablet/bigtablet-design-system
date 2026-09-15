import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lockBodyScroll, unlockBodyScroll } from "./scroll-lock";

/**
 * jsdom 은 레이아웃을 하지 않아 fixed 프로브의 `getBoundingClientRect().width` 가 0 이다.
 * 스크롤바나 예약된 거터가 있는 상황을 만들려면 프로브가 재는 ICB 폭을 직접 세워야 한다.
 *
 * 이 스텁이 `clientWidth` 가 아니라 프로브를 세우는 것이 핵심이다 - `scrollbar-gutter: stable`
 * 에서는 `clientWidth` 가 거터를 포함해 보고하므로(Chromium 실측) 거기서는 잴 수 없다.
 */
const setViewportInset = (inset: number, options: { afterLock?: number } = {}) => {
	Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true, writable: true });
	// 잠금은 두 번 잰다 - 걸기 전(회수할 폭)과 건 뒤(실제로 회수됐는지). `afterLock` 으로 두
	// 번째 값을 따로 세운다. 기본은 "그대로 남았다" - 브라우저가 스크롤바를 못박은 경우다.
	const widths = [1280 - inset, 1280 - (options.afterLock ?? inset)];
	let call = 0;
	vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(() => {
		const width = widths[Math.min(call++, widths.length - 1)];
		return {
			width,
			height: 0,
			top: 0,
			left: 0,
			right: width,
			bottom: 0,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		} as DOMRect;
	});
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

describe("scroll-lock", () => {
	beforeEach(() => {
		setDocumentScrolls(true);
		document.body.style.cssText = "";
		document.documentElement.style.cssText = "";
	});

	afterEach(() => {
		// 잠금과 진행도 보고는 모듈 상태다 - 남기면 다음 테스트가 남의 진행도로 시작한다.
		// (실사용에서는 오버레이가 열린 만큼 해제되므로 마지막 해제에서 전부 비워진다.)
		let guard = 0;
		while (document.body.dataset.openModals && guard++ < 10) unlockBodyScroll();
		document.body.removeAttribute("data-open-modals");
		vi.restoreAllMocks();
	});

	it("locks overflow and counts one open overlay", () => {
		setViewportInset(0);
		lockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("releases the reserved gutter and keeps the width as body padding", () => {
		// 거터가 남으면 그 자리는 캔버스가 칠하는 영역이라 오버레이가 덮지 못한다 - 단색 배경
		// 에서만 색으로 흉내낼 수 있었고 표·카드가 닿으면 세로선이 남았다(#635).
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15, { afterLock: 0 });

		lockBodyScroll();

		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.style.paddingRight).toBe("15px");
		// 오버레이가 자기 정렬을 상쇄하는 데 쓰고, 소비자도 자기 fixed 요소에 같은 보정을 건다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
	});

	it("reverts the padding when the space was not actually reclaimed", () => {
		// 앱이 `html { overflow-y: scroll }` 로 스크롤바를 못박아 두면 잠금 뒤에도 그 자리가
		// 남는다. 그때까지 padding 을 주면 콘텐츠만 안쪽으로 밀린다.
		setViewportInset(15);

		lockBodyScroll();

		// 스텁이 잠금 뒤에도 같은 inset 을 돌려주므로 회수 실패 경로가 그대로 재현된다.
		expect(document.body.style.paddingRight).toBe("");
		// 변수도 남기지 않는다 - 오버레이·Toast·소비자 고정 요소가 이 값을 읽어 보정하므로,
		// 회수하지 못했는데 노출하면 ICB 는 그대로인 채 그것들만 밀린다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
	});

	it("keeps the consumer's own scrollbar-width value when the reclaim fails", () => {
		// 소비자가 직접 잡아둔 값은 회수 실패로 되돌릴 때도 살아야 한다 - 우리 보정만 걷는다.
		document.documentElement.style.setProperty("--bt-scrollbar-width", "10px");
		setViewportInset(15);

		lockBodyScroll();

		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("10px");
	});

	it("locks the root element too, so an app with html overflow set still stops scrolling", () => {
		// body 의 overflow 는 html 이 visible 일 때만 뷰포트로 전파된다. `html { overflow-x: hidden }`
		// 같은 리셋이 있으면 body 만 잠가도 문서가 스크롤됐다(실측: 잠금 뒤 scrollTo 가 먹힘).
		document.documentElement.style.overflow = "auto";
		setViewportInset(0);

		lockBodyScroll();
		expect(document.documentElement.style.overflow).toBe("hidden");

		unlockBodyScroll();
		expect(document.documentElement.style.overflow).toBe("auto");
	});

	it("measures the gutter from the ICB, not from clientWidth", () => {
		// `scrollbar-gutter: stable` 에서는 clientWidth 가 innerWidth 와 같게 보고한다(Chromium
		// 실측). 그래서 폭은 fixed 프로브로 잰다.
		document.documentElement.style.scrollbarGutter = "stable";
		Object.defineProperty(document.documentElement, "clientWidth", {
			value: 1280,
			configurable: true,
		});
		setViewportInset(15, { afterLock: 0 });

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

	it("adds to the consumer's existing body padding", () => {
		// 덮어쓰면 소비자가 준 여백만큼 콘텐츠가 되레 움직인다.
		document.body.style.paddingRight = "20px";
		setViewportInset(15, { afterLock: 0 });

		lockBodyScroll();

		expect(document.body.style.paddingRight).toBe("35px");
	});

	it("reclaims a reserved gutter even when the document does not scroll", () => {
		// 앱 셸이 내부 컨테이너를 스크롤 컨테이너로 삼아도 앱이 예약해 둔 거터는 화면에 남아
		// 있다. 스크롤 여부가 아니라 **ICB 가 좁은가**로 판단한다 - 좁으면 오버레이가 못 덮는다.
		setDocumentScrolls(false);
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15, { afterLock: 0 });

		lockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.style.paddingRight).toBe("15px");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");
	});

	it("works when the app scrolls body instead of documentElement", () => {
		// 앱이 `html` 에 overflow 를 걸면 `body` 가 실제 스크롤 요소가 된다. 폭 판정은 ICB 만
		// 보므로 그 구성에서도 같은 경로를 탄다.
		Object.defineProperty(document, "scrollingElement", {
			value: document.body,
			configurable: true,
		});
		setDocumentScrolls(false);
		setViewportInset(15, { afterLock: 0 });

		lockBodyScroll();

		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.style.paddingRight).toBe("15px");
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
		setViewportInset(15, { afterLock: 0 });
		lockBodyScroll();
		lockBodyScroll();

		unlockBodyScroll();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("measures only once so a nested lock cannot double the compensation", () => {
		setViewportInset(15, { afterLock: 0 });

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
		setViewportInset(15, { afterLock: 0 });

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

	it("restores an axis-only inline overflow and leaves no shorthand behind", () => {
		// 앱이 흔한 리셋 `html { overflow-x: hidden }` 을 **인라인**으로 걸어 두면 shorthand
		// (`style.overflow`)는 `""` 로 읽힌다 - CSSOM 은 두 축이 다 인라인일 때만 합쳐 준다.
		// 그 `""` 를 스냅샷으로 저장하고 해제 때 되쓰면 원래 있던 축이 사라진다
		// (Chromium 실측 - 해제 후 `overflowX` 가 `""`, 계산값 `visible`). jsdom 은 그 손실을
		// 재현하지 않으므로 여기서는 **축이 살아남는지**와 우리가 건 shorthand 가 남지 않는지를
		// 고정한다. 후자는 longhand 만 비우는 구현에서 실제로 깨진다.
		document.documentElement.style.overflowX = "hidden";
		document.body.style.overflowY = "scroll";
		setViewportInset(0);

		lockBodyScroll();
		unlockBodyScroll();

		expect(document.documentElement.style.overflowX).toBe("hidden");
		expect(document.documentElement.style.overflowY).toBe("");
		expect(document.body.style.overflowY).toBe("scroll");
		expect(document.body.style.overflowX).toBe("");
		expect(document.documentElement.style.getPropertyValue("overflow")).toBe("");
		expect(document.body.style.getPropertyValue("overflow")).toBe("");
	});
});
