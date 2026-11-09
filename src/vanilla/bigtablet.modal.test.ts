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
	// 열린 채 끝난 Modal 의 document 리스너·Escape 스택이 다음 테스트로 새지 않게
	afterEach(() => {
		for (const m of document.querySelectorAll<HTMLElement & { _btModal?: { destroy: () => void } }>(
			".bt-modal",
		)) {
			m._btModal?.destroy();
		}
	});

	const mount = (panelHtml: string) => {
		document.body.innerHTML = `<button id="trigger" data-bt-modal-open="m">t</button><div id="m" class="bt-modal" data-bt-modal><div class="bt-modal__panel" aria-label="설정">${panelHtml}</div></div>`;
		return document.getElementById("m") as HTMLElement & { _btModal?: { open: () => void } };
	};

	it("초기 포커스는 본문 첫 컨트롤 - hidden input(_csrf)과 닫기 버튼보다 먼저", () => {
		const m = mount(
			'<button data-modal-close>x</button><div class="bt-modal__body"><form><input type="hidden" name="_csrf" value="t" tabindex="0"><input id="first"></form></div>',
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

describe("Modal - 서버가 열린 채로 그린 모달 (#919)", () => {
	const openMarkup = () => {
		const el = document.createElement("div");
		el.className = "bt-modal is-open";
		el.setAttribute("data-bt-modal", "");
		el.innerHTML =
			'<div class="bt-modal__panel"><div class="bt-modal__header">수정</div>' +
			'<div class="bt-modal__body"><input id="name"></div>' +
			'<button data-modal-close aria-label="닫기">×</button></div>';
		document.body.appendChild(el);
		return el;
	};

	it("is-open 으로 그린 모달을 열린 상태로 시작한다 - 잠금 · 포커스까지", () => {
		setViewportInset(0);
		const m = Modal(openMarkup());

		expect(m?.isOpen()).toBe(true);
		expect(document.body.dataset.btOpenModals).toBe("1");
		expect(document.activeElement?.id).toBe("name");
	});

	it("자동 초기화된 열린 모달이 Escape · 바깥 클릭 · 닫기 버튼으로 닫힌다", () => {
		setViewportInset(0);
		const el = openMarkup();
		init();
		const reopen = () => (el as HTMLElement & { _btModal?: { open: () => void } })._btModal?.open();

		pressEscape();
		expect(el.classList.contains("is-open")).toBe(false);
		expect(document.body.dataset.btOpenModals).toBeUndefined();

		reopen();
		el.click();
		expect(el.classList.contains("is-open")).toBe(false);

		reopen();
		(el.querySelector("[data-modal-close]") as HTMLElement).click();
		expect(el.classList.contains("is-open")).toBe(false);
	});

	it("열린 채 자동 초기화된 모달을 수동으로 다시 만들어도 열린 채로 남는다", () => {
		setViewportInset(0);
		const el = openMarkup();
		init();
		const onClose = vi.fn();

		const m = Modal(el, { onClose });
		expect(m?.isOpen()).toBe(true);
		expect(el.classList.contains("is-open")).toBe(true);
		// 잠금 카운터가 교체 중에 새지 않는다
		expect(document.body.dataset.btOpenModals).toBe("1");

		pressEscape();
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("생성 중에 열리면 onOpen 은 반환값을 쓸 수 있게 한 박자 뒤에 부른다", async () => {
		setViewportInset(0);
		const seen: boolean[] = [];
		const m = Modal(openMarkup(), { onOpen: () => seen.push(m?.isOpen() ?? false) });

		expect(seen).toEqual([]);
		await Promise.resolve();
		expect(seen).toEqual([true]);
	});
});

describe("Modal - 퇴출 모션 (#913)", () => {
	// jsdom 에는 Web Animations 가 없다 - 닫힘 표시가 붙은 요소에 퇴출 transition 이 도는 것처럼 세운다.
	function stubExitAnimation() {
		let done = () => {};
		const finished = new Promise<void>((resolve) => {
			done = resolve;
		});
		if (!("getAnimations" in HTMLElement.prototype)) {
			Object.defineProperty(HTMLElement.prototype, "getAnimations", {
				configurable: true,
				writable: true,
				value: () => [],
			});
		}
		vi.spyOn(HTMLElement.prototype, "getAnimations").mockImplementation(function (
			this: HTMLElement,
		) {
			return this.dataset.state === "closed" ? [{ finished } as unknown as Animation] : [];
		});
		return { done: () => done() };
	}

	const mount = () => {
		const el = document.createElement("div");
		el.className = "bt-modal";
		el.innerHTML =
			'<div class="bt-modal__panel" aria-label="편집"><div class="bt-modal__body"><input></div></div>';
		document.body.appendChild(el);
		return el;
	};

	it("퇴출 모션이 끝날 때까지 is-open · 잠금을 유지하고, 끝나면 걷고 onExited 를 부른다", async () => {
		setViewportInset(0);
		const anim = stubExitAnimation();
		const onClose = vi.fn();
		const onExited = vi.fn();
		const el = mount();
		const m = Modal(el, { onClose, onExited });
		m?.open();

		m?.close();
		// onClose 는 닫기를 시작할 때 바로 (예전과 같다)
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(m?.isOpen()).toBe(false);
		expect(el.classList.contains("is-open")).toBe(true);
		expect(el.dataset.state).toBe("closed");
		expect(el.querySelector<HTMLElement>(".bt-modal__panel")?.dataset.state).toBe("closed");
		expect(el.hasAttribute("inert")).toBe(true);
		expect(document.body.dataset.btOpenModals).toBe("1");
		expect(onExited).not.toHaveBeenCalled();

		anim.done();
		await vi.waitFor(() => expect(el.classList.contains("is-open")).toBe(false));
		expect(el.dataset.state).toBeUndefined();
		expect(el.hasAttribute("inert")).toBe(false);
		expect(document.body.dataset.btOpenModals).toBeUndefined();
		expect(onExited).toHaveBeenCalledTimes(1);
	});

	it("닫히는 중 다시 열면 대기를 버리고 열린 채로 남는다 - 잠금은 한 번만", async () => {
		setViewportInset(0);
		const anim = stubExitAnimation();
		const onExited = vi.fn();
		const el = mount();
		const m = Modal(el, { onExited });
		m?.open();
		m?.close();

		m?.open();
		expect(el.dataset.state).toBeUndefined();
		expect(el.hasAttribute("inert")).toBe(false);
		expect(document.body.dataset.btOpenModals).toBe("1");

		anim.done();
		await Promise.resolve();
		await Promise.resolve();
		expect(el.classList.contains("is-open")).toBe(true);
		expect(onExited).not.toHaveBeenCalled();

		m?.close();
		await vi.waitFor(() => expect(document.body.dataset.btOpenModals).toBeUndefined());
	});

	it("닫히는 중 destroy 하면 기다리지 않고 바로 걷는다", () => {
		setViewportInset(0);
		const anim = stubExitAnimation();
		const onExited = vi.fn();
		const el = mount();
		const m = Modal(el, { onExited });
		m?.open();
		m?.close();

		m?.destroy();
		expect(el.classList.contains("is-open")).toBe(false);
		expect(el.dataset.state).toBeUndefined();
		expect(document.body.dataset.btOpenModals).toBeUndefined();
		anim.done();
		expect(onExited).not.toHaveBeenCalled();
	});

	it("열린 채 destroy 도 기다리지 않는다", () => {
		setViewportInset(0);
		stubExitAnimation();
		const el = mount();
		const m = Modal(el);
		m?.open();

		m?.destroy();
		expect(el.classList.contains("is-open")).toBe(false);
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("돌고 있는 모션이 없으면(reduced-motion) 바로 걷고 onExited 도 바로 부른다", () => {
		setViewportInset(0);
		const onExited = vi.fn();
		const el = mount();
		const m = Modal(el, { onExited });
		m?.open();

		m?.close();
		expect(el.classList.contains("is-open")).toBe(false);
		expect(onExited).toHaveBeenCalledTimes(1);
	});
});

// 감사에서 나온 포커스 트랩 · 닫힘 결함 (#973)
describe("Modal · Alert - 포커스 트랩 · 닫힘 (#973)", () => {
	const closers: Array<() => void> = [];
	const alert = (options: Parameters<typeof Alert>[0]) => {
		const a = Alert(options);
		closers.push(a.close);
		return a;
	};
	afterEach(() => {
		for (const close of closers.splice(0)) close();
		document.body.innerHTML = "";
	});
	const mount = (inner: string) => {
		const el = document.createElement("div");
		el.className = "bt-modal";
		el.innerHTML = `<div class="bt-modal__panel" aria-label="m">${inner}</div>`;
		document.body.appendChild(el);
		return el;
	};
	const pageButton = () => {
		const b = document.createElement("button");
		document.body.appendChild(b);
		b.focus();
		return b;
	};

	it("패널에서 누르고 딤에서 뗀 click 은 닫지 않는다", () => {
		const el = mount("<input>");
		const m = Modal(el);
		m?.open();
		const input = el.querySelector("input") as HTMLElement;
		input.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(m?.isOpen()).toBe(true);
		el.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(m?.isOpen()).toBe(false);
	});

	it("Tab 트랩이 숨은 버튼을 건너뛴다", () => {
		const el = mount('<button id="a">a</button><button hidden>숨김</button>');
		Modal(el)?.open();
		const a = el.querySelector("#a") as HTMLElement;
		expect(document.activeElement).toBe(a);
		expect(key(a, "Tab").defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(a);
	});

	it("포커스가 패널 자체일 때 Shift+Tab 은 마지막 요소로 간다", () => {
		const el = mount("<p>본문</p>");
		Modal(el)?.open();
		const panel = el.querySelector(".bt-modal__panel") as HTMLElement;
		expect(document.activeElement).toBe(panel);
		panel.insertAdjacentHTML("beforeend", '<button id="late">늦게</button>');
		expect(key(panel, "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
		expect(document.activeElement?.id).toBe("late");
	});

	it("아래 Modal 이 위에 뜬 Alert 의 Tab 을 막지 않는다", () => {
		Modal(mount("<p>텍스트만</p>"))?.open();
		alert({ message: "m", showCancel: true });
		const cancel = document.querySelector("[data-alert-cancel]") as HTMLElement;
		expect(document.activeElement).toBe(cancel);
		expect(key(cancel, "Tab").defaultPrevented).toBe(false);
	});

	it("Alert onConfirm 에서 연 Modal 은 닫을 때 원래 트리거로 돌아간다", () => {
		const trigger = pageButton();
		const m = Modal(mount("<input>"));
		alert({ message: "열까요?", onConfirm: () => m?.open() });
		(document.querySelector("[data-alert-confirm]") as HTMLElement).click();
		m?.close();
		expect(document.activeElement).toBe(trigger);
	});

	it("나중에 넣은 닫기 버튼도 닫고, 안쪽 모달의 닫기는 바깥 모달을 닫지 않는다", () => {
		const outer = mount(
			'<div class="bt-modal" id="inner"><div class="bt-modal__panel" aria-label="i"></div></div>',
		);
		const o = Modal(outer);
		const i = Modal(outer.querySelector("#inner") as HTMLElement);
		o?.open();
		i?.open();
		const innerPanel = outer.querySelector("#inner .bt-modal__panel") as HTMLElement;
		innerPanel.insertAdjacentHTML("beforeend", "<button data-modal-close>닫기</button>");
		(innerPanel.querySelector("[data-modal-close]") as HTMLElement).click();
		expect(i?.isOpen()).toBe(false);
		expect(o?.isOpen()).toBe(true);
	});

	it("type 없는 닫기 버튼이 폼을 제출하지 않는다", () => {
		const el = mount("<form><button data-modal-close>취소</button></form>");
		const m = Modal(el);
		m?.open();
		const submit = vi.fn((e: Event) => e.preventDefault());
		el.querySelector("form")?.addEventListener("submit", submit);
		const click = new MouseEvent("click", { bubbles: true, cancelable: true });
		el.querySelector("[data-modal-close]")?.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(true);
		expect(m?.isOpen()).toBe(false);
	});

	it("destroy 뒤 data-bt-modal-open 트리거를 눌러도 에러가 없다", () => {
		const el = mount("<p>x</p>");
		el.id = "dm";
		const btn = document.createElement("button");
		btn.dataset.btModalOpen = "dm";
		document.body.appendChild(btn);
		Modal(el);
		init();
		el._btModal?.destroy();
		// 리스너 안의 예외는 click() 밖으로 나오지 않는다 - window error 로 잡는다
		const errors: unknown[] = [];
		const onError = (e: ErrorEvent) => {
			errors.push(e.error);
			e.preventDefault();
		};
		window.addEventListener("error", onError);
		btn.click();
		window.removeEventListener("error", onError);
		expect(errors).toEqual([]);
	});
});

describe("Alert - 콜백 예외 · 초기 포커스 · 겹침 (#973)", () => {
	afterEach(() => {
		document.querySelectorAll<HTMLElement>(".bt-alert__overlay").forEach((o) => {
			(o.querySelector("[data-alert-cancel], [data-alert-confirm]") as HTMLElement | null)?.click();
		});
		document.body.innerHTML = "";
	});

	it("onConfirm 이 throw 해도 닫히고 다시 부르지 않는다", () => {
		const onConfirm = vi.fn(() => {
			throw new Error("boom");
		});
		Alert({ message: "m", onConfirm });
		const confirm = document.querySelector("[data-alert-confirm]") as HTMLElement;
		// 리스너 안의 예외는 click() 밖으로 나오지 않고 window error 로 보고된다
		const swallow = (e: ErrorEvent) => e.preventDefault();
		window.addEventListener("error", swallow);
		confirm.click();
		confirm.click();
		window.removeEventListener("error", swallow);
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(document.querySelector(".bt-alert__overlay")).toBeNull();
		expect(document.body.dataset.btOpenModals).toBeUndefined();
	});

	it("destructive 확인 대화상자는 취소에 포커스를 둔다", () => {
		Alert({ message: "삭제할까요?", showCancel: true, destructive: true });
		expect(document.activeElement).toBe(document.querySelector("[data-alert-cancel]"));
	});

	it("패널에서 누르고 딤에서 뗀 click 은 닫지 않는다", () => {
		Alert({ message: "m" });
		const overlay = document.querySelector(".bt-alert__overlay") as HTMLElement;
		overlay
			.querySelector(".bt-alert__modal")
			?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
		overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(overlay.isConnected).toBe(true);
	});

	it("겹친 Alert 중 위쪽을 닫으면 아래 Alert 로 돌아간다", () => {
		const trigger = document.createElement("button");
		document.body.appendChild(trigger);
		trigger.focus();
		Alert({ message: "A" });
		const aConfirm = document.activeElement;
		const b = Alert({ message: "B" });
		b.close();
		expect(document.activeElement).toBe(aConfirm);
	});
});
