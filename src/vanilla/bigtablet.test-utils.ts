import { afterEach, beforeEach, vi } from "vitest";

// Vanilla 번들 테스트 공용 헬퍼 - 컴포넌트별 테스트 파일이 함께 쓴다.

/** jsdom 은 scrollHeight/clientHeight 가 0 이라 "문서가 스크롤된다" 를 세워야 한다. */
export const setDocumentScrolls = (scrolls: boolean) => {
	Object.defineProperty(document.documentElement, "scrollHeight", {
		value: scrolls ? 4000 : 800,
		configurable: true,
	});
	Object.defineProperty(document.documentElement, "clientHeight", {
		value: 800,
		configurable: true,
	});
};

/** jsdom 의 `CSS` 에는 `supports` 가 없다 - 구현의 가드가 그래서 필요하다. */
export const setGutterSupport = (supported: boolean) => {
	Object.defineProperty(globalThis.CSS, "supports", {
		value: (condition: string) => (condition.includes("scrollbar-gutter") ? supported : false),
		configurable: true,
		writable: true,
	});
};

/**
 * jsdom 은 레이아웃을 하지 않아 fixed 프로브의 폭이 0 이다. 스크롤바나 예약된 거터가 있는
 * 상황을 만들려면 프로브가 재는 ICB 폭을 직접 세운다. `clientWidth` 가 아니라 프로브를 세우는
 * 것이 핵심 - `scrollbar-gutter: stable` 에서는 `clientWidth` 가 거터를 포함해 보고한다.
 */
export const setViewportInset = (inset: number, options: { afterLock?: number } = {}) => {
	Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true, writable: true });
	// 잠금은 두 번 잰다 - 걸기 전(회수할 폭)과 건 뒤(실제로 회수됐는지).
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

export const pressEscape = () =>
	document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

/** 문서화된 기본 Dropdown 마크업 (평면 `<ul>`). */
export const dropdownMarkup = (
	opts: { multiple?: boolean; name?: string; placeholder?: string } = {},
) => {
	const wrap = document.createElement("div");
	wrap.className = "bt-dropdown";
	wrap.id = "dd";
	if (opts.multiple) wrap.dataset.multiple = "";
	if (opts.name) wrap.dataset.name = opts.name;
	wrap.innerHTML = `
		<button type="button" class="bt-dropdown__control">
			<span class="bt-dropdown__placeholder">${opts.placeholder ?? "선택하세요"}</span>
		</button>
		<ul class="bt-dropdown__list">
			<li class="bt-dropdown__option" data-value="apple">사과 Apple</li>
			<li class="bt-dropdown__option" data-value="grape">포도</li>
			<li class="bt-dropdown__option is-disabled" data-value="melon">멜론 (품절)</li>
		</ul>`;
	document.body.appendChild(wrap);
	return wrap;
};

export const key = (target: EventTarget, k: string, init: KeyboardEventInit = {}) => {
	const event = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init });
	target.dispatchEvent(event);
	return event;
};

/**
 * 테스트마다 body·html 스타일과 dataset 을 비우고 mock 을 되돌린다. 번들은 스크롤 잠금 카운터를
 * body dataset 에 두고 오버레이 리스너를 document 에 걸어, 앞 테스트의 흔적이 남으면 다음
 * 테스트의 잠금·키 처리가 틀어진다. 각 테스트 파일 맨 위에서 부른다.
 */
export const resetVanillaDom = () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		document.body.style.cssText = "";
		document.documentElement.style.cssText = "";
		for (const k of Object.keys(document.body.dataset)) delete document.body.dataset[k];
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
};
