import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Dropdown } from "./bigtablet.js";
import { dropdownMarkup, key, resetVanillaDom, setViewportInset } from "./bigtablet.test-utils";

resetVanillaDom();

describe("Dropdown - 초기화", () => {
	it("마크업의 placeholder 문구를 라이브러리 기본값으로 덮어쓰지 않는다", () => {
		// 회귀: renderSelection() 이 init 시점에 "Select..." 로 덮어써서 서버 템플릿 문구가 사라졌다.
		const wrap = dropdownMarkup({ placeholder: "과일을 고르세요" });
		Dropdown(wrap);

		expect(wrap.querySelector(".bt-dropdown__placeholder")?.textContent).toBe("과일을 고르세요");
	});

	it("서버가 렌더한 hidden input 값을 읽어 초기 선택으로 쓴다 (다중)", () => {
		// 회귀: 다중 모드에서 값을 읽기 전에 기존 hidden input 을 지워 th:field 값이 유실됐다.
		const wrap = dropdownMarkup({ multiple: true, name: "fruit" });
		for (const v of ["apple", "grape"]) {
			const input = document.createElement("input");
			input.type = "hidden";
			input.name = "fruit";
			input.value = v;
			wrap.appendChild(input);
		}

		const dd = Dropdown(wrap);

		expect(dd?.getValue()).toEqual(["apple", "grape"]);
	});

	it("트리거 폭을 하한으로만 쓴다 - 못박으면 옵션 라벨이 잘린다", () => {
		// 좁은 트리거에서 목록이 자기 옵션 라벨을 ellipsis 로 접었다(#596). 실제 폭은 CSS 의
		// `width: max-content` 가 정하므로 JS 는 하한·상한만 준다.
		const wrap = dropdownMarkup();
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLButtonElement;
		control.getBoundingClientRect = () =>
			({ width: 48, height: 32, top: 10, left: 5, bottom: 42, right: 53 }) as DOMRect;

		const dd = Dropdown(wrap);
		dd?.open();

		const panel = document.querySelector(".bt-dropdown__list") as HTMLElement;
		expect(panel.style.minWidth).toBe("48px");
		expect(panel.style.width).toBe("");
		// 상한은 남는다 - 트리거가 뷰포트보다 넓으면 오른쪽 옵션이 잘린다.
		expect(panel.style.maxWidth).toBe(`${window.innerWidth - 16}px`);
	});

	it("native disabled 를 config·aria·클래스와 함께 동기화한다", () => {
		const wrap = dropdownMarkup();
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLButtonElement;
		control.disabled = true;

		const dd = Dropdown(wrap);

		expect(control.getAttribute("aria-disabled")).toBe("true");
		expect(control.classList.contains("is-disabled")).toBe(true);

		dd?.open();
		expect((document.querySelector(".bt-dropdown__list") as HTMLElement).style.display).toBe(
			"none",
		);
	});

	it("setDisabled 가 native disabled 까지 반영한다", () => {
		const wrap = dropdownMarkup();
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLButtonElement;
		const dd = Dropdown(wrap);

		dd?.setDisabled(true);
		expect(control.disabled).toBe(true);
		expect(control.getAttribute("aria-disabled")).toBe("true");

		dd?.setDisabled(false);
		expect(control.disabled).toBe(false);
	});
});

