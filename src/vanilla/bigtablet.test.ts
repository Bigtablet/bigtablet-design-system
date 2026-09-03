import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Alert, Dropdown, Modal, Toggle } from "./bigtablet.js";

/**
 * jsdom 은 레이아웃을 하지 않아 fixed 프로브의 폭이 0 이다. 스크롤바나 예약된 거터가 있는
 * 상황을 만들려면 프로브가 재는 ICB 폭을 직접 세운다. `clientWidth` 가 아니라 프로브를 세우는
 * 것이 핵심 - `scrollbar-gutter: stable` 에서는 `clientWidth` 가 거터를 포함해 보고한다.
 */
/** jsdom 은 scrollHeight/clientHeight 가 0 이라 "문서가 스크롤된다" 를 세워야 한다. */
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

/** jsdom 의 `CSS` 에는 `supports` 가 없다 - 구현의 가드가 그래서 필요하다. */
const setGutterSupport = (supported: boolean) => {
	Object.defineProperty(globalThis.CSS, "supports", {
		value: (condition: string) => (condition.includes("scrollbar-gutter") ? supported : false),
		configurable: true,
		writable: true,
	});
};

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

const pressEscape = () =>
	document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

/** 문서화된 기본 Dropdown 마크업 (평면 `<ul>`). */
const dropdownMarkup = (opts: { multiple?: boolean; name?: string; placeholder?: string } = {}) => {
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

beforeEach(() => {
	document.body.innerHTML = "";
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";
	for (const k of Object.keys(document.body.dataset)) delete document.body.dataset[k];
});

afterEach(() => {
	vi.restoreAllMocks();
});

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

	it("native disabled 를 config·aria·클래스와 함께 동기화한다", () => {
		const wrap = dropdownMarkup();
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLButtonElement;
		control.disabled = true;

		const dd = Dropdown(wrap);

		expect(control.getAttribute("aria-disabled")).toBe("true");
		expect(control.classList.contains("is-disabled")).toBe(true);

		dd?.open();
		expect((wrap.querySelector(".bt-dropdown__list") as HTMLElement).style.display).toBe("none");
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

		(wrap.querySelector('[data-value="apple"]') as HTMLElement).click();

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

		expect(wrap.querySelector('[role="listbox"]')?.getAttribute("aria-multiselectable")).toBe(
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

	const visibleLabels = (wrap: HTMLElement) =>
		[...wrap.querySelectorAll<HTMLElement>(".bt-dropdown__option")]
			.filter((el) => !el.hidden)
			.map((el) => el.textContent?.trim());

	it("평면 `<ul>` 마크업을 패널로 승격하고 검색 행을 넣는다", () => {
		const wrap = searchableMarkup();
		Dropdown(wrap);

		expect(wrap.querySelector(".bt-dropdown__search-input")).not.toBeNull();
		// 원래 `<ul>` 은 스크롤 컨테이너(`__options`)가 되고 새 `<div>` 패널이 그것을 감싼다.
		expect(wrap.querySelector("div.bt-dropdown__list > ul.bt-dropdown__options")).not.toBeNull();
	});

	it("대소문자·공백을 무시하고 부분 일치로 걸러낸다", () => {
		const wrap = searchableMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const input = wrap.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.value = "  aPP le ";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		expect(visibleLabels(wrap)).toEqual(["사과 Apple"]);
	});

	it("결과가 없으면 안내 문구를 보여준다", () => {
		const wrap = searchableMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const input = wrap.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.value = "존재하지않는과일";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		const empty = wrap.querySelector(".bt-dropdown__empty") as HTMLElement;
		expect(empty.hidden).toBe(false);
		expect(empty.textContent).toBe("결과 없음");
	});

	it("한글 IME 조합 중에는 필터를 보류한다", () => {
		const wrap = searchableMarkup();
		const dd = Dropdown(wrap);
		dd?.open();

		const input = wrap.querySelector(".bt-dropdown__search-input") as HTMLInputElement;
		input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
		input.value = "포";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		// 조합 중 - 아직 아무것도 걸러지지 않았다.
		expect(visibleLabels(wrap)).toHaveLength(3);

		input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "포" }));

		expect(visibleLabels(wrap)).toEqual(["포도"]);
	});
});

