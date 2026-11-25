import { t } from "./locale.js";
import { $, on } from "./utils.js";

/* ========================================
     CopyButton Component (React `<CopyButton>` · `useClipboard` 의 Vanilla 대응, #918)
     ======================================== */

/**
 * 텍스트를 클립보드에 쓴다. 실패하면 reject - React `copyText`(src/utils/use-clipboard.ts)와 같은 경로.
 * 1. `navigator.clipboard.writeText` - 보안 컨텍스트(HTTPS · localhost)에서만 있다
 * 2. 폴백 `document.execCommand("copy")` - 인앱 브라우저 · HTTP 사내망처럼 API 가 없거나 거부될 때.
 *    임시 textarea 를 쓰고 원래 선택 영역과 포커스를 되돌린다
 */
async function copyText(text) {
	let apiError;
	if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return;
		} catch (error) {
			// 권한 거부 등 - 폴백을 시도하고, 그것도 실패하면 원래 오류를 던진다
			apiError = error;
		}
	}
	if (!execCopy(text)) {
		throw apiError ?? new Error("Copy command was rejected");
	}
}

function execCopy(text) {
	const active = document.activeElement;
	const selection = document.getSelection();
	// 복제해 둔다 - getRangeAt 은 선택에 묶인 라이브 Range 라 엔진에 따라 select() 때 같이 바뀐다
	const ranges = selection
		? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
		: [];

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	// 화면 밖 고정 - 스크롤을 움직이지 않고, iOS 가 확대하지 않게 글자 크기를 둔다
	textarea.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;font-size:12pt";
	document.body.appendChild(textarea);

	let ok = false;
	try {
		textarea.select();
		// iOS Safari · 인앱 웹뷰는 select() 만으로 범위가 잡히지 않는 경우가 있다
		try {
			textarea.setSelectionRange(0, text.length);
		} catch {
			// 보정 API 가 없는 환경 - select() 결과로 계속
		}
		ok = document.execCommand("copy");
	} catch {
		ok = false;
	} finally {
		textarea.remove();
		// 포커스 먼저 - focus() 가 문서 선택을 지우므로 선택 영역은 그 뒤에 되돌린다
		active?.focus?.({ preventScroll: true });
		if (selection) {
			selection.removeAllRanges();
			for (const range of ranges) selection.addRange(range);
		}
	}
	return ok;
}

