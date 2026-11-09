import { t } from "./locale.js";
import { afterExit, lockScroll, ownsFocus, pushEscape, unlockScroll } from "./overlay.js";
import { escapeHtml, generateId, returnFocusTarget, trapTab } from "./utils.js";

/* ========================================
     Alert Component
     ======================================== */

// React Alert 와 동일한 버튼 variant (confirm=filled / cancel=outline).
export const CONFIRM_BUTTON_VARIANT = "bt-button--filled";
export const CANCEL_BUTTON_VARIANT = "bt-button--outline";

/**
 * Show Alert dialog
 * @param {Object} options - Alert configuration
 */
export function Alert(options = {}) {
	const config = {
		title: "",
		message: "",
		tone: "info", // info, success, warning, error
		confirmText: t("alert.confirm"),
		cancelText: t("alert.cancel"),
		showCancel: false,
		// React AlertOptions.destructive 와 동일 - true 면 확인 버튼이 danger(빨강)로 강조된다.
		destructive: false,
		actionsAlign: "right", // left, center, right
		// React AlertOptions.closeOnOverlay 와 동일 - false 면 오버레이 클릭으로 닫히지 않는다.
		closeOnOverlay: true,
		onConfirm: null,
		onCancel: null,
		...options,
	};

	// Create alert DOM
	const overlay = document.createElement("div");
	// `{ tone: undefined }` 처럼 키만 오면 spread 가 기본값을 덮는다 - 한 번 더 받친다
	overlay.className = `bt-alert__overlay bt-alert--${config.tone ?? "info"} is-open`;

	overlay.innerHTML = `
      <div class="bt-alert__modal">
        ${config.title ? `<div class="bt-alert__title">${escapeHtml(config.title)}</div>` : ""}
        <div class="bt-alert__message">${escapeHtml(config.message)}</div>
        <div class="bt-alert__actions" style="justify-content: ${
					config.actionsAlign === "left"
						? "flex-start"
						: config.actionsAlign === "center"
							? "center"
							: "flex-end"
				}">
          ${
						config.showCancel
							? `<button class="bt-button bt-button--md ${CANCEL_BUTTON_VARIANT}" data-alert-cancel>${escapeHtml(config.cancelText)}</button>`
							: ""
					}
          <button class="bt-button bt-button--md ${CONFIRM_BUTTON_VARIANT}${
						config.destructive ? " bt-button--danger" : ""
					}" data-alert-confirm>${escapeHtml(config.confirmText)}</button>
        </div>
      </div>
    `;

	// Alertdialog ARIA + 포커스 관리 (React Alert 와 패리티)
	const alertPanel = overlay.querySelector(".bt-alert__modal");
	if (alertPanel) {
		alertPanel.setAttribute("role", "alertdialog");
		alertPanel.setAttribute("aria-modal", "true");
		const titleEl = overlay.querySelector(".bt-alert__title");
		const messageEl = overlay.querySelector(".bt-alert__message");
		if (titleEl) {
			titleEl.id = generateId("alert_title");
			alertPanel.setAttribute("aria-labelledby", titleEl.id);
		}
		if (messageEl) {
			messageEl.id = generateId("alert_message");
			alertPanel.setAttribute("aria-describedby", messageEl.id);
		}
	}

	// 닫히는 중인 다른 Alert 안에서 띄웠으면(onConfirm 의 후속 Alert) 그쪽이 돌려줄 곳을 이어받는다 -
	// 앞 Alert 의 버튼은 곧 DOM 에서 빠져 되돌아갈 수 없다. 열려 있는 Alert 위면 그 버튼으로 (#973)
	const previousFocus = returnFocusTarget();
	overlay._btPreviousFocus = previousFocus;

	document.body.appendChild(overlay);
	lockScroll();

	let isOpen = true;
	// Escape 는 공유 스택에 - Modal 위에 떠 있으면 이 Alert 만 닫힌다.
	const popEscape = pushEscape(dismiss);

	function close() {
		// 중복 호출 방지 - 버튼/오버레이/Escape 연타 시 unlockScroll 이 여러 번 불려
		// 스크롤 잠금 카운터가 오동작하지 않도록 최초 1회만 실행.
		if (!isOpen) return;
		isOpen = false;
		// 리스너를 닫힘 경로 공통에서 해제 - 버튼/오버레이로 닫을 때 남아 누수되지 않게.
		popEscape();
		document.removeEventListener("keydown", onKeyDown);
		// 포커스가 아직 이 Alert 안(또는 body)일 때만 되돌린다 - onConfirm 에서 다음 Alert 를 띄웠으면
		// 포커스는 이미 그쪽에 있고, 여기서 되돌리면 새 대화상자 뒤 트리거로 빼앗는다.
		const active = document.activeElement;
		const focusHere = !active || active === document.body || overlay.contains(active);
		if (focusHere && previousFocus?.isConnected && typeof previousFocus.focus === "function") {
			previousFocus.focus();
		}
		// 퇴출 모션이 끝난 뒤 걷고 잠금을 푼다 (#909)
		overlay.classList.add("is-closing");
		// 사라지는 중인 버튼에 Tab·스크린리더가 닿지 않게 - aria-hidden 은 포커스를 막지 못한다
		overlay.setAttribute("inert", "");
		afterExit([overlay, alertPanel], () => {
			overlay.remove();
			unlockScroll();
		});
	}

	// 오버레이 클릭 / Escape 는 "취소"와 동등한 동작이어야 한다 (WAI-ARIA APG alertdialog).
	// React Alert 의 `dismiss = onCancel ?? onClose` 와 동일하게 onCancel 경로로 보내
	// 소비자의 취소 정리 로직(롤백 등)이 조용히 우회되지 않게 한다.
	function dismiss() {
		settle(config.onCancel);
	}

	/**
	 * 콜백을 부르고 닫는다. 콜백이 throw 해도 닫는다 - 안 그러면 딤 · 스크롤 잠금 · Escape 등록이 남고 다시
	 * 누르면 onConfirm(삭제 등)이 또 돈다 (#973). 콜백 동안 _btSettling 을 세워 그 안에서 연 대화상자가
	 * 이 Alert 의 복귀처를 이어받게 한다
	 */
	function settle(callback) {
		if (!isOpen) return;
		overlay._btSettling = true;
		try {
			callback?.();
		} finally {
			// 이어받을 대화상자는 콜백 안에서 열렸다 - 그 뒤로는 표시를 남기지 않는다
			overlay._btSettling = false;
			close();
		}
	}

	// Event handlers
	const confirmBtn = overlay.querySelector("[data-alert-confirm]");
	const cancelBtn = overlay.querySelector("[data-alert-cancel]");

	if (confirmBtn) {
		// 퇴출 모션 동안 버튼이 남아 있다 - settle 의 isOpen 가드가 연타로 onConfirm 이 두 번 도는 것을 막는다
		confirmBtn.addEventListener("click", () => settle(config.onConfirm));
	}

	if (cancelBtn) {
		cancelBtn.addEventListener("click", () => settle(config.onCancel));
	}

	// Close on overlay click (React Alert 와 동일하게 closeOnOverlay 로 끌 수 있다). 패널에서 누른 채
	// 딤에서 뗀 click 은 닫지 않는다 - Modal 과 같다 (#973)
	let pressedInside = false;
	overlay.addEventListener("pointerdown", (e) => {
		pressedInside = e.target !== overlay;
	});
	overlay.addEventListener("click", (e) => {
		const fromInside = pressedInside;
		pressedInside = false;
		if (config.closeOnOverlay && e.target === overlay && !fromInside) {
			dismiss();
		}
	});

	// Tab 포커스 트랩 (WAI-ARIA APG Dialog) - Modal 과 같은 헬퍼. Escape 는 위 스택이 처리한다.
	// 포커스가 이 Alert 에 있을 때만 - 위에 뜬 다른 Alert 의 Tab 을 막지 않게
	function onKeyDown(e) {
		if (e.key === "Tab" && alertPanel && ownsFocus(alertPanel, dismiss)) trapTab(e, alertPanel);
	}
	document.addEventListener("keydown", onKeyDown);

	// 초기 포커스 - 첫 버튼 (취소가 있으면 취소). React Alert 의 useFocusTrap 과 같고, destructive
	// "삭제?" 에서 Enter 한 번에 지워지지 않는다 (APG alertdialog: 덜 파괴적인 쪽, #973)
	(cancelBtn ?? confirmBtn)?.focus();

	return { close };
}
