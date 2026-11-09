/* ========================================
     Utility Functions
     ======================================== */

/**
 * Generate unique ID
 */
export function generateId(prefix = "bt") {
	return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Add event listener with cleanup
 */
export function on(element, event, handler, options) {
	element.addEventListener(event, handler, options);
	return () => element.removeEventListener(event, handler, options);
}

/**
 * Query selector helper
 */
export function $(selector, context = document) {
	return context.querySelector(selector);
}

/**
 * Query selector all helper
 */
export function $$(selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

/** 포커스 가능한 요소 셀렉터 (React useFocusTrap 과 동일 기준) */
export const FOCUSABLE_SELECTORS = [
	"a[href]",
	"button:not([disabled])",
	// type=hidden 은 포커스를 받지 않는다 - Thymeleaf 폼의 _csrf 가 첫 항목이 되면 초기 포커스·Tab 트랩이 깨진다
	'input:not([disabled]):not([type="hidden"])',
	"select:not([disabled])",
	"textarea:not([disabled])",
	// tabindex 가 붙은 hidden input 도 이 경로로 들어오지 않게
	'[tabindex]:not([tabindex="-1"]):not(input[type="hidden"])',
].join(", ");

/**
 * Tab 이 실제로 닿는 요소만 - `hidden` · `inert` 안이나 display:none · visibility:hidden 은 뺀다.
 * 셀렉터만 쓰면 서버가 조건부로 숨긴 버튼이 "마지막" 이 돼 Tab 트랩이 새고 초기 포커스가 숨은 칸으로 간다 (#973)
 */
export function focusablesIn(root) {
	return $$(FOCUSABLE_SELECTORS, root).filter((el) => {
		if (el.closest("[hidden],[inert]")) return false;
		const style = getComputedStyle(el);
		return style.display !== "none" && style.visibility !== "hidden";
	});
}

/**
 * 대화상자 Tab 트랩 (WAI-ARIA APG Dialog) - Modal · Alert 공용. 포커스가 목록 밖(패널 자체 ·
 * body)이면 방향에 따라 처음 · 끝으로 보낸다 - 패널에 포커스를 둔 채 Shift+Tab 하면 빠져나갔다 (#973)
 */
export function trapTab(e, container) {
	const list = focusablesIn(container);
	if (list.length === 0) {
		e.preventDefault();
		return;
	}
	const first = list[0];
	const last = list[list.length - 1];
	const active = document.activeElement;
	let next = null;
	if (!list.includes(active)) next = e.shiftKey ? last : first;
	else if (e.shiftKey && active === first) next = last;
	else if (!e.shiftKey && active === last) next = first;
	if (next) {
		e.preventDefault();
		next.focus();
	}
}

/**
 * 이 키 입력이 이 대화상자 몫인지 - 포커스가 안에 있거나 갈 곳 없이 body 에 떨어졌을 때만. 위에 다른
 * 대화상자(Modal 위 Alert, Alert 위 Alert)가 떠 있으면 그쪽 Tab 을 막지 않는다 (#973)
 */
export function ownsFocus(container) {
	const active = document.activeElement;
	return !active || active === document.body || container.contains(active);
}

/**
 * 대화상자를 닫을 때 돌려줄 곳. 닫히는 중인 Alert 의 버튼에서 열었으면(onConfirm 에서 연 Modal ·
 * 다음 Alert) 그 Alert 가 돌려줄 곳을 이어받는다 - 그 버튼은 곧 DOM 에서 빠진다. 아직 열려 있는
 * Alert 위에 띄운 것이면 그 Alert 의 버튼으로 돌아간다 (#973)
 */
export function returnFocusTarget() {
	const opener = document.activeElement;
	const alert = opener?.closest?.(".bt-alert__overlay");
	return alert?._btSettling ? alert._btPreviousFocus : opener;
}

/**
 * 잠금으로 회수되는 오른쪽 폭(px). 오버레이 스크롤바(macOS 기본)에서는 0.
 *
 * `window.innerWidth - html.clientWidth` 로는 안 된다. 그 값은 "지금 스크롤바가 떠 있는가"
 * 만 재고 `scrollbar-gutter: stable` 이 **예약해 둔** 거터는 잡지 못한다. Chromium 실측 -
 * 거터 15px 이 예약된 상태에서 `innerWidth` 와 `clientWidth` 가 똑같이 1600 을 보고하고
 * (스크롤이 있든 없든), 같은 상황에서 `position: fixed` 박스는 1585px 로 잡힌다.
 *
 * 필요한 값은 "ICB 가 뷰포트보다 몇 px 좁은가" 다. fixed 박스를 하나 띄워 직접 잰다 -
 * 클래식 스크롤바든 예약된 거터든 같은 값으로 잡힌다.
 * (React 쪽 `utils/scroll-lock.ts` 의 `measureViewportInset` 과 동일 동작.)
 */
export function measureViewportInset() {
	const probe = document.createElement("div");
	probe.style.cssText =
		"position:fixed;top:0;left:0;right:0;height:0;visibility:hidden;pointer-events:none";
	// body 가 아니라 html 에 붙인다 - 소비자가 body 에 transform/filter/contain 을 걸면
	// 그것이 fixed 의 컨테이닝 블록이 되어 뷰포트가 아닌 값을 재게 된다.
	document.documentElement.appendChild(probe);
	const width = probe.getBoundingClientRect().width;
	probe.remove();

	if (width <= 0) return 0;

	return Math.max(0, window.innerWidth - width);
}

/**
 * 오버레이가 열려 있는 동안 오른쪽에 스크롤바도 예약된 거터도 남기지 않는다.
 *
 * 남으면 그 자리는 캔버스(루트 배경)가 칠하는 영역이라 오버레이 딤이 덮지 못한다. 3.17~3.20
 * 은 루트 배경색에 딤을 합성해 그 띠를 칠했는데, **문서 배경이 단색일 때만** 맞는 방법이라
 * 표·카드가 띠 옆에 닿으면 경계에 세로선이 남았다(#635). 그래서 거터를 풀고 그만큼 `body`
 * 에 `padding-right` 를 준다 - ICB 가 뷰포트 폭이 되어 오버레이가 그 자리까지 덮는다.
 *
 * ICB 가 넓어지면 가운데 정렬한 fixed 요소가 절반만큼 움직이므로(#574), 오버레이 CSS 가
 * `padding-right: var(--bt-scrollbar-width)` 로 상쇄한다 - React 쪽과 같은 처리다.
 */
/**
 * data-* boolean 속성 파싱 - 속성이 없으면 undefined(=설정 안 함),
 * 있으면 `"false"` 만 false 로 보고 나머지(빈 문자열 포함)는 true.
 */
export function parseBoolAttr(value) {
	if (value === undefined) return undefined;
	return value !== "false";
}
