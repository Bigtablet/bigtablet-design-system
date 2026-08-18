import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Alert, Dropdown, Modal, Toggle } from "./bigtablet.js";

/** jsdom 은 레이아웃을 하지 않아 스크롤바 폭이 항상 0 이다. 있는 상황을 직접 세운다. */
const setScrollbarWidth = (width: number) => {
	Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true, writable: true });
	vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1280 - width);
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
		setScrollbarWidth(0);
		const m = Modal(modalMarkup());

		m?.open();
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.btOpenModals).toBe("1");

		m?.close();
		expect(document.body.style.overflow).toBe("");
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("스크롤바 폭을 보정하고 stable 거터를 놓는다", () => {
		document.documentElement.style.scrollbarGutter = "stable";
		setScrollbarWidth(15);

		const m = Modal(modalMarkup());
		m?.open();

		expect(document.body.style.paddingRight).toBe("15px");
		expect(document.documentElement.style.scrollbarGutter).toBe("auto");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("15px");

		m?.close();

		expect(document.body.style.paddingRight).toBe("");
		expect(document.documentElement.style.scrollbarGutter).toBe("stable");
		expect(document.documentElement.style.getPropertyValue("--bt-scrollbar-width")).toBe("");
	});

	it("중첩 오버레이는 마지막 해제까지 잠금을 유지한다", () => {
		setScrollbarWidth(15);
		const a = Modal(modalMarkup("m1"));
		const b = Modal(modalMarkup("m2"));

		a?.open();
		b?.open();
		expect(document.body.dataset.btOpenModals).toBe("2");

		b?.close();
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.style.paddingRight).toBe("15px");

		a?.close();
		expect(document.body.style.overflow).toBe("");
	});

	it("이미 열린 모달을 다시 열어도 카운터가 중복 증가하지 않는다", () => {
		setScrollbarWidth(0);
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
		setScrollbarWidth(0);
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
});