describe("Toggle", () => {
	const toggleMarkup = () => {
		const el = document.createElement("button");
		el.className = "bt-toggle";
		el.innerHTML = '<span class="bt-toggle__thumb"></span>';
		document.body.appendChild(el);
		return el;
	};

	it("클릭하면 onCheckedChange 를 부른다", () => {
		const onCheckedChange = vi.fn();
		const el = toggleMarkup();
		Toggle(el, { onCheckedChange });

		el.click();

		expect(onCheckedChange).toHaveBeenCalledWith(true);
		expect(el.getAttribute("aria-checked")).toBe("true");
	});

	it("native disabled 면 토글되지 않는다", () => {
		const onCheckedChange = vi.fn();
		const el = toggleMarkup();
		el.disabled = true;
		Toggle(el, { onCheckedChange });

		el.click();

		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it("config.disabled 를 native disabled 로 통일한다", () => {
		const el = toggleMarkup();
		Toggle(el, { disabled: true });

		expect(el.disabled).toBe(true);
	});
});

describe("Modal - 바디 스크롤 잠금", () => {
	const modalMarkup = (id = "m1") => {
		const el = document.createElement("div");
		el.className = "bt-modal";
		el.id = id;
		el.innerHTML = '<div class="bt-modal__panel"><button>닫기</button></div>';
		document.body.appendChild(el);
		return el;
	};

	it("열면 잠그고 닫으면 푼다", () => {
		setViewportInset(0);
		const m = Modal(modalMarkup());

		m?.open();
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.btOpenModals).toBe("1");

		m?.close();
		expect(document.body.style.overflow).toBe("");
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("거터를 놓지 않고 예약한다 - fixed 요소가 움직이지 않게", () => {
		// 놓으면(`auto`) ICB 폭이 변해 `position: fixed; left: 50%` 요소가 스크롤바 폭의 절반만큼
		// 움직인다(#574). React 번들과 같은 판정·같은 결과여야 한다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.body.style.paddingRight).toBe("");
		// 소비자가 거터 폭을 알 수 있게 폭은 노출한다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();

		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
	});

	it("예약된 거터를 캔버스 합성으로 어둡게 한다 (React 번들과 같은 처리)", () => {
		// 예약된 거터는 캔버스(루트 배경)가 칠하는 영역이라 dim 이 덮을 수 없다(#580).
		// 두 번들 중 한쪽만 고치면 갈린다 - 이 저장소에서 다섯 번 난 결함군이다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		setViewportInset(15);
		// 오버레이가 실제로 페인트에 쓰는 프로퍼티다 (`.bt-modal { background: var(--bt-color-overlay) }`).
		// 기본값(검정 50%)이 아닌 색을 일부러 넣는다 - 선언만 있고 아무도 참조하지 않는
		// `--bt-color-background-overlay` 를 읽으면 폴백 기본값과 같아져 드러나지 않는다.
		document.documentElement.style.setProperty("--bt-color-overlay", "rgba(0, 0, 255, 0.5)");
		document.documentElement.style.backgroundColor = "rgb(255, 233, 168)";

		const m = Modal(modalMarkup());
		m?.open();

		// rgba(0,0,255,.5) over rgb(255,233,168) = (127.5, 116.5, 211.5) → 반올림
		expect(document.documentElement.style.backgroundColor).toBe("rgb(128, 117, 212)");
		expect(document.documentElement.hasAttribute("data-bt-scroll-locked")).toBe(true);

		m?.close();

		expect(document.documentElement.style.backgroundColor).toBe("rgb(255, 233, 168)");
		expect(document.documentElement.hasAttribute("data-bt-scroll-locked")).toBe(false);
	});

	it("문서가 스크롤되지 않으면 아무것도 하지 않는다", () => {
		setDocumentScrolls(false);
		setGutterSupport(true);
		setViewportInset(15);

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.style.paddingRight).toBe("");
		// 폭은 노출한다 - 예약된 거터를 오버레이가 넘어가 덮어야 한다 (React 쪽과 동일).
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();
	});

	it("clientWidth 가 거터를 감춰도 폭을 잰다", () => {
		// `scrollbar-gutter: stable` 에서 Chromium 은 clientWidth 를 innerWidth 와 같게 보고한다.
		// 옛 측정식은 0 을 내고 보정이 한 번도 걸리지 않았다 - 폭은 fixed 프로브로 잰다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15);
		vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1280);
		expect(window.innerWidth - document.documentElement.clientWidth).toBe(0);

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();
	});

	it("중첩 오버레이는 마지막 해제까지 잠금을 유지한다", () => {
		// 폭 보정 방식이 아니라 "마지막 해제까지 유지" 자체를 보는 테스트다. 지원 환경에서는
		// 거터 예약이라 padding 이 비어 있으므로, 보정이 남아 있는지는 거터로 확인한다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		setViewportInset(15);
		const a = Modal(modalMarkup("m1"));
		const b = Modal(modalMarkup("m2"));

		a?.open();
		b?.open();
		expect(document.body.dataset.btOpenModals).toBe("2");

		b?.close();
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.scrollbarGutter).toBe("stable");

		a?.close();
		expect(document.body.style.overflow).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("");
	});

	it("이미 열린 모달을 다시 열어도 카운터가 중복 증가하지 않는다", () => {
		setViewportInset(0);
		const m = Modal(modalMarkup());

		m?.open();
		m?.open();

		expect(document.body.dataset.btOpenModals).toBe("1");

		// 반드시 닫는다. Modal 은 `document` 에 keydown 리스너를 걸고 close() 에서만 떼므로,
		// 열어둔 채 끝내면 이후 테스트의 Escape 가 이 좀비 모달까지 깨워 그쪽 close() ->
		// unlockScroll() 이 남의 스크롤 잠금 카운터를 소비해버린다.
		m?.close();
	});
});

