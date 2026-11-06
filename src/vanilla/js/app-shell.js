import { $ } from "./utils.js";

/* ========================================
     AppShell - 고정 헤더 높이 기록 (React AppShell header 대응, #950)
     ======================================== */

/**
 * `.bt-app-shell__header` 의 높이를 `<html>` 의 `--bt-top-inset` 에 적는다. theme 의
 * `html { scroll-padding-top: var(--bt-top-inset) }` 이 읽어, Tab · 앵커 이동으로 스크롤될 때 대상이
 * sticky 헤더 밑에 숨지 않는다 (WCAG 2.4.11). 높이는 내용에 따라 달라 CSS 만으로는 모른다 -
 * React `useTopInset` 과 같은 방식. 헤더가 없으면 아무 일도 하지 않는다.
 *
 * @param {HTMLElement|string} element - `.bt-app-shell` 요소 또는 셀렉터
 */
export function AppShell(element) {
	const root = typeof element === "string" ? $(element) : element;
	if (!root) return null;
	root._btAppShell?.destroy();

	const header = root.querySelector(".bt-app-shell__header");
	const html = document.documentElement;
	let observer = null;
	if (header && typeof ResizeObserver !== "undefined") {
		observer = new ResizeObserver(() => {
			// 소수 높이(줌 · rem)에서 모자라지 않게 올림
			html.style.setProperty(
				"--bt-top-inset",
				`${Math.ceil(header.getBoundingClientRect().height)}px`,
			);
		});
		observer.observe(header);
	}

	const api = {
		destroy: () => {
			if (observer) {
				observer.disconnect();
				html.style.removeProperty("--bt-top-inset");
			}
			if (root._btAppShell === api) delete root._btAppShell;
		},
	};
	root._btAppShell = api;
	return api;
}
