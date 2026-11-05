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
export async function copyText(text) {
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

/**
 * 복사 버튼. 누르면 `text`(또는 `data-bt-copy` 값)를 복사하고 보이는 문구를 잠시 "복사됨" 으로 바꾼 뒤
 * 되돌린다. 결과는 버튼 옆에 넣는 숨은 `role="status"` 로 알린다 - 버튼 이름(aria-label)은 바꾸지 않는다
 * (포커스 중 같은 버튼을 두 번 읽는다, React 와 같음).
 *
 * 보이는 문구는 버튼 안의 `[data-copy-label]` 요소가 있으면 그 글자만, 없으면 버튼 글자 전체를 바꾼다 -
 * 아이콘을 함께 두려면 문구를 `<span data-copy-label>` 로 감싼다.
 *
 * @param {HTMLElement|string} element - 버튼 또는 셀렉터
 * @param {Object} [options] - React `CopyButton` 과 같은 이름
 * @param {string|Function} [options.text] - 복사할 텍스트. 누를 때 계산하려면 함수. 없으면 `data-bt-copy`
 * @param {string} [options.label] - 버튼 이름 · 문구 (기본값: 버튼의 지금 글자, 없으면 "복사")
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
		label: btn.dataset.label || labelEl.textContent.trim() || "복사",
		copiedLabel: btn.dataset.copiedLabel || "복사됨",
		failedLabel: btn.dataset.failedLabel || "복사하지 못했습니다",
		resetAfter: 2000,
		onCopy: null,
		onError: null,
		...options,
	};

	if (btn.tagName === "BUTTON" && !btn.hasAttribute("type")) btn.setAttribute("type", "button");
	// 이름은 고정 - 보이는 문구가 "복사됨" 으로 바뀌어도 낭독은 아래 status 한 번
	btn.setAttribute("aria-label", config.label);

	const status = document.createElement("span");
	status.className = "bt-sr-only";
	status.setAttribute("role", "status");
	btn.insertAdjacentElement("afterend", status);

	let timer;
	// 연속 클릭 - 마지막 복사만 상태에 반영한다 (React useClipboard 와 같음)
	let seq = 0;

	function show(copied, message) {
		btn.dataset.state = copied ? "copied" : "idle";
		labelEl.textContent = copied ? config.copiedLabel : config.label;
		status.textContent = message;
	}

	async function copy() {
		const id = ++seq;
		clearTimeout(timer);
		let text;
		try {
			const source = config.text ?? btn.dataset.btCopy ?? "";
			text = typeof source === "function" ? source() : String(source);
			await copyText(text);
		} catch (error) {
			if (id !== seq) return;
			show(false, config.failedLabel);
			config.onError?.(error);
			if (config.resetAfter > 0) timer = setTimeout(() => show(false, ""), config.resetAfter);
			return;
		}
		if (id !== seq) return;
		show(true, config.copiedLabel);
		config.onCopy?.(text);
		if (config.resetAfter > 0) timer = setTimeout(() => show(false, ""), config.resetAfter);
	}

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
			delete btn.dataset.state;
			status.remove();
			if (btn._btCopyButton === api) delete btn._btCopyButton;
		},
	};
	btn._btCopyButton = api;
	return api;
}
