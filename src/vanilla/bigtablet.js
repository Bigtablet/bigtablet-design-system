/**
 * Bigtablet Design System - Vanilla JavaScript
 * For use with plain HTML/CSS/JS, Thymeleaf, JSP, etc.
 *
 * @version 1.0.0
 * @license MIT
 */

((global, factory) => {
	if (typeof exports === "object" && typeof module !== "undefined") {
		module.exports = factory();
	} else if (typeof define === "function" && define.amd) {
		define(factory);
	} else {
		global = global || self;
		global.Bigtablet = factory();
	}
})(this, () => {
	/* ========================================
     Utility Functions
     ======================================== */

	/**
	 * Generate unique ID
	 */
	function generateId(prefix = "bt") {
		return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
	}

	/**
	 * Escape HTML special characters to prevent XSS
	 */
	function escapeHtml(str) {
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
	function on(element, event, handler, options) {
		element.addEventListener(event, handler, options);
		return () => element.removeEventListener(event, handler, options);
	}

	/**
	 * Query selector helper
	 */
	function $(selector, context = document) {
		return context.querySelector(selector);
	}

	/**
	 * Query selector all helper
	 */
	function $$(selector, context = document) {
		return Array.from(context.querySelectorAll(selector));
	}

	/** 포커스 가능한 요소 셀렉터 (React useFocusTrap 과 동일 기준) */
	const FOCUSABLE_SELECTORS = [
		"a[href]",
		"button:not([disabled])",
		"input:not([disabled])",
		"select:not([disabled])",
		"textarea:not([disabled])",
		'[tabindex]:not([tabindex="-1"])',
	].join(", ");

	/**
	 * 바디 스크롤 잠금 카운터 - Modal 위 Alert 처럼 오버레이가 겹칠 때
	 * 하나만 닫혀도 배경 스크롤이 풀리던 문제 방지 (React 쪽 data-open-modals 와 동일 패턴)
	 */
	function lockScroll() {
		const n = parseInt(document.body.dataset.btOpenModals || "0", 10);
		if (n === 0) document.body.style.overflow = "hidden";
		document.body.dataset.btOpenModals = String(n + 1);
	}

	function unlockScroll() {
		const n = parseInt(document.body.dataset.btOpenModals || "1", 10) - 1;
		if (n <= 0) {
			document.body.style.overflow = "";
			delete document.body.dataset.btOpenModals;
		} else {
			document.body.dataset.btOpenModals = String(n);
		}
	}

	/* ========================================
     Select Component
     ======================================== */

	/**
	 * Initialize Select component
	 * @param {HTMLElement|string} element - Select wrapper element or selector
	 * @param {Object} options - Configuration options
	 */
	function Select(element, options = {}) {
		const wrapper = typeof element === "string" ? $(element) : element;
		if (!wrapper) return null;

		const config = {
			placeholder: "Select...",
			disabled: false,
			onChange: null,
			...options,
		};

		const state = {
			isOpen: false,
			value: config.defaultValue || null,
			activeIndex: -1,
			options: [],
		};

		// Create DOM structure
		const controlId = wrapper.id || generateId("select");
		const _listId = `${controlId}_listbox`;

		const control = wrapper.querySelector(".bt-select__control");
		const list = wrapper.querySelector(".bt-select__list");

		if (!control || !list) {
			console.warn("Select: Missing required elements (.bt-select__control, .bt-select__list)");
			return null;
		}

		// Parse options: data-options JSON > JS config > 서버 렌더링된 <li data-value> 마크업.
		// Thymeleaf/JSP 처럼 서버가 옵션 li 를 직접 렌더링하는 경우(문서화된 기본 마크업)를
		// 지원해야 하므로 DOM 파싱이 반드시 필요하다.
		const optionsData = wrapper.dataset.options
			? JSON.parse(wrapper.dataset.options)
			: (config.options && config.options.length
				? config.options
				: $$(".bt-select__option", list).map((el) => ({
						value: el.dataset.value !== undefined ? el.dataset.value : el.textContent.trim(),
						label: el.textContent.trim(),
						disabled: el.classList.contains("is-disabled"),
					})));

		state.options = optionsData;

		// Combobox ARIA (WAI-ARIA APG select-only combobox) - React Dropdown 과 패리티
		list.id = list.id || _listId;
		list.setAttribute("role", "listbox");
		control.setAttribute("role", "combobox");
		control.setAttribute("aria-haspopup", "listbox");
		control.setAttribute("aria-expanded", "false");
		control.setAttribute("aria-controls", list.id);
		$$(".bt-select__option", list).forEach((el, i) => {
			el.id = el.id || `${controlId}_option_${i}`;
			el.setAttribute("role", "option");
			el.setAttribute("aria-selected", "false");
			if (state.options[i]?.disabled) el.setAttribute("aria-disabled", "true");
		});

		// 폼 제출 참여: name(설정 또는 data-name)이 있으면 hidden input 으로 값을 노출한다.
		// 서버 템플릿(th:field 등)이 미리 렌더링한 hidden input 이 있으면 그대로 재사용 -
		// name/초기값을 서버 바인딩에서 이어받는다.
		let hiddenInput = wrapper.querySelector('input[type="hidden"]');
		const fieldName = config.name || wrapper.dataset.name || null;
		if (!hiddenInput && fieldName) {
			hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.name = fieldName;
			wrapper.appendChild(hiddenInput);
		}

		// State management
		function setValue(newValue) {
			state.value = newValue;
			const option = state.options.find((o) => o.value === newValue);

			// 폼 제출용 hidden input 동기화
			if (hiddenInput) {
				hiddenInput.value = newValue == null ? "" : newValue;
			}

			const valueEl = control.querySelector(".bt-select__value, .bt-select__placeholder");
			if (valueEl) {
				if (option) {
					valueEl.textContent = option.label;
					valueEl.classList.remove("bt-select__placeholder");
					valueEl.classList.add("bt-select__value");
				} else {
					valueEl.textContent = config.placeholder;
					valueEl.classList.remove("bt-select__value");
					valueEl.classList.add("bt-select__placeholder");
				}
			}

			// Update selected state in list
			$$(".bt-select__option", list).forEach((el, i) => {
				const selected = state.options[i]?.value === newValue;
				el.classList.toggle("is-selected", selected);
				el.setAttribute("aria-selected", selected ? "true" : "false");
			});

			if (config.onChange) {
				config.onChange(newValue, option);
			}
		}

		function open() {
			if (config.disabled) return;

			state.isOpen = true;
			control.classList.add("is-open");
			control.setAttribute("aria-expanded", "true");
			list.style.display = "block";

			// Calculate position (auto-flip)
			const rect = control.getBoundingClientRect();
			const listHeight = Math.min(state.options.length * 40, 288);
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;

			if (spaceBelow < listHeight && spaceAbove > spaceBelow) {
				list.classList.add("bt-select__list--up");
			} else {
				list.classList.remove("bt-select__list--up");
			}

			// Set active index
			const selectedIndex = state.options.findIndex((o) => o.value === state.value);
			state.activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
			updateActiveOption();

			// Rotate icon
			const icon = control.querySelector(".bt-select__icon");
			if (icon) icon.classList.add("is-open");
		}

		function close() {
			state.isOpen = false;
			control.classList.remove("is-open");
			control.setAttribute("aria-expanded", "false");
			control.removeAttribute("aria-activedescendant");
			list.style.display = "none";

			const icon = control.querySelector(".bt-select__icon");
			if (icon) icon.classList.remove("is-open");
		}

		function toggle() {
			if (state.isOpen) {
				close();
			} else {
				open();
			}
		}

		function updateActiveOption() {
			$$(".bt-select__option", list).forEach((el, i) => {
				const active = i === state.activeIndex;
				el.classList.toggle("is-active", active);
				// 키보드 탐색 중 활성 옵션을 AT 에 전달 (없으면 화살표 탐색이 스크린리더에 무음)
				if (active) control.setAttribute("aria-activedescendant", el.id);
			});
		}

		function moveActive(dir) {
			const len = state.options.length;
			let i = state.activeIndex;

			for (let step = 0; step < len; step++) {
				i = (i + dir + len) % len;
				if (!state.options[i].disabled) {
					state.activeIndex = i;
					updateActiveOption();
					break;
				}
			}
		}

		function selectActive() {
			const option = state.options[state.activeIndex];
			if (option && !option.disabled) {
				setValue(option.value);
				close();
			}
		}

		// Event handlers
		function onControlClick(e) {
			e.preventDefault();
			toggle();
		}

		function onControlKeyDown(e) {
			if (config.disabled) return;

			switch (e.key) {
				case " ":
				case "Enter":
					e.preventDefault();
					if (!state.isOpen) {
						open();
					} else {
						selectActive();
					}
					break;
				case "ArrowDown":
					e.preventDefault();
					if (!state.isOpen) {
						open();
					} else {
						moveActive(1);
					}
					break;
				case "ArrowUp":
					e.preventDefault();
					if (!state.isOpen) {
						open();
					} else {
						moveActive(-1);
					}
					break;
				case "Home":
					e.preventDefault();
					open();
					state.activeIndex = state.options.findIndex((o) => !o.disabled);
					updateActiveOption();
					break;
				case "End":
					e.preventDefault();
					open();
					for (let i = state.options.length - 1; i >= 0; i--) {
						if (!state.options[i].disabled) {
							state.activeIndex = i;
							updateActiveOption();
							break;
						}
					}
					break;
				case "Escape":
					e.preventDefault();
					close();
					break;
			}
		}

		function onDocumentClick(e) {
			if (!wrapper.contains(e.target)) {
				close();
			}
		}

		function onOptionClick(index) {
			return (e) => {
				e.preventDefault();
				const option = state.options[index];
				if (option && !option.disabled) {
					setValue(option.value);
					close();
				}
			};
		}

		function onOptionMouseEnter(index) {
			return () => {
				if (!state.options[index].disabled) {
					state.activeIndex = index;
					updateActiveOption();
				}
			};
		}

		// Bind events
		const cleanups = [
			on(control, "click", onControlClick),
			on(control, "keydown", onControlKeyDown),
			on(document, "mousedown", onDocumentClick),
		];

		$$(".bt-select__option", list).forEach((el, i) => {
			cleanups.push(on(el, "click", onOptionClick(i)));
			cleanups.push(on(el, "mouseenter", onOptionMouseEnter(i)));
		});

		// Initialize
		list.style.display = "none";
		if (config.defaultValue) {
			setValue(config.defaultValue);
		} else if (hiddenInput && hiddenInput.value) {
			// 서버 바인딩(th:field 등)이 넣어 둔 초기값을 표시에 반영
			setValue(hiddenInput.value);
		}

		// Public API
		return {
			getValue: () => state.value,
			setValue,
			open,
			close,
			toggle,
			setDisabled: (disabled) => {
				config.disabled = disabled;
				control.classList.toggle("is-disabled", disabled);
			},
			destroy: () => {
				cleanups.forEach((cleanup) => {
					cleanup();
				});
			},
		};
	}

	/* ========================================
     Modal Component
     ======================================== */

	/**
	 * Initialize Modal component
	 * @param {HTMLElement|string} element - Modal element or selector
	 * @param {Object} options - Configuration options
	 */
	function Modal(element, options = {}) {
		const modal = typeof element === "string" ? $(element) : element;
		if (!modal) return null;

		const config = {
			closeOnOverlay: true,
			closeOnEscape: true,
			onOpen: null,
			onClose: null,
			...options,
		};

		const state = {
			isOpen: false,
		};

		const panel = modal.querySelector(".bt-modal__panel");
		let previousFocus = null;

		// Dialog ARIA - React Modal 과 패리티
		if (panel) {
			panel.setAttribute("role", "dialog");
			panel.setAttribute("aria-modal", "true");
		}

		function open() {
			state.isOpen = true;
			modal.classList.add("is-open");
			lockScroll();

			// 포커스 이동 - 이전 포커스 저장 후 패널 첫 focusable(없으면 패널 자체)로 (WCAG 2.4.3)
			previousFocus = document.activeElement;
			if (panel) {
				const first = panel.querySelector(FOCUSABLE_SELECTORS);
				if (first) {
					first.focus();
				} else {
					panel.setAttribute("tabindex", "-1");
					panel.focus();
				}
			}

			if (config.onOpen) {
				config.onOpen();
			}
		}

		function close() {
			state.isOpen = false;
			modal.classList.remove("is-open");
			unlockScroll();

			// 포커스 복원
			if (previousFocus && typeof previousFocus.focus === "function") {
				previousFocus.focus();
			}
			previousFocus = null;

			if (config.onClose) {
				config.onClose();
			}
		}

		function onOverlayClick(e) {
			if (config.closeOnOverlay && e.target === modal) {
				close();
			}
		}

		function onKeyDown(e) {
			if (!state.isOpen) return;
			if (config.closeOnEscape && e.key === "Escape") {
				close();
				return;
			}
			// Tab 트랩 - 포커스가 패널 밖으로 빠지지 않게 순환 (WAI-ARIA APG Dialog)
			if (e.key === "Tab" && panel) {
				const focusables = $$(FOCUSABLE_SELECTORS, panel);
				if (focusables.length === 0) {
					e.preventDefault();
					return;
				}
				const first = focusables[0];
				const last = focusables[focusables.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		}

		// Bind events
		const cleanups = [on(modal, "click", onOverlayClick), on(document, "keydown", onKeyDown)];

		// Close buttons
		$$("[data-modal-close]", modal).forEach((btn) => {
			cleanups.push(on(btn, "click", close));
		});

		// Public API
		return {
			isOpen: () => state.isOpen,
			open,
			close,
			toggle: () => (state.isOpen ? close() : open()),
			destroy: () => {
				cleanups.forEach((cleanup) => {
					cleanup();
				});
				// 열린 채 destroy 되면 카운터 정합 유지를 위해 잠금 해제
				if (state.isOpen) unlockScroll();
			},
		};
	}

	/* ========================================
     Alert Component
     ======================================== */

	/**
	 * Show Alert dialog
	 * @param {Object} options - Alert configuration
	 */
	function Alert(options = {}) {
		const config = {
			title: "",
			message: "",
			variant: "info", // info, success, warning, error
			confirmText: "확인",
			cancelText: "취소",
			showCancel: false,
			actionsAlign: "right", // left, center, right
			onConfirm: null,
			onCancel: null,
			...options,
		};

		// Create alert DOM
		const overlay = document.createElement("div");
		overlay.className = `bt-alert__overlay bt-alert--${config.variant} is-open`;

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
							? `<button class="bt-button bt-button--md bt-button--secondary" data-alert-cancel>${escapeHtml(config.cancelText)}</button>`
							: ""
					}
          <button class="bt-button bt-button--md bt-button--primary" data-alert-confirm>${escapeHtml(config.confirmText)}</button>
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

		const previousFocus = document.activeElement;

		document.body.appendChild(overlay);
		lockScroll();

		function close() {
			// Escape 리스너를 닫힘 경로 공통에서 해제 - 버튼/오버레이로 닫을 때
			// 리스너가 남아 누수되던 문제 방지
			document.removeEventListener("keydown", onKeyDown);
			overlay.classList.remove("is-open");
			if (previousFocus && typeof previousFocus.focus === "function") {
				previousFocus.focus();
			}
			setTimeout(() => {
				overlay.remove();
				unlockScroll();
			}, 200);
		}

		// Event handlers
		const confirmBtn = overlay.querySelector("[data-alert-confirm]");
		const cancelBtn = overlay.querySelector("[data-alert-cancel]");

		if (confirmBtn) {
			confirmBtn.addEventListener("click", () => {
				if (config.onConfirm) config.onConfirm();
				close();
			});
		}

		if (cancelBtn) {
			cancelBtn.addEventListener("click", () => {
				if (config.onCancel) config.onCancel();
				close();
			});
		}

		// Close on overlay click
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				close();
			}
		});

		// Close on Escape (해제는 close() 공통 경로에서)
		function onKeyDown(e) {
			if (e.key === "Escape") {
				close();
			}
		}
		document.addEventListener("keydown", onKeyDown);

		// 초기 포커스 - 확인 버튼 (APG alertdialog: 열릴 때 포커스를 내부로 이동)
		if (confirmBtn) confirmBtn.focus();

		return { close };
	}

	/* ========================================
     Toggle Component
     ======================================== */

	/**
	 * Initialize Toggle component
	 * @param {HTMLElement|string} element - Toggle element or selector
	 * @param {Object} options - Configuration options
	 */
	function Toggle(element, options = {}) {
		const toggleEl = typeof element === "string" ? $(element) : element;
		if (!toggleEl) return null;

		const config = {
			defaultChecked: false,
			disabled: false,
			onChange: null,
			...options,
		};

		const state = {
			checked: config.defaultChecked || toggleEl.classList.contains("bt-toggle--on"),
		};

		// Switch 시맨틱 (React Toggle 과 패리티): role + aria-checked 를 항상 유지
		if (!toggleEl.hasAttribute("role")) toggleEl.setAttribute("role", "switch");
		// 폼 안에서 클릭이 submit 으로 새지 않도록 (button 기본 type=submit)
		if (toggleEl.tagName === "BUTTON" && !toggleEl.hasAttribute("type")) {
			toggleEl.setAttribute("type", "button");
		}

		// 폼 제출 참여: name(설정 또는 data-name)이 있으면 hidden input 으로 on/off 를 노출.
		// 서버 템플릿이 미리 렌더링한 hidden input 이 있으면 재사용한다.
		let hiddenInput = toggleEl.querySelector('input[type="hidden"]');
		const fieldName = config.name || toggleEl.dataset.name || null;
		if (!hiddenInput && fieldName) {
			hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.name = fieldName;
			toggleEl.appendChild(hiddenInput);
		}

		function setChecked(checked) {
			state.checked = checked;
			toggleEl.classList.toggle("bt-toggle--on", checked);
			toggleEl.setAttribute("aria-checked", checked ? "true" : "false");

			if (hiddenInput) {
				hiddenInput.value = checked ? "true" : "false";
			}

			if (config.onChange) {
				config.onChange(checked);
			}
		}

		function toggle() {
			if (!config.disabled && !toggleEl.classList.contains("bt-toggle--disabled")) {
				setChecked(!state.checked);
			}
		}

		const cleanup = on(toggleEl, "click", toggle);

		// Initialize - aria-checked/hidden input 을 초기 상태와 동기화
		if (hiddenInput && hiddenInput.value === "true" && !state.checked) {
			// 서버 바인딩 초기값(on)을 표시에 반영
			state.checked = true;
		}
		toggleEl.classList.toggle("bt-toggle--on", state.checked);
		toggleEl.setAttribute("aria-checked", state.checked ? "true" : "false");
		if (hiddenInput) hiddenInput.value = state.checked ? "true" : "false";

		return {
			isChecked: () => state.checked,
			setChecked,
			toggle,
			setDisabled: (disabled) => {
				config.disabled = disabled;
				toggleEl.classList.toggle("bt-toggle--disabled", disabled);
			},
			destroy: () => cleanup(),
		};
	}

	/* ========================================
     Pagination Component
     ======================================== */

	/**
	 * Initialize Pagination component
	 * @param {HTMLElement|string} element - Pagination container or selector
	 * @param {Object} options - Configuration options
	 */
	function Pagination(element, options = {}) {
		const container = typeof element === "string" ? $(element) : element;
		if (!container) return null;

		const config = {
			page: 1,
			totalPages: 1,
			sibling: 2,
			onChange: null,
			...options,
		};

		function range(start, end) {
			const out = [];
			for (let i = start; i <= end; i++) out.push(i);
			return out;
		}

		function getPaginationItems(page, totalPages) {
			if (totalPages <= 7) return range(1, totalPages);

			const items = [];
			const last = totalPages;
			const sibling = config.sibling;

			if (page <= sibling + 2) {
				for (const p of range(1, sibling + 3)) items.push(p);
				items.push("ellipsis");
				items.push(last);
				return items;
			}

			if (page >= last - sibling - 1) {
				items.push(1);
				items.push("ellipsis");
				for (const p of range(last - sibling - 2, last)) items.push(p);
				return items;
			}

			items.push(1);
			items.push("ellipsis");
			for (const p of range(page - sibling, page + sibling)) items.push(p);
			items.push("ellipsis");
			items.push(last);

			return items;
		}

		function render() {
			const items = getPaginationItems(config.page, config.totalPages);

			let html = `
        <button class="bt-pagination__item" ${config.page <= 1 ? "disabled" : ""} data-action="prev" aria-label="Previous page">
          ‹
        </button>
        <div class="bt-pagination__pages">
      `;

			items.forEach((item, _idx) => {
				if (item === "ellipsis") {
					html += `<span class="bt-pagination__ellipsis" aria-hidden="true">…</span>`;
				} else {
					const isActive = item === config.page;
					html += `
            <button
              class="bt-pagination__page${isActive ? " bt-pagination__page--active" : ""}"
              data-page="${escapeHtml(item)}"
              ${isActive ? 'aria-current="page"' : ""}
            >
              ${escapeHtml(item)}
            </button>
          `;
				}
			});

			html += `
        </div>
        <button class="bt-pagination__item" ${config.page >= config.totalPages ? "disabled" : ""} data-action="next" aria-label="Next page">
          ›
        </button>
      `;

			container.innerHTML = html;

			// Bind events
			$$("[data-page]", container).forEach((btn) => {
				btn.addEventListener("click", () => {
					const page = parseInt(btn.dataset.page, 10);
					setPage(page);
				});
			});

			const prevBtn = container.querySelector('[data-action="prev"]');
			const nextBtn = container.querySelector('[data-action="next"]');

			if (prevBtn) {
				prevBtn.addEventListener("click", () => setPage(config.page - 1));
			}
			if (nextBtn) {
				nextBtn.addEventListener("click", () => setPage(config.page + 1));
			}
		}

		function setPage(page) {
			if (page < 1 || page > config.totalPages || page === config.page) return;

			config.page = page;
			render();

			if (config.onChange) {
				config.onChange(page);
			}
		}

		function setTotalPages(totalPages) {
			config.totalPages = totalPages;
			if (config.page > totalPages) {
				config.page = totalPages;
			}
			render();
		}

		// Initialize
		render();

		return {
			getPage: () => config.page,
			setPage,
			setTotalPages,
			render,
		};
	}

	/* ========================================
     Auto-initialization
     ======================================== */

	/**
	 * Auto-initialize all components with data-bt attribute
	 */
	function init() {
		// Select
		$$("[data-bt-select]").forEach((el) => {
			if (!el._btSelect) {
				el._btSelect = Select(el);
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
			const targetId = btn.dataset.btModalOpen;
			const modal = $(`#${targetId}`);
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
				el._btPagination = Pagination(el, { page, totalPages });
			}
		});
	}

	// Auto-init on DOM ready
	if (typeof document !== "undefined") {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}
	}

	/* ========================================
     Public API
     ======================================== */

	return {
		// Components
		Select,
		Modal,
		Alert,
		Toggle,
		Pagination,

		// Utilities
		init,
		generateId,
		$,
		$$,
		on,

		// Version
		version: "1.0.0",
	};
});
