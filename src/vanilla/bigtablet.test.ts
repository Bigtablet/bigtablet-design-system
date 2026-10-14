import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import {
	Alert,
	Dropdown,
	init,
	Modal,
	Modal as ModalFactory,
	Pagination,
	Toggle,
} from "./bigtablet.js";

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

const setViewportInset = (inset: number, options: { afterLock?: number } = {}) => {
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

	it("거터를 풀고 그 폭을 body padding 으로 지킨다 - 오버레이가 그 자리를 덮게", () => {
		// 거터가 남으면 그 자리는 캔버스가 칠해 딤이 못 덮는다. 색으로 흉내내던 방식은 배경이
		// 단색일 때만 맞았다(#635). React 번들과 같은 판정·같은 결과여야 한다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15, { afterLock: 0 });

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.style.paddingRight).toBe("15px");
		// 오버레이가 자기 정렬을 상쇄하는 데 쓴다.
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();

		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.body.style.paddingRight).toBe("");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
	});

	it("문서가 스크롤되지 않아도 예약된 거터는 회수한다", () => {
		// 스크롤 여부가 아니라 ICB 가 좁은지로 판단한다 - 앱이 예약해 둔 거터는 문서가
		// 스크롤되지 않아도 화면에 남고, 그대로면 오버레이가 그 자리를 못 덮는다 (React 쪽과 동일).
		setDocumentScrolls(false);
		setGutterSupport(true);
		setViewportInset(15, { afterLock: 0 });

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.style.paddingRight).toBe("15px");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();
	});

	it("clientWidth 가 거터를 감춰도 폭을 잰다", () => {
		// `scrollbar-gutter: stable` 에서 Chromium 은 clientWidth 를 innerWidth 와 같게 보고한다.
		// 옛 측정식은 0 을 내고 보정이 한 번도 걸리지 않았다 - 폭은 fixed 프로브로 잰다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		document.documentElement.style.scrollbarGutter = "stable";
		setViewportInset(15, { afterLock: 0 });
		vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1280);
		expect(window.innerWidth - document.documentElement.clientWidth).toBe(0);

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();
	});

	it("중첩 오버레이는 마지막 해제까지 잠금을 유지한다", () => {
		// 폭 보정 방식이 아니라 "마지막 해제까지 유지" 자체를 보는 테스트다. 보정이 남아 있는지는
		// 거터와 padding 으로 확인한다.
		setDocumentScrolls(true);
		setGutterSupport(true);
		setViewportInset(15, { afterLock: 0 });
		const a = Modal(modalMarkup("m1"));
		const b = Modal(modalMarkup("m2"));

		a?.open();
		b?.open();
		expect(document.body.dataset.btOpenModals).toBe("2");

		b?.close();
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.body.style.paddingRight).toBe("15px");

		a?.close();
		expect(document.body.style.overflow).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("");
		expect(document.body.style.paddingRight).toBe("");
	});

	it("Escape 는 최상단 오버레이만 닫는다 - Modal 위의 Alert", () => {
		// 오버레이마다 document 리스너를 걸면 Escape 한 번에 둘이 같이 닫혔다(실측). React 의
		// overlay-stack 과 같은 규약으로, 공유 스택의 최상단만 닫는다.
		setViewportInset(0);
		const m = Modal(modalMarkup("stack"));
		m?.open();
		Alert({ title: "confirm?" });
		expect(document.body.dataset.btOpenModals).toBe("2");

		pressEscape();
		expect(m?.isOpen()).toBe(true);

		pressEscape();
		expect(m?.isOpen()).toBe(false);
	});

	it("closeOnEscape: false 인 모달도 Escape 를 소비한다", () => {
		// 모달은 아래 오버레이를 비활성으로 덮는다. 스택에 등록하지 않으면 최상단이 아래 모달이
		// 되어, 위 모달을 열어 둔 채 Escape 한 번에 **뒤쪽**이 닫힌다.
		setViewportInset(0);
		const below = Modal(modalMarkup("below"));
		const above = Modal(modalMarkup("above"), { closeOnEscape: false });

		below?.open();
		above?.open();

		pressEscape();
		expect(above?.isOpen()).toBe(true);
		expect(below?.isOpen()).toBe(true);

		above?.close();
		pressEscape();
		expect(below?.isOpen()).toBe(false);
	});

	it("열린 채 destroy 하면 Escape 등록도 함께 빠진다", () => {
		// 등록이 남으면 스택 최상단이 파괴된 모달의 close 라 다음 Escape 에 그게 다시 돌고,
		// state.isOpen 이 true 라 가드를 통과해 unlockScroll 이 한 번 더 불린다 - 그 시점에
		// 진짜로 열려 있는 오버레이의 배경 스크롤이 조기에 풀린다.
		setViewportInset(0);
		const below = Modal(modalMarkup("below"));
		const zombie = Modal(modalMarkup("zombie"));

		below?.open();
		zombie?.open();
		zombie?.destroy();

		// destroy 가 자기 몫의 잠금만 반납한 상태 - below 는 아직 열려 있다.
		expect(document.body.dataset.btOpenModals).toBe("1");
		expect(document.body.style.overflow).toBe("hidden");

		// 등록이 남아 있으면 최상단이 파괴된 모달의 close 라, Escape 가 그것을 깨워 below 는
		// 열린 채로 두고 below 몫의 잠금만 반납한다. 등록이 빠졌으면 below 가 최상단이라 닫힌다.
		pressEscape();

		expect(below?.isOpen()).toBe(false);
		expect(document.body.dataset.btOpenModals).toBeUndefined();
		expect(document.body.style.overflow).toBe("");
	});

	it("열린 채 destroy 하면 포커스가 열기 전 요소로 돌아온다", () => {
		// close() 와 같은 정리를 타야 한다. 빠지면 포커스가 파괴된 패널 안에 남고, 소비자가
		// 그 DOM 을 지우는 순간 body 로 떨어져 다음 Tab 이 문서 처음부터 시작한다(WCAG 2.4.3).
		setViewportInset(0);
		const opener = document.createElement("button");
		opener.textContent = "열기";
		document.body.appendChild(opener);
		opener.focus();

		const m = Modal(modalMarkup());
		m?.open();
		expect(document.activeElement).not.toBe(opener);

		m?.destroy();
		expect(document.activeElement).toBe(opener);
	});

	it("열린 채 destroy 하면 is-open 도 걷어내고, 같은 DOM 으로 다시 만든 인스턴스가 정상 동작한다", () => {
		// is-open 이 남으면 모달이 화면에 열린 채 고정된다 - 리스너는 해제됐고, 새 인스턴스는
		// isOpen 이 false 로 시작해 close() 가드에 막혀 지울 길이 없다.
		setViewportInset(0);
		const el = modalMarkup();
		const onClose = vi.fn();

		const first = Modal(el, { onClose });
		first?.open();
		expect(el.classList.contains("is-open")).toBe(true);

		first?.destroy();
		expect(el.classList.contains("is-open")).toBe(false);
		// 바인딩 해제일 뿐 닫기가 아니다.
		expect(onClose).not.toHaveBeenCalled();

		const second = Modal(el);
		second?.open();
		expect(el.classList.contains("is-open")).toBe(true);
		second?.close();
		expect(el.classList.contains("is-open")).toBe(false);
	});

	it("안의 Dropdown 목록이 열려 있으면 Esc 는 목록만 닫고, 다음 Esc 가 모달을 닫는다", () => {
		// 목록은 preventDefault 로 "처리했다" 를 알린다 - 스택이 그 신호를 읽어야 한다(#697).
		// 닫힌 목록은 Escape 에 손대지 않아야 두 번째 Esc 가 모달에 닿는다.
		setViewportInset(0);
		const el = modalMarkup();
		const wrap = dropdownMarkup();
		el.querySelector(".bt-modal__panel")?.appendChild(wrap);
		const control = wrap.querySelector(".bt-dropdown__control") as HTMLButtonElement;
		const dd = Dropdown(wrap);
		const m = Modal(el);

		m?.open();
		dd?.open();
		expect(control.getAttribute("aria-expanded")).toBe("true");

		control.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
		);
		expect(control.getAttribute("aria-expanded")).toBe("false");
		expect(m?.isOpen()).toBe(true);

		control.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
		);
		expect(m?.isOpen()).toBe(false);
	});

	it("패널에 소비자가 준 tabindex 는 열고 닫아도 그대로다", () => {
		// 덮어쓰고 "우리가 붙였다" 로 표시하면 close()·destroy() 가 소비자 속성을 지운다.
		setViewportInset(0);
		const el = document.createElement("div");
		el.className = "bt-modal";
		el.innerHTML = '<div class="bt-modal__panel" tabindex="0"><p>본문만</p></div>';
		document.body.appendChild(el);
		const panel = el.querySelector(".bt-modal__panel");

		const m = Modal(el);
		m?.open();
		expect(panel?.getAttribute("tabindex")).toBe("0");
		expect(document.activeElement).toBe(panel);

		m?.close();
		expect(panel?.getAttribute("tabindex")).toBe("0");
	});

	it("focusable 없는 패널을 열고 destroy 하면 우리가 붙인 tabindex 를 남기지 않는다", () => {
		// 남으면 같은 DOM 으로 다시 만든 Modal 이 "원래 있던 tabindex" 로 오인해 close() 도
		// 지우지 않는다.
		setViewportInset(0);
		const el = document.createElement("div");
		el.className = "bt-modal";
		el.innerHTML = '<div class="bt-modal__panel"><p>본문만</p></div>';
		document.body.appendChild(el);
		const panel = el.querySelector(".bt-modal__panel");

		const m = Modal(el);
		m?.open();
		expect(panel?.getAttribute("tabindex")).toBe("-1");

		m?.destroy();
		expect(panel?.hasAttribute("tabindex")).toBe(false);
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

// ── 뮤테이션 테스트(`pnpm test:mutation`)에서 살아남거나 실행되지 않던 분기 ──────────

const key = (target: EventTarget, k: string, init: KeyboardEventInit = {}) => {
	const event = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init });
	target.dispatchEvent(event);
	return event;
};

