/**
 * Bigtablet Design System - Vanilla JavaScript
 * For use with plain HTML/CSS/JS, Thymeleaf, JSP, etc.
 *
 * @version 1.0.0
 * @license Bigtablet Inc. Open Source License - see LICENSE at the repo root
 *          (https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)
 */

// 소스는 컴포넌트별 ES 모듈(./js/*.js)이고 배포물은 tsup 이 이 진입점을 IIFE 하나로 묶은
// bigtablet.min.js 다 - 전역 `Bigtablet` 은 그 IIFE 의 반환값(아래 export 전부)이다 (#926).
import { init } from "./js/init.js";

// Components
export { Alert } from "./js/alert.js";
export { AppShell } from "./js/app-shell.js";
export { CopyButton } from "./js/copy-button.js";
export { DatePicker } from "./js/date-picker.js";
export { Dropdown } from "./js/dropdown.js";
// Utilities
export { init } from "./js/init.js";
export { getLocale, setLocale, setMessages } from "./js/locale.js";
export { Modal } from "./js/modal.js";
export { Pagination } from "./js/pagination.js";
export { Sidebar } from "./js/sidebar.js";
export { Toast } from "./js/toast.js";
export { Toggle } from "./js/toggle.js";
export { $, $$, generateId, on } from "./js/utils.js";

export const version = "1.0.0";

// Auto-init on DOM ready
if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
}