describe("Dropdown - 다중 선택", () => {
	it("옵션을 토글해도 패널이 닫히지 않는다", () => {
		const wrap = dropdownMarkup({ multiple: true });
		const dd = Dropdown(wrap);
		dd?.open();

		(document.querySelector('[data-value="apple"]') as HTMLElement).click();

		expect(dd?.getValue()).toEqual(["apple"]);
		expect(wrap.querySelector(".bt-dropdown__control")?.getAttribute("aria-expanded")).toBe("true");
	});

	it("트리거에 선택 개수 요약을 쓴다", () => {
		const wrap = dropdownMarkup({ multiple: true });
		const dd = Dropdown(wrap);
		dd?.setValue(["apple", "grape"]);

		expect(wrap.querySelector(".bt-dropdown__value")?.textContent).toBe("2개 선택");
	});

	it("같은 name 의 hidden input 을 선택 개수만큼 반복해 만든다", () => {
		const wrap = dropdownMarkup({ multiple: true, name: "fruit" });
		const dd = Dropdown(wrap);
		dd?.setValue(["apple", "grape"]);

		const values = [
			...wrap.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="fruit"]'),
		].map((i) => i.value);
		expect(values).toEqual(["apple", "grape"]);
	});

	it("선택이 0개면 hidden input 도 0개다", () => {
		const wrap = dropdownMarkup({ multiple: true, name: "fruit" });
		const dd = Dropdown(wrap);
		dd?.setValue([]);

		expect(wrap.querySelectorAll('input[type="hidden"][name="fruit"]')).toHaveLength(0);
	});

	it("listbox 에 aria-multiselectable 을 붙인다", () => {
		const wrap = dropdownMarkup({ multiple: true });
		Dropdown(wrap);

		expect(document.querySelector('[role="listbox"]')?.getAttribute("aria-multiselectable")).toBe(
			"true",
		);
	});
});

describe("Dropdown - 검색", () => {
	const searchableMarkup = () => {
		const wrap = dropdownMarkup();
		wrap.dataset.searchable = "";
		return wrap;
	};

	const visibleLabels = () =>
		[...document.querySelectorAll<HTMLElement>(".bt-dropdown__option")]
			.filter((el) => !el.hidden)
			.map((el) => el.textContent?.trim());

	it("평면 `<ul>` 마크업을 패널로 승격하고 검색 행을 넣는다", () => {
		const wrap = searchableMarkup();
		Dropdown(wrap);

		expect(document.querySelector(".bt-dropdown__search-input")).not.toBeNull();
		// 원래 `<ul>` 은 스크롤 컨테이너(`__options`)가 되고 새 `<div>` 패널이 그것을 감싼다.
		expect(
			document.querySelector("div.bt-dropdown__list > ul.bt-dropdown__options"),
		).not.toBeNull();
	});

	it("대소문자·공백을 무시하고 부분 일치로 걸러낸다", () => {
		const wrap = searchableMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const input = document.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.value = "  aPP le ";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		expect(visibleLabels()).toEqual(["사과 Apple"]);
	});

	it("결과가 없으면 안내 문구를 보여준다", () => {
		const wrap = searchableMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const input = document.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.value = "존재하지않는과일";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		const empty = document.querySelector(".bt-dropdown__empty") as HTMLElement;
		expect(empty.hidden).toBe(false);
		expect(empty.textContent).toBe("결과 없음");
	});

	it("한글 IME 조합 중에는 필터를 보류한다", () => {
		const wrap = searchableMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const input = document.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
		input.value = "포";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		// 조합 중 - 아직 아무것도 걸러지지 않았다.
		expect(visibleLabels()).toHaveLength(3);

		input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "포" }));

		expect(visibleLabels()).toEqual(["포도"]);
	});
});

