import { afterEach, describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Alert, Dropdown, init, Modal, Modal as ModalFactory } from "./bigtablet.js";
import {
	dropdownMarkup,
	key,
	pressEscape,
	resetVanillaDom,
	setDocumentScrolls,
	setGutterSupport,
	setViewportInset,
} from "./bigtablet.test-utils";

resetVanillaDom();

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

		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const b = mount("");
		Modal(b);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining("Modal: no accessible name"));
		warn.mockRestore();
		// 이름을 지어내지 않는다 (#896 - React Modal #473 과 같은 결론)
		expect(panelOf(b).hasAttribute("aria-label")).toBe(false);
		expect(panelOf(b).hasAttribute("aria-labelledby")).toBe(false);

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

describe("Modal - 점검 회귀 (#898)", () => {
	const mount = (panelHtml: string) => {
		document.body.innerHTML = `<button id="trigger" data-bt-modal-open="m">t</button><div id="m" class="bt-modal" data-bt-modal><div class="bt-modal__panel" aria-label="설정">${panelHtml}</div></div>`;
		return document.getElementById("m") as HTMLElement & { _btModal?: { open: () => void } };
	};

	it("초기 포커스는 본문 첫 컨트롤 - hidden input(_csrf)과 닫기 버튼보다 먼저", () => {
		const m = mount(
			'<button data-modal-close>x</button><div class="bt-modal__body"><form><input type="hidden" name="_csrf" value="t"><input id="first"></form></div>',
		);
		Modal(m)?.open();
		expect(document.activeElement?.id).toBe("first");
	});

	it("Tab 트랩이 hidden input 을 첫 항목으로 세지 않는다", () => {
		const m = mount(
			'<input type="hidden" name="_csrf"><button id="a">a</button><button id="b">b</button>',
		);
		Modal(m)?.open();
		expect(document.activeElement?.id).toBe("a");
		expect(
			key(document.activeElement as HTMLElement, "Tab", { shiftKey: true }).defaultPrevented,
		).toBe(true);
		expect(document.activeElement?.id).toBe("b");
	});

	it("자동 초기화 뒤 수동으로 만들면 교체되어 트리거가 새 인스턴스의 콜백을 부른다", () => {
		const m = mount("<button>x</button>");
		init();
		const onOpen = vi.fn();
		const manual = Modal(m, { onOpen });
		(document.getElementById("trigger") as HTMLButtonElement).click();
		expect(onOpen).toHaveBeenCalledTimes(1);
		expect(manual?.isOpen()).toBe(true);
		expect(m._btModal).toBe(manual);
		manual?.destroy();
		expect(m._btModal).toBeUndefined();
	});

	it("셀렉터로 무효한 id 의 트리거도 init 을 멈추지 않는다", () => {
		document.body.innerHTML = `<button data-bt-modal-open="123">t</button><div id="123" class="bt-modal" data-bt-modal><div class="bt-modal__panel" aria-label="x"><button>x</button></div></div><button class="bt-toggle" data-bt-toggle aria-label="t"></button>`;
		expect(() => init()).not.toThrow();
		expect(document.querySelector("[data-bt-toggle]")?.getAttribute("role")).toBe("switch");
		(document.querySelector("[data-bt-modal-open]") as HTMLButtonElement).click();
		expect(document.getElementById("123")?.classList.contains("is-open")).toBe(true);
	});
});