// Alert 의 close() 는 퇴출 애니메이션을 기다려 `setTimeout(..., 200)` 안에서 overlay 제거와
// unlockScroll() 을 한다. 실제 타이머로 두면 그 콜백이 이 테스트가 끝난 뒤 **다른 테스트가 도는
// 중에** 발화해 남의 스크롤 잠금 상태를 건드린다. fake timer 로 시점을 직접 통제한다.
describe("Alert", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		setViewportInset(0);
	});

	afterEach(() => {
		// 남은 지연 콜백(overlay 제거 + unlockScroll)을 이 테스트 안에서 소진시킨 뒤 되돌린다.
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("Escape 로 닫으면 onCancel 을 경유한다", () => {
		const onCancel = vi.fn();
		Alert({ title: "삭제", message: "정말?", showCancel: true, onCancel });

		pressEscape();

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("오버레이 클릭으로 닫아도 onCancel 을 경유한다", () => {
		const onCancel = vi.fn();
		Alert({ title: "삭제", message: "정말?", showCancel: true, onCancel });

		(document.querySelector(".bt-alert__overlay") as HTMLElement).click();

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("닫으면 스크롤 잠금이 풀린다", () => {
		Alert({ title: "삭제", message: "정말?", showCancel: true });
		expect(document.body.dataset.btOpenModals).toBe("1");

		pressEscape();
		// 잠금 해제는 200ms 뒤 - 그 전에는 아직 잠겨 있다.
		expect(document.body.style.overflow).toBe("hidden");

		vi.advanceTimersByTime(200);

		expect(document.body.style.overflow).toBe("");
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("closeOnOverlay: false 면 오버레이 클릭으로 닫히지 않는다", () => {
		const onCancel = vi.fn();
		const alert = Alert({ title: "삭제", message: "정말?", closeOnOverlay: false, onCancel });

		(document.querySelector(".bt-alert__overlay") as HTMLElement).click();

		expect(onCancel).not.toHaveBeenCalled();

		// 이 케이스는 끝까지 열려 있으므로 직접 닫는다 - 안 닫으면 Alert 가 `document` 에 건
		// keydown 리스너와 스크롤 잠금이 파일 끝까지 남는다.
		alert?.close();
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
		const active = wrap.querySelector(".bt-dropdown__option.is-active");
		expect(active?.textContent).toBe("포도");
		// `nearest` - 필요한 만큼만 움직이고 페이지 스크롤은 건드리지 않는다.
		expect(scrolled.at(-1)).toEqual({ text: "포도", arg: { block: "nearest" } });

		vi.restoreAllMocks();
	});
});