describe("Dropdown - 패널 배치 · 바깥 클릭", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		setViewportInset(0);
	});

	afterEach(() => {
		// 남은 지연 콜백(overlay 제거 + unlockScroll)을 이 테스트 안에서 소진시킨 뒤 되돌린다.
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("body 로 옮긴 목록의 mousedown 을 바깥 클릭으로 오인하지 않는다", () => {
		// `mousedown` 은 `click` 보다 먼저다. 목록이 `body` 로 옮겨진 뒤 wrapper 만 보면 옵션의
		// mousedown 이 바깥 클릭이 되어 패널이 닫히고, 원래 자리로 돌아간 뒤 click 이 도착해
		// 선택이 무산된다. 앞선 테스트가 `.click()` 만 써서 이 경로를 놓쳤다.
		const wrap = dropdownMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const option = document.querySelector('[data-value="apple"]') as HTMLElement;
		option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

		// 패널이 열린 채여야 한다 - 닫혔다면 아래 click 이 아무 효과도 못 낸다.
		expect((document.querySelector(".bt-dropdown__list") as HTMLElement).style.display).toBe(
			"block",
		);

		option.click();

		expect(dd?.getValue()).toBe("apple");
	});

	it("검색 입력의 mousedown 도 바깥 클릭이 아니다", () => {
		const wrap = dropdownMarkup();
		wrap.dataset.searchable = "";
		const dd = Dropdown(wrap);
		dd?.open();

		const input = document.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

		expect((document.querySelector(".bt-dropdown__list") as HTMLElement).style.display).toBe(
			"block",
		);
	});

	it("열면 목록을 body 로 옮기고 닫으면 되돌린다 (조상 클리핑 회피)", () => {
		// 트리거 옆에 두면 `overflow: hidden` 인 조상이 잘라내고 `z-index` 로는 넘지 못한다
		// (#586 - 카드 안에서 170px 목록 중 46px 만 보였다). React 번들은 포탈로 같은 처리를 한다.
		const wrap = dropdownMarkup();
		const dd = Dropdown(wrap);
		const panel = wrap.querySelector(".bt-dropdown__list") as HTMLElement;
		const home = panel.parentElement;

		dd?.open();

		expect(panel.parentElement).toBe(document.body);
		expect(panel.style.position).toBe("");
		// 폭 하한은 트리거를 재서 인라인으로 준다 - 포탈에서는 `min-width: 100%` 가 트리거를
		// 가리키지 않는다. `width` 로 못박지는 않는다(#596).
		expect(panel.style.minWidth).not.toBe("");
		expect(panel.style.width).toBe("");

		dd?.close();

		expect(panel.parentElement).toBe(home);
		expect(panel.style.minWidth).toBe("");
		expect(panel.style.maxWidth).toBe("");
		expect(panel.style.left).toBe("");
		expect(panel.style.top).toBe("");
	});

	it("열린 채 destroy 되면 목록을 body 에 남기지 않는다", () => {
		const wrap = dropdownMarkup();
		const dd = Dropdown(wrap);
		const panel = wrap.querySelector(".bt-dropdown__list") as HTMLElement;
		const home = panel.parentElement;

		dd?.open();
		expect(panel.parentElement).toBe(document.body);

		dd?.destroy();

		expect(panel.parentElement).toBe(home);
	});

	it("활성 옵션을 화면 안으로 스크롤한다 (React 번들과 같은 처리)", () => {
		// 포커스가 컨트롤에 남는 APG 패턴이라 브라우저가 알아서 스크롤해 주지 않는다.
		// React 쪽만 고치면 두 번들이 갈린다 - 이 저장소에서 네 번 난 결함군이다.
		const scrolled: { text: string; arg: unknown }[] = [];
		vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (this: Element, arg) {
			scrolled.push({ text: this.textContent?.trim() ?? "", arg });
		});

		const wrap = dropdownMarkup();
		Dropdown(wrap);
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLButtonElement;
		control.click();
		control.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

		// 열면 첫 항목이 활성이 되고(사과), ArrowDown 이 다음으로 옮긴다(포도).
		// 스크롤은 **활성이 된 그 요소**에 대해 불려야 한다.
		const active = document.querySelector(".bt-dropdown__option.is-active");
		expect(active?.textContent).toBe("포도");
		// `nearest` - 필요한 만큼만 움직이고 페이지 스크롤은 건드리지 않는다.
		expect(scrolled.at(-1)).toEqual({ text: "포도", arg: { block: "nearest" } });

		vi.restoreAllMocks();
	});
});