describe("Pagination", () => {
	const mount = (page: number, totalPages: number, onPageChange?: (p: number) => void) => {
		const el = document.createElement("nav");
		el.className = "bt-pagination";
		document.body.appendChild(el);
		return { el, api: Pagination(el, { page, totalPages, onPageChange }) };
	};
	const labels = (el: HTMLElement) =>
		Array.from(el.querySelectorAll(".bt-pagination__pages > *"), (n) =>
			n.classList.contains("bt-pagination__ellipsis") ? "…" : (n.textContent ?? "").trim(),
		);

	it("lists every page up to 7 and collapses with ellipses beyond", () => {
		expect(labels(mount(1, 7).el)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
		expect(labels(mount(4, 20).el)).toEqual(["1", "2", "3", "4", "5", "…", "20"]);
		expect(labels(mount(5, 20).el)).toEqual(["1", "…", "3", "4", "5", "6", "7", "…", "20"]);
		expect(labels(mount(16, 20).el)).toEqual(["1", "…", "14", "15", "16", "17", "18", "…", "20"]);
		expect(labels(mount(17, 20).el)).toEqual(["1", "…", "16", "17", "18", "19", "20"]);
	});

	it("marks the current page and disables prev/next at the ends", () => {
		const { el } = mount(1, 3);
		const current = el.querySelector('[aria-current="page"]');
		expect(current?.textContent?.trim()).toBe("1");
		expect(current).toHaveClass("bt-pagination__page--active");
		expect(el.querySelectorAll(".bt-pagination__page--active")).toHaveLength(1);
		expect(el.querySelector<HTMLButtonElement>('[data-action="prev"]')?.disabled).toBe(true);
		expect(el.querySelector<HTMLButtonElement>('[data-action="next"]')?.disabled).toBe(false);

		const last = mount(3, 3).el;
		expect(last.querySelector<HTMLButtonElement>('[data-action="prev"]')?.disabled).toBe(false);
		expect(last.querySelector<HTMLButtonElement>('[data-action="next"]')?.disabled).toBe(true);
	});

	it("moves by page buttons and prev/next, reporting each change once", () => {
		const onPageChange = vi.fn();
		const { el, api } = mount(2, 5, onPageChange);
		el.querySelector<HTMLButtonElement>('[data-page="4"]')?.click();
		expect(api?.getPage()).toBe(4);
		el.querySelector<HTMLButtonElement>('[data-action="next"]')?.click();
		expect(api?.getPage()).toBe(5);
		el.querySelector<HTMLButtonElement>('[data-action="prev"]')?.click();
		expect(api?.getPage()).toBe(4);
		expect(onPageChange.mock.calls.map(([p]) => p)).toEqual([4, 5, 4]);
	});

	it("ignores setPage outside the range or on the current page", () => {
		const onPageChange = vi.fn();
		const { api } = mount(2, 5, onPageChange);
		api?.setPage(0);
		api?.setPage(6);
		api?.setPage(2);
		expect(api?.getPage()).toBe(2);
		expect(onPageChange).not.toHaveBeenCalled();
		api?.setPage(1);
		api?.setPage(5);
		expect(onPageChange.mock.calls.map(([p]) => p)).toEqual([1, 5]);
	});

	it("clamps the page when the total shrinks and accepts a selector", () => {
		const { el, api } = mount(5, 5);
		api?.setTotalPages(3);
		expect(api?.getPage()).toBe(3);
		expect(labels(el)).toEqual(["1", "2", "3"]);
		api?.setTotalPages(10);
		expect(api?.getPage()).toBe(3);

		el.id = "pg";
		expect(Pagination("#pg", { totalPages: 2 })?.getPage()).toBe(1);
		expect(Pagination("#missing")).toBeNull();
	});
});

describe("init", () => {
	it("binds data-bt-* elements once, including modal triggers and pagination attributes", () => {
		document.body.innerHTML = `
			<div class="bt-dropdown" data-bt-dropdown>
				<button type="button" class="bt-dropdown__control"></button>
				<ul class="bt-dropdown__list"><li class="bt-dropdown__option" data-value="a">A</li></ul>
			</div>
			<button id="opener" data-bt-modal-open="m">open</button>
			<div id="m" class="bt-modal" data-bt-modal><div class="bt-modal__panel"><button>x</button></div></div>
			<button class="bt-toggle" data-bt-toggle></button>
			<nav class="bt-pagination" data-bt-pagination data-page="3" data-total-pages="9"></nav>
			<nav id="p2" class="bt-pagination" data-bt-pagination></nav>`;
		init();
		init();

		type Bound = HTMLElement & Record<string, { getPage?: () => number } | undefined>;
		const $el = (sel: string) => document.querySelector(sel) as Bound;
		expect($el("[data-bt-dropdown]")._btDropdown).toBeTruthy();
		expect($el("[data-bt-toggle]")._btToggle).toBeTruthy();
		expect($el("[data-bt-toggle]").getAttribute("role")).toBe("switch");
		expect($el("[data-bt-pagination]")._btPagination?.getPage?.()).toBe(3);
		expect($el("#p2")._btPagination?.getPage?.()).toBe(1);

		const modal = $el("#m");
		const opener = $el("#opener");
		expect(opener.dataset.btBound).toBe("true");
		const open = vi.spyOn(modal._btModal as unknown as { open: () => void }, "open");
		// 두 번 init 해도 리스너는 하나다
		opener.click();
		expect(open).toHaveBeenCalledTimes(1);
		expect(modal.classList.contains("is-open")).toBe(true);
		(modal._btModal as unknown as { destroy: () => void }).destroy();
	});
});

describe("Toggle - 초기화 · API", () => {
	const mount = (html = '<button class="bt-toggle"></button>') => {
		document.body.innerHTML = `<form>${html}</form>`;
		return document.querySelector(".bt-toggle") as HTMLButtonElement;
	};

	it("adds switch semantics and type=button without overriding consumer values", () => {
		const el = mount();
		Toggle(el);
		expect(el.getAttribute("role")).toBe("switch");
		expect(el.getAttribute("type")).toBe("button");
		expect(el.getAttribute("aria-checked")).toBe("false");
		expect(el.classList.contains("bt-toggle--on")).toBe(false);

		const custom = mount('<button class="bt-toggle" role="checkbox" type="submit"></button>');
		Toggle(custom);
		expect(custom.getAttribute("role")).toBe("checkbox");
		expect(custom.getAttribute("type")).toBe("submit");
	});

	it("starts on from defaultChecked or the on class", () => {
		const a = mount();
		expect(Toggle(a, { defaultChecked: true })?.isChecked()).toBe(true);
		expect(a.classList.contains("bt-toggle--on")).toBe(true);
		expect(a.getAttribute("aria-checked")).toBe("true");

		const b = mount('<button class="bt-toggle bt-toggle--on"></button>');
		expect(Toggle(b)?.isChecked()).toBe(true);
	});

	it("creates a sibling hidden input for a named button and keeps it in sync", () => {
		const el = mount();
		const api = Toggle(el, { name: "agree" });
		const input = el.nextElementSibling as HTMLInputElement;
		expect(input.tagName).toBe("INPUT");
		expect(input.type).toBe("hidden");
		expect(input.name).toBe("agree");
		expect(input.value).toBe("false");
		expect(el.querySelector("input")).toBeNull();
		api?.setChecked(true);
		expect(input.value).toBe("true");
		expect(el.getAttribute("aria-checked")).toBe("true");
	});

	it("appends the hidden input inside a non-button toggle and reads data-name", () => {
		const el = mount('<div class="bt-toggle" data-name="dark"></div>');
		Toggle(el);
		expect(el.querySelector<HTMLInputElement>('input[type="hidden"]')?.name).toBe("dark");
	});

	it("reuses a server-rendered sibling input and reads lenient on values", () => {
		for (const raw of ["true", "1", "on", "y", "YES "]) {
			const el = mount(
				`<button class="bt-toggle" data-name="n"></button><input type="hidden" name="other" value="true"><input type="hidden" name="n" value="${raw}">`,
			);
			expect(Toggle(el)?.isChecked()).toBe(true);
			expect(document.querySelectorAll('input[name="n"]')).toHaveLength(1);
			expect(document.querySelector<HTMLInputElement>('input[name="n"]')?.value).toBe("true");
			expect(document.querySelector<HTMLInputElement>('input[name="other"]')?.value).toBe("true");
		}
		const off = mount(
			'<button class="bt-toggle" data-name="n"></button><input type="hidden" name="n" value="no">',
		);
		expect(Toggle(off)?.isChecked()).toBe(false);
	});

	it("toggles, disables and unbinds through the API", () => {
		const onCheckedChange = vi.fn();
		const el = mount();
		const api = Toggle(el, { onCheckedChange });
		api?.toggle();
		expect(api?.isChecked()).toBe(true);
		api?.setDisabled(true);
		expect(el.disabled).toBe(true);
		api?.toggle();
		expect(api?.isChecked()).toBe(true);
		api?.setDisabled(false);
		api?.destroy();
		el.click();
		expect(api?.isChecked()).toBe(true);
		expect(onCheckedChange).toHaveBeenCalledTimes(1);
		expect(Toggle("#missing")).toBeNull();
	});
});

describe("Modal - ARIA · 포커스 · 닫기 경로", () => {
	// 열린 채 남은 모달의 document Tab 트랩이 다음 테스트의 키 이벤트를 막지 않게 해제한다.
	const created: { destroy: () => void }[] = [];
	const Modal = (...args: Parameters<typeof ModalFactory>) => {
		const api = ModalFactory(...args);
		if (api) created.push(api);
		return api;
	};
	afterEach(() => {
		for (const api of created.splice(0)) api.destroy();
	});
	const mount = (panelHtml: string, attrs = "") => {
		document.body.innerHTML = `<button id="trigger">t</button><div id="m" class="bt-modal"><div class="bt-modal__panel" ${attrs}>${panelHtml}</div></div>`;
		return document.getElementById("m") as HTMLElement;
	};
	const panelOf = (m: HTMLElement) => m.querySelector(".bt-modal__panel") as HTMLElement;

	it("names the dialog from its header, falls back to a label, and keeps a consumer name", () => {
		const a = mount('<div class="bt-modal__header">제목</div>');
		Modal(a);
		const header = a.querySelector(".bt-modal__header") as HTMLElement;
		expect(panelOf(a).getAttribute("role")).toBe("dialog");
		expect(panelOf(a).getAttribute("aria-modal")).toBe("true");
		expect(header.id).not.toBe("");
		expect(panelOf(a).getAttribute("aria-labelledby")).toBe(header.id);

		const b = mount("");
		Modal(b);
		expect(panelOf(b).getAttribute("aria-label")).toBe("Dialog");

		const c = mount('<div class="bt-modal__header" id="keep">x</div>', 'aria-label="설정"');
		Modal(c);
		expect(panelOf(c).getAttribute("aria-label")).toBe("설정");
		expect(panelOf(c).hasAttribute("aria-labelledby")).toBe(false);
	});

	it("focuses the first control, traps Tab both ways, and leaves middle Tabs alone", () => {
		const m = mount('<button id="a">a</button><button id="b">b</button><button id="c">c</button>');
		const api = Modal(m);
		api?.open();
		const [a, b, c] = ["a", "b", "c"].map((id) => document.getElementById(id) as HTMLElement);
		expect(document.activeElement).toBe(a);

		expect(key(a as HTMLElement, "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(c);
		expect(key(c as HTMLElement, "Tab").defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(a);

		(b as HTMLElement).focus();
		expect(key(b as HTMLElement, "Tab").defaultPrevented).toBe(false);
		expect(key(b as HTMLElement, "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
		expect(key(b as HTMLElement, "Enter").defaultPrevented).toBe(false);
	});

	it("blocks Tab in a panel without focusables and ignores keys while closed", () => {
		const m = mount("<p>본문</p>");
		const api = Modal(m);
		expect(key(document.body, "Tab").defaultPrevented).toBe(false);
		api?.open();
		expect(key(document.body, "Tab").defaultPrevented).toBe(true);
	});

	it("closes from the overlay only, from close buttons, and reports open/close", () => {
		const onOpen = vi.fn();
		const onClose = vi.fn();
		const m = mount("<button data-modal-close>닫기</button>");
		const api = Modal(m, { onOpen, onClose });
		api?.toggle();
		expect(api?.isOpen()).toBe(true);
		expect(onOpen).toHaveBeenCalledTimes(1);

		panelOf(m).click();
		expect(api?.isOpen()).toBe(true);
		m.click();
		expect(api?.isOpen()).toBe(false);
		expect(onClose).toHaveBeenCalledTimes(1);

		api?.open();
		m.querySelector<HTMLButtonElement>("[data-modal-close]")?.click();
		expect(api?.isOpen()).toBe(false);
		api?.close();
		expect(onClose).toHaveBeenCalledTimes(2);

		api?.toggle();
		api?.toggle();
		expect(api?.isOpen()).toBe(false);
	});

	it("restores focus to the opener on close and keeps open when closeOnOverlay is false", () => {
		const m = mount("<button>x</button>");
		const trigger = document.getElementById("trigger") as HTMLElement;
		trigger.focus();
		const api = Modal("#m", { closeOnOverlay: false });
		api?.open();
		m.click();
		expect(api?.isOpen()).toBe(true);
		api?.close();
		expect(document.activeElement).toBe(trigger);
		expect(Modal("#missing")).toBeNull();
	});
});

describe("Alert - 마크업 · 버튼", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const overlay = () => document.querySelector(".bt-alert__overlay") as HTMLElement;

	it("escapes text, wires ARIA ids, and focuses confirm", () => {
		Alert({ title: "<b>제목</b>", message: "<i>내용</i>", variant: "error" });
		const panel = overlay().querySelector(".bt-alert__modal") as HTMLElement;
		const title = overlay().querySelector(".bt-alert__title") as HTMLElement;
		const message = overlay().querySelector(".bt-alert__message") as HTMLElement;
		expect(overlay()).toHaveClass("bt-alert--error", "is-open");
		expect(title.textContent).toBe("<b>제목</b>");
		expect(panel.getAttribute("role")).toBe("alertdialog");
		expect(panel.getAttribute("aria-modal")).toBe("true");
		expect(panel.getAttribute("aria-labelledby")).toBe(title.id);
		expect(panel.getAttribute("aria-describedby")).toBe(message.id);
		expect(document.activeElement).toBe(overlay().querySelector("[data-alert-confirm]"));
	});

	it("omits the title and cancel button by default and aligns actions", () => {
		Alert({ message: "m" });
		expect(overlay().querySelector(".bt-alert__title")).toBeNull();
		expect(overlay().querySelector(".bt-alert__modal")?.hasAttribute("aria-labelledby")).toBe(
			false,
		);
		expect(overlay().querySelector("[data-alert-cancel]")).toBeNull();
		expect(overlay().querySelector<HTMLElement>(".bt-alert__actions")?.style.justifyContent).toBe(
			"flex-end",
		);
		expect(overlay().querySelector("[data-alert-confirm]")).not.toHaveClass("bt-button--danger");

		for (const [align, css] of [
			["left", "flex-start"],
			["center", "center"],
		] as const) {
			document.body.innerHTML = "";
			Alert({ message: "m", actionsAlign: align });
			expect(overlay().querySelector<HTMLElement>(".bt-alert__actions")?.style.justifyContent).toBe(
				css,
			);
		}
	});

	it("routes confirm and cancel to their callbacks and removes the overlay after the fade", () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		Alert({
			message: "m",
			showCancel: true,
			destructive: true,
			confirmText: "삭제",
			cancelText: "취소",
			onConfirm,
			onCancel,
		});
		const confirm = overlay().querySelector("[data-alert-confirm]") as HTMLButtonElement;
		expect(confirm).toHaveClass("bt-button--danger", "bt-button--filled");
		expect(overlay().querySelector("[data-alert-cancel]")).toHaveClass("bt-button--outline");
		confirm.click();
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).not.toHaveBeenCalled();
		vi.advanceTimersByTime(200);
		expect(document.querySelector(".bt-alert__overlay")).toBeNull();

		Alert({ message: "m", showCancel: true, onConfirm, onCancel });
		(overlay().querySelector("[data-alert-cancel]") as HTMLButtonElement).click();
		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("traps Tab between its buttons", () => {
		Alert({ message: "m", showCancel: true });
		const cancel = overlay().querySelector("[data-alert-cancel]") as HTMLElement;
		const confirm = overlay().querySelector("[data-alert-confirm]") as HTMLElement;
		expect(key(confirm, "Tab").defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(cancel);
		expect(key(cancel, "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(confirm);
		expect(key(confirm, "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
	});

	it("stops trapping after close", () => {
		const { close } = Alert({ message: "m" });
		close();
		expect(key(document.body, "Tab").defaultPrevented).toBe(false);
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