// 상태 아이콘 - React CopyButton 의 lucide Copy · Check · XCircle(iconSize.sm = 16)과 같은 path (#1158)
const stateSvg = (body) =>
	'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
	`stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const STATE_ICONS = {
	idle: stateSvg(
		'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>' +
			'<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
	),
	copied: stateSvg('<path d="M20 6 9 17l-5-5"/>'),
	failed: stateSvg('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
};

/**
 * 복사 버튼. 누르면 `text`(또는 `data-bt-copy` 값)를 복사하고 보이는 문구를 잠시 "복사됨" 으로 바꾼 뒤
 * 되돌린다. 결과는 버튼 옆에 넣는 숨은 `role="status"` 로 알린다 - 버튼 이름(aria-label)은 바꾸지 않는다
 * (포커스 중 같은 버튼을 두 번 읽는다, React 와 같음).
 *
 * 보이는 문구는 버튼 안의 `[data-copy-label]` 요소가 있으면 그 글자만, 없으면 버튼 글자 전체를 바꾼다 -
 * 아이콘을 함께 두려면 문구를 `<span data-copy-label>` 로 감싼다.
 *
 * 결과는 모양으로도 보인다 (#1158) - `data-state="copied"` 면 체크 아이콘 · 성공 색, `"failed"` 면 X 아이콘 ·
 * 오류 색. 평소에는 복사 아이콘을 둔다(React 와 같음) - 버튼 바로 안에 소비자 svg 가 있으면 평소엔 그것을 쓰고
 * 결과 동안만 숨긴다. 아이콘 자리와 문구 폭(두 문구 중 긴 쪽)이 고정돼 단추가 흔들리지 않는다.
 *
 * @param {HTMLElement|string} element - 버튼 또는 셀렉터
 * @param {Object} [options] - React `CopyButton` 과 같은 이름
 * @param {string|Function} [options.text] - 복사할 텍스트. 누를 때 계산하려면 함수. 없으면 `data-bt-copy`
 * @param {string} [options.label] - 버튼 이름 · 문구 (기본값: 버튼의 지금 글자, 없으면 "복사")
 * @param {string} [options.ariaLabel] - 이름만 따로 (`data-aria-label`, #966). 복사 버튼이 여럿이면 보이는
 *   글자는 "복사" 로 두고 이름에 무엇을 복사하는지 담는다 - 보이는 문구를 이름 안에 넣는다 (WCAG 2.5.3)
 * @param {string} [options.copiedLabel="복사됨"]
 * @param {string} [options.failedLabel="복사하지 못했습니다"] - 실패 시 status 로 알리는 문구
 * @param {number} [options.resetAfter=2000] - "복사됨" 을 유지하는 시간(ms)
 * @param {Function} [options.onCopy] - 성공 (text) - Toast 를 띄우려면 여기서
 * @param {Function} [options.onError] - 실패 (error)
 */
export function CopyButton(element, options = {}) {
	const btn = typeof element === "string" ? $(element) : element;
	if (!btn) return null;
	btn._btCopyButton?.destroy();

	const labelEl = $("[data-copy-label]", btn) || btn;
	const config = {
		label: btn.dataset.label || labelEl.textContent.trim() || t("copyButton.copy"),
		ariaLabel: btn.dataset.ariaLabel || null,
		copiedLabel: btn.dataset.copiedLabel || t("copyButton.copied"),
		failedLabel: btn.dataset.failedLabel || t("copyButton.failed"),
		resetAfter: 2000,
		onCopy: null,
		onError: null,
		...options,
	};

	if (btn.tagName === "BUTTON" && !btn.hasAttribute("type")) btn.setAttribute("type", "button");
	// destroy 가 소비자가 준 이름으로 되돌린다 (#973)
	const originalAriaLabel = btn.getAttribute("aria-label");
	// 이름은 고정 - 보이는 문구가 "복사됨" 으로 바뀌어도 낭독은 아래 status 한 번. 보이는 문구도 처음부터
	// 이름과 같게 둔다 (label 옵션이 버튼 글자와 다를 때 첫 복사 전까지 어긋나지 않게)
	btn.setAttribute("aria-label", config.ariaLabel || config.label);
	btn.classList.add("bt-copy-button");
	// 두 문구 중 긴 쪽 폭을 미리 잡는다(CSS ::before · ::after) - "복사" ↔ "복사됨" 에 단추가 흔들리지 않게
	const label = document.createElement("span");
	label.className = "bt-copy-button__label";
	label.dataset.label = config.label;
	label.dataset.copied = config.copiedLabel;
	const text = document.createElement("span");
	text.textContent = config.label;
	label.appendChild(text);
	labelEl.replaceChildren(label);
	const icon = document.createElement("span");
	icon.className = "bt-copy-button__icon";
	icon.setAttribute("aria-hidden", "true");
	// 소비자 아이콘이 있으면 평소엔 그것을 쓴다 - 없으면 복사 아이콘을 둬 결과 아이콘이 붙을 때 폭이 늘지 않게
	const ownIcon = btn.querySelector(":scope > svg");

	const status = document.createElement("span");
	status.className = "bt-sr-only";
	status.setAttribute("role", "status");
	btn.insertAdjacentElement("afterend", status);

	let timer;
	// 연속 클릭 - 마지막 복사만 상태에 반영한다 (React useClipboard 와 같음)
	let seq = 0;

	/** @param {"idle"|"copied"|"failed"} state */
	function show(state, message) {
		btn.dataset.state = state;
		text.textContent = state === "copied" ? config.copiedLabel : config.label;
		if (state === "idle" && ownIcon) icon.remove();
		else {
			icon.innerHTML = STATE_ICONS[state];
			if (!icon.isConnected) btn.prepend(icon);
		}
		status.textContent = message;
	}

	// 소비자 콜백의 예외는 삼키지 않되 상태(되돌림 타이머)를 깨지 않게 - 처리 안 된 예외처럼 보고한다
	function notify(callback, value) {
		try {
			callback?.(value);
		} catch (error) {
			(globalThis.reportError ?? console.error)(error);
		}
	}

	async function copy() {
		const id = ++seq;
		clearTimeout(timer);
		let text;
		let failure;
		try {
			const source = config.text ?? btn.dataset.btCopy ?? "";
			text = typeof source === "function" ? source() : String(source);
			await copyText(text);
		} catch (error) {
			failure = error;
		}
		if (id !== seq) return;
		const ok = failure === undefined;
		show(ok ? "copied" : "failed", ok ? config.copiedLabel : config.failedLabel);
		if (config.resetAfter > 0) timer = setTimeout(() => show("idle", ""), config.resetAfter);
		if (ok) notify(config.onCopy, text);
		else notify(config.onError, failure);
	}

	show("idle", "");
	const cleanup = on(btn, "click", () => {
		void copy();
	});

	const api = {
		copy,
		destroy: () => {
			cleanup();
			seq++;
			clearTimeout(timer);
			labelEl.textContent = config.label;
			icon.remove();
			btn.classList.remove("bt-copy-button");
			if (originalAriaLabel === null) btn.removeAttribute("aria-label");
			else btn.setAttribute("aria-label", originalAriaLabel);
			delete btn.dataset.state;
			status.remove();
			if (btn._btCopyButton === api) delete btn._btCopyButton;
		},
	};
	btn._btCopyButton = api;
	return api;
}