describe("Dropdown - 키보드", () => {
	const active = () =>
		document.querySelector(".bt-dropdown__option.is-active")?.getAttribute("data-value");
	const setup = () => {
		const wrap = dropdownMarkup();
		const api = Dropdown(wrap);
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLElement;
		return { api, control };
	};

	it("opens on Enter, Space and arrows, then moves with arrows skipping disabled and wrapping", () => {
		const { api, control } = setup();
		for (const k of ["Enter", " ", "ArrowDown", "ArrowUp"]) {
			expect(key(control, k).defaultPrevented).toBe(true);
			expect(control.getAttribute("aria-expanded")).toBe("true");
			api?.close();
		}
		key(control, "ArrowDown");
		expect(active()).toBe("apple");
		key(control, "ArrowDown");
		expect(active()).toBe("grape");
		key(control, "ArrowDown");
		expect(active()).toBe("apple");
		key(control, "ArrowUp");
		expect(active()).toBe("grape");
		expect(control.getAttribute("aria-activedescendant")).toBe(
			document.querySelector(".bt-dropdown__option.is-active")?.id,
		);
	});

	it("commits the active option with Enter and closes", () => {
		const { api, control } = setup();
		key(control, "Enter");
		key(control, "ArrowDown");
		key(control, "Enter");
		expect(api?.getValue()).toBe("grape");
		expect(control.getAttribute("aria-expanded")).toBe("false");
	});

	it("Home/End open and jump to the enabled ends", () => {
		const { api, control } = setup();
		expect(key(control, "End").defaultPrevented).toBe(true);
		expect(control.getAttribute("aria-expanded")).toBe("true");
		expect(active()).toBe("grape");
		expect(key(control, "Home").defaultPrevented).toBe(true);
		expect(active()).toBe("apple");
		api?.close();
	});

	it("leaves Escape alone while closed, closes on Tab without blocking it, and ignores keys when disabled", () => {
		const { api, control } = setup();
		expect(key(control, "Escape").defaultPrevented).toBe(false);
		key(control, "Enter");
		expect(key(control, "Tab").defaultPrevented).toBe(false);
		expect(control.getAttribute("aria-expanded")).toBe("false");

		api?.setDisabled(true);
		expect(control.getAttribute("aria-disabled")).toBe("true");
		expect(control).toHaveClass("is-disabled");
		expect(key(control, "Enter").defaultPrevented).toBe(false);
		expect(control.getAttribute("aria-expanded")).toBe("false");
	});

	it("handles arrows, Enter, Escape and Tab inside the search input", () => {
		const wrap = dropdownMarkup();
		wrap.dataset.searchable = "";
		const api = Dropdown(wrap);
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLElement;
		api?.open();
		const input = document.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		expect(document.activeElement).toBe(input);
		expect(key(input, "ArrowDown").defaultPrevented).toBe(true);
		expect(active()).toBe("grape");
		expect(key(input, "ArrowUp").defaultPrevented).toBe(true);
		expect(active()).toBe("apple");
		expect(key(input, "Enter").defaultPrevented).toBe(true);
		expect(api?.getValue()).toBe("apple");
		expect(document.activeElement).toBe(control);

		api?.open();
		expect(key(input, "Escape").defaultPrevented).toBe(true);
		expect(control.getAttribute("aria-expanded")).toBe("false");
		api?.open();
		expect(key(input, "Tab").defaultPrevented).toBe(false);
		expect(control.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(control);
	});

	it("follows the mouse but not onto disabled options, and toggles from a click", () => {
		const { control } = setup();
		control.click();
		expect(control.getAttribute("aria-expanded")).toBe("true");
		const [, grape, melon] = Array.from(
			document.querySelectorAll<HTMLElement>(".bt-dropdown__option"),
		);
		grape?.dispatchEvent(new MouseEvent("mouseenter"));
		expect(active()).toBe("grape");
		melon?.dispatchEvent(new MouseEvent("mouseenter"));
		expect(active()).toBe("grape");
		melon?.click();
		expect(control.getAttribute("aria-expanded")).toBe("true");
		control.click();
		expect(control.getAttribute("aria-expanded")).toBe("false");
	});
});

describe("Dropdown - 옵션 소스 · 선택 표시", () => {
	const shell = (listTag: "ul" | "div" = "ul", attrs: Record<string, string> = {}) => {
		const wrap = document.createElement("div");
		wrap.className = "bt-dropdown";
		for (const [k, v] of Object.entries(attrs)) wrap.setAttribute(k, v);
		wrap.innerHTML = `<button type="button" class="bt-dropdown__control"><span class="bt-dropdown__placeholder">고르세요</span></button><${listTag} class="bt-dropdown__list"></${listTag}>`;
		document.body.appendChild(wrap);
		return wrap;
	};
	const optionEls = () =>
		Array.from(document.querySelectorAll<HTMLElement>(".bt-dropdown__option"));
	const OPTS = [
		{ value: "a", label: "에이" },
		{ value: "b", label: "비", disabled: true },
	];

	it("builds li items under a list and div items under a div from config.options", () => {
		Dropdown(shell("ul"), { options: OPTS });
		expect(optionEls().map((el) => el.tagName)).toEqual(["LI", "LI"]);
		expect(optionEls()[1]).toHaveClass("is-disabled");
		expect(optionEls()[1]?.getAttribute("aria-disabled")).toBe("true");
		expect(optionEls()[0]?.hasAttribute("aria-disabled")).toBe(false);
		expect(optionEls()[0]?.textContent).toBe("에이");

		document.body.innerHTML = "";
		Dropdown(shell("div"), { options: OPTS });
		expect(optionEls().map((el) => el.tagName)).toEqual(["DIV", "DIV"]);
	});

	it("reads data-options JSON and falls back to markup when it is not a valid array", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		Dropdown(shell("ul", { "data-options": JSON.stringify(OPTS) }));
		expect(optionEls().map((el) => el.dataset.value)).toEqual(["a", "b"]);

		for (const bad of ["{'a':1}", '{"value":"x"}']) {
			document.body.innerHTML = "";
			const wrap = dropdownMarkup();
			wrap.dataset.options = bad;
			Dropdown(wrap);
			expect(optionEls().map((el) => el.dataset.value)).toEqual(["apple", "grape", "melon"]);
		}
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it("uses option text as the value when data-value is missing", () => {
		const wrap = shell();
		wrap.querySelector("ul")!.innerHTML = '<li class="bt-dropdown__option">  자두  </li>';
		const api = Dropdown(wrap);
		optionEls()[0]?.click();
		expect(api?.getValue()).toBe("자두");
	});

	it("takes placeholder, search placeholder and empty text from data-* unless set in JS", () => {
		Dropdown(
			shell("ul", {
				"data-placeholder": "속성 문구",
				"data-searchable": "",
				"data-search-placeholder": "찾기",
				"data-empty-text": "없음",
			}),
			{ options: OPTS },
		);
		expect(document.querySelector(".bt-dropdown__placeholder")?.textContent).toBe("속성 문구");
		expect(
			document.querySelector<HTMLInputElement>(".bt-dropdown__search-input")?.placeholder,
		).toBe("찾기");
		expect(document.querySelector(".bt-dropdown__empty")?.textContent).toBe("없음");
		expect(document.querySelector<HTMLElement>(".bt-dropdown__empty")?.hidden).toBe(true);
		expect(document.querySelector(".bt-dropdown__control")?.hasAttribute("role")).toBe(false);

		document.body.innerHTML = "";
		Dropdown(
			shell("ul", {
				"data-placeholder": "속성",
				"data-searchable": "",
				"data-search-placeholder": "x",
				"data-empty-text": "y",
			}),
			{ options: OPTS, placeholder: "JS", searchPlaceholder: "JS 찾기", emptyText: "JS 없음" },
		);
		expect(document.querySelector(".bt-dropdown__placeholder")?.textContent).toBe("JS");
		expect(
			document.querySelector<HTMLInputElement>(".bt-dropdown__search-input")?.placeholder,
		).toBe("JS 찾기");
		expect(document.querySelector(".bt-dropdown__empty")?.textContent).toBe("JS 없음");
	});

	it("derives listbox and option ids from the wrapper id but keeps existing ones", () => {
		const wrap = dropdownMarkup();
		wrap.querySelector("li")!.id = "keep";
		Dropdown(wrap);
		const list = document.querySelector("[role=listbox]") as HTMLElement;
		expect(list.id).toBe("dd_listbox");
		expect(document.querySelector(".bt-dropdown__control")?.getAttribute("aria-controls")).toBe(
			"dd_listbox",
		);
		expect(document.querySelector(".bt-dropdown__control")?.getAttribute("role")).toBe("combobox");
		expect(optionEls().map((el) => el.id)).toEqual(["keep", "dd_option_1", "dd_option_2"]);

		document.body.innerHTML = "";
		const anon = dropdownMarkup();
		anon.removeAttribute("id");
		Dropdown(anon);
		expect((document.querySelector("[role=listbox]") as HTMLElement).id).toMatch(/_listbox$/);
		expect((document.querySelector("[role=listbox]") as HTMLElement).id).not.toBe("_listbox");
	});

	it("returns null without the control or list, or for a missing selector", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const noList = document.createElement("div");
		noList.innerHTML = '<button class="bt-dropdown__control"></button>';
		expect(Dropdown(noList)).toBeNull();
		const noControl = document.createElement("div");
		noControl.innerHTML = '<ul class="bt-dropdown__list"></ul>';
		expect(Dropdown(noControl)).toBeNull();
		expect(Dropdown("#missing")).toBeNull();
		dropdownMarkup();
		expect(Dropdown("#dd")).not.toBeNull();
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it("shows the picked label, marks only that option and reports value with option", () => {
		const onValueChange = vi.fn();
		const wrap = dropdownMarkup({ name: "fruit" });
		const api = Dropdown(wrap, { onValueChange });
		const value = () =>
			wrap.querySelector(".bt-dropdown__value, .bt-dropdown__placeholder") as HTMLElement;
		const hidden = () => wrap.querySelector<HTMLInputElement>('input[name="fruit"]');
		expect(hidden()?.value).toBe("");

		optionEls()[1]?.click();
		expect(value().textContent).toBe("포도");
		expect(value()).toHaveClass("bt-dropdown__value");
		expect(value()).not.toHaveClass("bt-dropdown__placeholder");
		expect(optionEls().map((el) => el.getAttribute("aria-selected"))).toEqual([
			"false",
			"true",
			"false",
		]);
		expect(optionEls()[1]).toHaveClass("is-selected");
		expect(optionEls()[0]).not.toHaveClass("is-selected");
		expect(hidden()?.value).toBe("grape");
		expect(onValueChange).toHaveBeenLastCalledWith("grape", {
			value: "grape",
			label: "포도",
			disabled: false,
		});

		api?.setValue(["apple"]);
		expect(api?.getValue()).toBe("apple");
		api?.setValue([]);
		expect(api?.getValue()).toBeNull();
		api?.setValue("nope");
		expect(onValueChange).toHaveBeenLastCalledWith("nope", null);
		expect(value().textContent).toBe("선택하세요");
		expect(value()).toHaveClass("bt-dropdown__placeholder");
		api?.setValue(null);
		expect(hidden()?.value).toBe("");
	});

	it("matches numeric values against string option values", () => {
		const api = Dropdown(shell(), { options: [{ value: 1, label: "하나" }] });
		api?.setValue("1");
		expect(document.querySelector(".bt-dropdown__value")?.textContent).toBe("하나");
	});

	it("reports values with their options in multiple mode and removes a toggled value", () => {
		const onValueChange = vi.fn();
		const wrap = dropdownMarkup({ multiple: true });
		const api = Dropdown(wrap, { onValueChange });
		expect(optionEls()[0]?.querySelector(".bt-dropdown__option-check")).not.toBeNull();
		expect(optionEls()[0]?.firstElementChild).toHaveClass("bt-dropdown__option-check");

		api?.setValue(["apple", "ghost", "grape"]);
		expect(onValueChange).toHaveBeenLastCalledWith(
			["apple", "ghost", "grape"],
			[
				{ value: "apple", label: "사과 Apple", disabled: false },
				{ value: "grape", label: "포도", disabled: false },
			],
		);
		optionEls()[0]?.click();
		expect(api?.getValue()).toEqual(["ghost", "grape"]);
		api?.setValue("apple");
		expect(api?.getValue()).toEqual(["apple"]);
		api?.setValue(null);
		expect(api?.getValue()).toEqual([]);
		expect(wrap.querySelector(".bt-dropdown__placeholder")?.textContent).toBe("선택하세요");
	});
});
