import { t } from "./locale.js";
import { afterExit } from "./overlay.js";
import { $$ } from "./utils.js";

/* ========================================
     Toast Component
     ======================================== */

/** 동시에 떠 있는 토스트 수 - React `ToastProvider` 의 maxCount 기본값과 같다 */
export const TOAST_MAX_COUNT = 5;

// lucide 아이콘 - React Toast 의 TONE_ICONS(iconSize.md = 18) · X(iconSize.xs = 14) 와 같은 path
export const toastSvg = (size, body) =>
	`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
	`stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
export const TOAST_ICONS = {
	success: toastSvg(18, '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
	error: toastSvg(18, '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
	warning: toastSvg(
		18,
		'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' +
			'<path d="M12 9v4"/><path d="M12 17h.01"/>',
	),
	info: toastSvg(18, '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
	neutral: toastSvg(
		18,
		'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
	),
};
export const TOAST_CLOSE_ICON = toastSvg(14, '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');

/**
 * 토스트를 띄운다 (React `useToast().show*` 의 Vanilla 대응). 오른쪽 위에 최신이 위로 쌓이고, 최대
 * 5개를 넘은 오래된 것은 퇴출 모션으로 내보낸다. 막대가 다 줄면 닫히고, 포인터를 올리거나 키보드
 * 포커스가 있으면 멈춘다(WCAG 2.2.1 - CSS).
 *
 * @param {string} message - 본문 (텍스트로 넣는다 - HTML 은 해석하지 않는다)
 * @param {"success"|"error"|"warning"|"info"|"neutral"} [tone="neutral"]
 * @param {Object} [options]
 * @param {number} [options.duration=3000] - 자동 닫힘까지 ms. `Infinity` 면 닫기 버튼·dismiss 로만 닫힌다
 * @param {{label: string, onClick: Function}} [options.action] - 메시지 옆 텍스트 버튼. 누르면 실행 후 닫힌다
 * @param {string} [options.closeLabel="닫기"] - 닫기 버튼 aria-label
 * @param {string} [options.regionLabel="알림"] - 토스트 리전 이름. 리전을 처음 만들 때만 쓴다
 * @returns {{dismiss: Function}}
 */
export function Toast(message, tone = "neutral", options = {}) {
	const {
		duration = 3000,
		action,
		closeLabel = t("toast.close"),
		regionLabel = t("toast.region"),
	} = options;
	// 모르는 tone 은 neutral - `in` 이 아니라 keys 라 "toString" 같은 상속 키도 거른다
	const safeTone = Object.keys(TOAST_ICONS).includes(tone) ? tone : "neutral";

	let region = document.querySelector(".bt-toast-container");
	if (!region) {
		region = document.createElement("div");
		region.className = "bt-toast-container";
		region.setAttribute("role", "region");
		region.setAttribute("aria-label", regionLabel);
		document.body.appendChild(region);
	}
	// 리전은 랜드마크일 뿐 라이브 리전이 아니다 - 예전에는 aria-live 로 항목 전체(버튼 포함)를 감싸고 안쪽
	// 메시지가 다시 status · alert 라 라이브 리전이 겹쳤다 (#994). 공지는 안쪽 숨은 영역 둘이 맡는다.
	// 예전 버전이 만든(또는 서버가 그린) 리전에도 붙인다
	region.removeAttribute("aria-live");
	region.removeAttribute("aria-atomic");
	let fresh = false;
	for (const role of ["status", "alert"]) {
		if (region.querySelector(`:scope > .bt-toast__announcer[role="${role}"]`)) continue;
		const announcer = document.createElement("div");
		announcer.className = "bt-toast__announcer";
		announcer.setAttribute("role", role);
		region.appendChild(announcer);
		fresh = true;
	}

	const item = document.createElement("div");
	item.className = "bt-toast";
	item.dataset.state = "open";
	// 보이는 메시지는 보조기술에서 뺀다 - 같은 문구를 숨은 공지 영역이 읽는다 (React 와 같음, #994)
	item.innerHTML =
		'<div class="bt-toast__live" aria-hidden="true">' +
		`<span class="bt-toast__icon bt-toast__icon--${safeTone}" aria-hidden="true">${TOAST_ICONS[safeTone]}</span>` +
		'<span class="bt-toast__message"></span></div>';
	item.querySelector(".bt-toast__message").textContent = message;

	// 문구만 공지 영역에 넣는다 - 닫기 · 액션 버튼 이름이 섞이지 않는다. error 는 alert 쪽(assertive).
	// 리전을 방금 만들었으면 한 틱 뒤에 넣는다 - 라이브 리전은 내용보다 먼저 DOM 에 있어야 삽입이 공지된다
	const line = document.createElement("p");
	line.textContent = message;
	const announcer = region.querySelector(
		`.bt-toast__announcer[role="${safeTone === "error" ? "alert" : "status"}"]`,
	);
	if (fresh) setTimeout(() => announcer?.appendChild(line), 100);
	else announcer?.appendChild(line);

	let closing = false;

	function dismiss() {
		if (closing) return;
		closing = true;
		// 포커스가 이 토스트 안이면(닫기 버튼 Enter 등) 걷힐 때 body 로 떨어지지 않게 이웃 토스트의
		// 닫기 버튼으로 넘긴다 - 아래(오래된 쪽) 우선 (React 와 같음, WCAG 2.4.3)
		if (item.contains(document.activeElement)) {
			const closes = $$('.bt-toast:not([data-state="closed"]) .bt-toast__close', region);
			const index = closes.findIndex((el) => item.contains(el));
			(closes[index + 1] || closes[index - 1])?.focus();
		}
		item.dataset.state = "closed";
		line.remove();
		// 사라지는 중인 버튼에 Tab·스크린리더가 닿지 않게
		item.setAttribute("inert", "");
		afterExit([item], () => item.remove());
	}

	if (action) {
		const actionBtn = document.createElement("button");
		actionBtn.type = "button";
		actionBtn.className = "bt-toast__action";
		actionBtn.textContent = action.label;
		actionBtn.addEventListener("click", () => {
			// 퇴출 모션 동안 버튼이 남아 있다 - 연타로 되돌리기가 두 번 돌지 않게
			if (closing) return;
			// onClick 이 throw 해도 닫는다 - 남으면 다시 눌러 콜백이 두 번 돈다
			try {
				action.onClick?.();
			} finally {
				dismiss();
			}
		});
		item.appendChild(actionBtn);
	}

	const closeBtn = document.createElement("button");
	closeBtn.type = "button";
	closeBtn.className = "bt-toast__close";
	closeBtn.setAttribute("aria-label", closeLabel);
	closeBtn.innerHTML = TOAST_CLOSE_ICON;
	closeBtn.addEventListener("click", dismiss);
	item.appendChild(closeBtn);

	// Infinity 는 CSS 시간으로 쓸 수 없고, 막대가 없어야 "저절로 안 닫힌다" 가 눈에도 보인다
	if (Number.isFinite(duration)) {
		const progress = document.createElement("div");
		progress.className = `bt-toast__progress bt-toast__progress--${safeTone}`;
		progress.style.setProperty("--bt-toast-duration", `${duration}ms`);
		progress.setAttribute("aria-hidden", "true");
		progress.addEventListener("animationend", dismiss);
		item.appendChild(progress);
	}

	item._btDismiss = dismiss;
	region.prepend(item);
	// 넘친 오래된 것은 잘라내지 않고 같은 퇴출 경로로 내보낸다 - 안의 포커스가 body 로 떨어지지 않게
	for (const el of $$('.bt-toast:not([data-state="closed"])', region).slice(TOAST_MAX_COUNT)) {
		el._btDismiss?.();
	}

	return { dismiss };
}
