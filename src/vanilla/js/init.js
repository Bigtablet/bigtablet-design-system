import { AppShell } from "./app-shell.js";
import { CopyButton } from "./copy-button.js";
import { DatePicker } from "./date-picker.js";
import { Dropdown } from "./dropdown.js";
import { Modal } from "./modal.js";
import { Pagination } from "./pagination.js";
import { Sidebar } from "./sidebar.js";
import { Toggle } from "./toggle.js";
import { $$, parseBoolAttr } from "./utils.js";

/* ========================================
     Auto-initialization
     ======================================== */

/**
 * Auto-initialize all components with data-bt attribute
 */
export function init() {
	// CopyButton - data-bt-copy 값을 복사한다 (#918)
	$$("[data-bt-copy]").forEach((el) => {
		if (!el._btCopyButton) CopyButton(el);
	});

	// AppShell - 고정 헤더가 있을 때만 높이를 잰다 (#950). 마크업만으로 쓰는 컴포넌트라 data-* 표시 없이 찾는다
	$$(".bt-app-shell").forEach((el) => {
		if (!el._btAppShell && el.querySelector(".bt-app-shell__header")) AppShell(el);
	});

	// Sidebar 접기 (#950)
	$$("[data-bt-sidebar]").forEach((el) => {
		if (!el._btSidebar) Sidebar(el);
	});

	// DatePicker (달력형, #937) - 옵션은 data-* 에서 읽는다
	$$("[data-bt-date-picker]").forEach((el) => {
		if (!el._btDatePicker) DatePicker(el);
	});

	// Dropdown
	$$("[data-bt-dropdown]").forEach((el) => {
		if (!el._btDropdown) {
			el._btDropdown = Dropdown(el);
		}
	});

	// Modal
	$$("[data-bt-modal]").forEach((el) => {
		if (!el._btModal) {
			el._btModal = Modal(el);
		}
	});

	// Modal triggers - init() 재호출 시 리스너 중복 바인딩 방지 가드
	$$("[data-bt-modal-open]").forEach((btn) => {
		if (btn.dataset.btBound) return;
		// getElementById - "123" 처럼 셀렉터로 무효한 id 에서 예외로 init 전체가 멈추지 않게
		const modal = document.getElementById(btn.dataset.btModalOpen);
		if (modal?._btModal) {
			btn.dataset.btBound = "true";
			btn.addEventListener("click", () => modal._btModal.open());
		}
	});

	// Toggle
	$$("[data-bt-toggle]").forEach((el) => {
		if (!el._btToggle) {
			el._btToggle = Toggle(el);
		}
	});

	// Pagination
	$$("[data-bt-pagination]").forEach((el) => {
		if (!el._btPagination) {
			const page = parseInt(el.dataset.page, 10) || 1;
			const totalPages = parseInt(el.dataset.totalPages, 10) || 1;
			const href = el.dataset.href || null;
			const labels = {};
			if (el.dataset.prevLabel) labels.prevLabel = el.dataset.prevLabel;
			if (el.dataset.nextLabel) labels.nextLabel = el.dataset.nextLabel;
			if (el.dataset.navLabel) labels.navLabel = el.dataset.navLabel;
			if (parseBoolAttr(el.dataset.pageJump)) labels.showPageJump = true;
			if (el.dataset.pageJumpLabel) labels.pageJumpLabel = el.dataset.pageJumpLabel;
			el._btPagination = Pagination(el, { page, totalPages, href, ...labels });
		}
	});
}
