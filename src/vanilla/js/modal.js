import { afterExit, lockScroll, ownsFocus, pushEscape, unlockScroll } from "./overlay.js";
import { $, focusablesIn, generateId, on, returnFocusTarget, trapTab } from "./utils.js";

/* ========================================
     Modal Component
     ======================================== */

/**
 * Initialize Modal component
 * @param {HTMLElement|string} element - Modal element or selector
 * @param {Object} options - Configuration options
 */
export function Modal(element, options = {}) {
	const modal = typeof element === "string" ? $(element) : element;
	if (!modal) return null;
	// 서버가 열린 채로 그렸거나(`.bt-modal.is-open` - 폼 재표시 · `?edit=`) 열려 있던 인스턴스를
	// 교체하는 중이면, 아래에서 open() 경로로 다시 연다 (#919). 클래스만 보고 닫힌 것으로 알면
	// 화면엔 열려 있는데 close() 가드에 막혀 닫히지 않고 잠금 · 포커스 · Escape 도 없다.
	const startsOpen = modal._btModal?.isOpen() ?? modal.classList.contains("is-open");
	// 같은 요소에 두 번 만들면(자동 초기화 + 수동 호출) 앞 인스턴스를 풀고 교체한다 - 리스너가
	// 겹치고 data-bt-modal-open 트리거가 콜백 없는 쪽을 여는 것을 막는다.
	modal._btModal?.destroy();

	const config = {
		closeOnOverlay: true,
		closeOnEscape: true,
		onOpen: null,
		onClose: null,
		// 퇴출 모션이 끝나 화면에서 사라진 뒤 - React Modal 의 onExited 와 같다. onClose 는 닫기를
		// 시작할 때 바로 불린다(예전과 같음)
		onExited: null,
		...options,
	};

	const state = {
		isOpen: false,
	};

	const panel = modal.querySelector(".bt-modal__panel");
	let previousFocus = null;
	let panelTabindexAdded = false;
	let popEscape = null;
	// 스크롤 잠금은 퇴출 모션이 끝난 뒤 푼다(#541) - 닫히는 중엔 isOpen 은 false 인데 잠금은 남아 있다.
	let locked = false;
	// 진행 중인 퇴출 대기를 버리는 번호 - 닫히는 중 다시 열거나 destroy 하면 올린다
	let exitSeq = 0;
	// 생성 중(startsOpen)에 연 경우 onOpen 을 한 박자 미룬다 - 콜백 안에서
	// `const m = Bigtablet.Modal(...)` 의 m 을 쓰면 아직 대입 전이라 ReferenceError 가 난다.
	let constructing = true;

	// Dialog ARIA - React Modal 과 패리티. 접근 가능한 이름(aria-labelledby/label)도 연결한다
	// 헤더가 있으면 그 id 로 연결한다. 둘 다 없으면 이름을 지어내지 않는다 - React Modal(#473)처럼
	// 이름 누락을 axe aria-dialog-name 이 잡게 두고, axe 를 안 돌리는 서버 렌더 화면을 위해 경고한다.
	if (panel) {
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-modal", "true");
		if (!panel.hasAttribute("aria-label") && !panel.hasAttribute("aria-labelledby")) {
			const header = panel.querySelector(".bt-modal__header");
			if (header) {
				header.id = header.id || generateId("modal_title");
				panel.setAttribute("aria-labelledby", header.id);
			} else {
				console.warn(
					"Modal: no accessible name - add .bt-modal__header or aria-label on .bt-modal__panel",
				);
			}
		}
	}

	function open() {
		if (state.isOpen) return; // 이미 열림 - 중복 lockScroll 방지
		state.isOpen = true;
		// 닫히는 중이었으면 대기를 버린다 - transition 은 CSS 가 제자리에서 되돌린다
		exitSeq++;
		modal.removeAttribute("inert");
		delete modal.dataset.state;
		if (panel) delete panel.dataset.state;
		modal.classList.add("is-open");
		if (!locked) {
			lockScroll();
			locked = true;
		}
		// Escape 는 공유 스택에 - 최상단일 때만 닫힌다. `closeOnEscape: false` 여도
		// **등록은 한다**: 모달은 아래 오버레이를 비활성으로 덮으므로, 등록을 건너뛰면
		// 최상단 항목이 아래 오버레이가 되어 Escape 한 번에 뒤쪽이 닫힌다.
		popEscape = pushEscape(onEscape);

		// 포커스 이동 - 이전 포커스 저장 후 패널 첫 focusable(없으면 패널 자체)로 (WCAG 2.4.3)
		previousFocus = returnFocusTarget();
		if (panel) {
			// React Modal 과 같은 순서 - 본문 첫 컨트롤, 없으면 패널 첫 focusable(닫기 버튼 등)
			const body = panel.querySelector(".bt-modal__body");
			const first = (body && focusablesIn(body)[0]) || focusablesIn(panel)[0];
			if (first) {
				first.focus();
			} else {
				// 소비자가 이미 tabindex 를 줬으면 그대로 둔다 - 덮어쓰고 "우리가 붙였다" 로
				// 표시하면 release() 가 소비자 속성을 지운다. 이미 포커스 가능하니 focus 만.
				if (!panel.hasAttribute("tabindex")) {
					panel.setAttribute("tabindex", "-1");
					panelTabindexAdded = true;
				}
				panel.focus();
			}
		}

		if (config.onOpen) {
			if (!constructing) config.onOpen();
			else
				queueMicrotask(() => {
					if (state.isOpen) config.onOpen();
				});
		}
	}

	/** 화면에서 걷는다 - is-open · 닫힘 표시 · 스크롤 잠금. 퇴출 모션 뒤(또는 기다리지 않을 때 바로) */
	function hide() {
		modal.classList.remove("is-open");
		delete modal.dataset.state;
		if (panel) delete panel.dataset.state;
		modal.removeAttribute("inert");
		if (locked) {
			unlockScroll();
			locked = false;
		}
	}

	/**
	 * open() 이 잡아 둔 것을 전부 되돌린다 - is-open 클래스, Escape 등록, 스크롤 잠금, 우리가
	 * 붙인 tabindex, 포커스. close() 와 destroy() 가 같은 함수를 부르므로 두 경로가 갈라질 수
	 * 없다. 둘의 차이는 onClose 콜백과 퇴출 모션이다 - destroy 는 닫기가 아니라 바인딩 해제라
	 * 기다리지 않고 바로 걷는다(리스너가 이미 풀려 기다리는 사이 다시 열 길이 없다).
	 *
	 * 다섯 중 하나라도 빠지면 열린 채 destroy 된 모달이 흔적을 남긴다:
	 * - is-open - `.bt-modal` 은 display: none 이고 이 클래스만이 grid 로 뒤집는다. 남으면 모달이
	 *   화면에 열린 채 고정되고, 리스너는 이미 해제돼 닫을 길이 없다. (같은 DOM 으로 다시 만든
	 *   인스턴스는 이제 is-open 을 보고 열린 채로 시작한다 - #919. 그래도 바인딩이 없는 사이에
	 *   남으면 안 된다)
	 * - Escape 등록 - 스택이 파괴된 모달의 close 를 붙들어(누수) 다음 Escape 에 그게 다시 돌고,
	 *   isOpen 이 true 라 가드를 통과해 unlockScroll 이 한 번 더 불린다. 진짜로 열려 있는
	 *   오버레이의 배경 스크롤이 조기에 풀린다
	 * - 포커스 - 파괴된 패널 안에 남아, 소비자가 그 DOM 을 지우는 순간 body 로 떨어지고 다음
	 *   Tab 이 문서 처음부터 시작한다
	 * - tabindex - 같은 DOM 으로 다시 만든 Modal 이 "원래 있던 것" 으로 오인해 지우지 않는다
	 *
	 * @param {boolean} animate - true 면 퇴출 모션이 끝난 뒤 걷고 onExited 를 부른다 (#913)
	 */
	function release(animate) {
		state.isOpen = false;
		if (popEscape) {
			popEscape();
			popEscape = null;
		}

		// 우리가 추가한 tabindex 정리 (React useFocusTrap 의 wasTabIndexAdded 와 동일)
		if (panelTabindexAdded && panel) {
			panel.removeAttribute("tabindex");
			panelTabindexAdded = false;
		}

		// 포커스 복원 - 모션을 기다리지 않는다 (Alert 와 같음)
		if (previousFocus?.isConnected && typeof previousFocus.focus === "function") {
			previousFocus.focus();
		}
		previousFocus = null;

		if (!animate) {
			exitSeq++;
			hide();
			return;
		}
		modal.dataset.state = "closed";
		if (panel) panel.dataset.state = "closed";
		// 사라지는 중인 버튼에 Tab·스크린리더가 닿지 않게 - aria-hidden 은 포커스를 막지 못한다
		modal.setAttribute("inert", "");
		const seq = ++exitSeq;
		afterExit([modal, panel], () => {
			if (seq !== exitSeq) return; // 그 사이 다시 열렸거나 destroy 됐다
			hide();
			if (config.onExited) config.onExited();
		});
	}

	function close() {
		if (!state.isOpen) return; // 이미 닫힘 - 중복 unlockScroll 방지
		release(true);

		if (config.onClose) {
			config.onClose();
		}
	}

	// 패널 안에서 누른 채 딤 위에서 떼면 click 이 공통 조상(딤)으로 온다 - 입력칸 글자를 드래그로 고르다
	// 밖에서 놓으면 닫혔다 (#973). React Modal 의 pressedOverlayRef 와 같다
	let pressedInside = false;
	function onPointerDown(e) {
		pressedInside = e.target !== modal;
	}

	function onClick(e) {
		const fromInside = pressedInside;
		pressedInside = false;
		// 닫기 버튼은 위임으로 - 나중에 넣은 버튼도 동작하고, 안에 겹친 모달의 닫기는 그 모달 몫이다 (#973)
		const closer = e.target.closest?.("[data-modal-close]");
		if (closer && closer.closest(".bt-modal") === modal) {
			// type 없는 <button> 은 <form> 안에서 submit 이다 - "취소" 가 폼을 보내지 않게.
			// <button> 만 막는다 - <a href data-modal-close> 는 닫으면서 이동해야 한다 (#981)
			if (closer.tagName === "BUTTON" && !closer.hasAttribute("type")) e.preventDefault();
			close();
			return;
		}
		if (config.closeOnOverlay && e.target === modal && !fromInside) {
			close();
		}
	}

	// 이 모달만의 핸들러 - 공용 noop 을 쓰면 스택 최상단이 어느 모달인지 가릴 수 없다 (ownsFocus)
	function onEscape() {
		if (config.closeOnEscape) close();
	}

	function onKeyDown(e) {
		if (!state.isOpen) return;
		// Escape 는 위 스택이 처리한다. Tab 트랩은 포커스가 이 모달에 있을 때만 - 위에 뜬 Alert 의 Tab 을 막지 않게
		if (e.key === "Tab" && panel && ownsFocus(panel, onEscape)) trapTab(e, panel);
	}

	// Bind events
	const cleanups = [
		on(modal, "pointerdown", onPointerDown),
		on(modal, "click", onClick),
		on(document, "keydown", onKeyDown),
	];

	// Public API
	const api = {
		isOpen: () => state.isOpen,
		open,
		close,
		toggle: () => (state.isOpen ? close() : open()),
		destroy: () => {
			cleanups.forEach((cleanup) => {
				cleanup();
			});
			// 열려 있으면 release() 로 되돌린다 - 왜 다섯을 전부 되돌려야 하는지는 그쪽 JSDoc.
			// close() 와 다른 점은 `onClose` 를 부르지 않고 퇴출 모션을 기다리지 않는 것이다.
			// 닫히는 중이면(isOpen false, 잠금은 남음) 대기를 버리고 바로 걷는다.
			if (state.isOpen) release(false);
			else if (locked) {
				exitSeq++;
				hide();
			}
			// 참조를 지워야 init() 이 다시 붙인다
			if (modal._btModal === api) delete modal._btModal;
		},
	};
	modal._btModal = api;
	if (startsOpen) open();
	constructing = false;
	return api;
}
