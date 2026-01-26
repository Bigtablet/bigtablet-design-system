/**
 * Bigtablet Design System - Vanilla JavaScript
 * For use with plain HTML/CSS/JS, Thymeleaf, JSP, etc.
 *
 * @version 1.0.0
 * @license MIT
 */

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
      ? define(factory)
      : ((global = global || self), (global.Bigtablet = factory()));
})(this, function () {
  "use strict";

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

  /* ========================================
     Select Component
     ======================================== */

  /**
   * Initialize Select component
   * @param {HTMLElement|string} element - Select wrapper element or selector
   * @param {Object} options - Configuration options
   */
  function Select(element, options = {}) {
    const wrapper =
      typeof element === "string" ? $(element) : element;
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

    // Parse options from data attributes or config
    const optionsData = wrapper.dataset.options
      ? JSON.parse(wrapper.dataset.options)
      : config.options || [];

    state.options = optionsData;

    // Create DOM structure
    const controlId = wrapper.id || generateId("select");
    const listId = `${controlId}_listbox`;

    const control = wrapper.querySelector(".bt-select__control");
    const list = wrapper.querySelector(".bt-select__list");

    if (!control || !list) {
      console.warn("Select: Missing required elements (.bt-select__control, .bt-select__list)");
      return null;
    }

    // State management
    function setValue(newValue) {
      state.value = newValue;
      const option = state.options.find((o) => o.value === newValue);

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
        el.classList.toggle("is-selected", state.options[i]?.value === newValue);
      });

      if (config.onChange) {
        config.onChange(newValue, option);
      }
    }

    function open() {
      if (config.disabled) return;

      state.isOpen = true;
      control.classList.add("is-open");
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
        el.classList.toggle("is-active", i === state.activeIndex);
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
      return function (e) {
        e.preventDefault();
        const option = state.options[index];
        if (option && !option.disabled) {
          setValue(option.value);
          close();
        }
      };
    }

    function onOptionMouseEnter(index) {
      return function () {
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
        cleanups.forEach((cleanup) => cleanup());
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

    function open() {
      state.isOpen = true;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";

      if (config.onOpen) {
        config.onOpen();
      }
    }

    function close() {
      state.isOpen = false;
      modal.classList.remove("is-open");
      document.body.style.overflow = "";

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
      if (config.closeOnEscape && e.key === "Escape" && state.isOpen) {
        close();
      }
    }

    // Bind events
    const cleanups = [
      on(modal, "click", onOverlayClick),
      on(document, "keydown", onKeyDown),
    ];

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
        cleanups.forEach((cleanup) => cleanup());
        document.body.style.overflow = "";
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
        ${config.title ? `<div class="bt-alert__title">${config.title}</div>` : ""}
        <div class="bt-alert__message">${config.message}</div>
        <div class="bt-alert__actions" style="justify-content: ${
          config.actionsAlign === "left"
            ? "flex-start"
            : config.actionsAlign === "center"
              ? "center"
              : "flex-end"
        }">
          ${
            config.showCancel
              ? `<button class="bt-button bt-button--md bt-button--secondary" data-alert-cancel>${config.cancelText}</button>`
              : ""
          }
          <button class="bt-button bt-button--md bt-button--primary" data-alert-confirm>${config.confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    function close() {
      overlay.classList.remove("is-open");
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = "";
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

    // Close on Escape
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", onKeyDown);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return { close };
  }

  /* ========================================
     Switch Component
     ======================================== */

  /**
   * Initialize Switch component
   * @param {HTMLElement|string} element - Switch element or selector
   * @param {Object} options - Configuration options
   */
  function Switch(element, options = {}) {
    const switchEl = typeof element === "string" ? $(element) : element;
    if (!switchEl) return null;

    const config = {
      defaultChecked: false,
      disabled: false,
      onChange: null,
      ...options,
    };

    const state = {
      checked: config.defaultChecked || switchEl.classList.contains("bt-switch--on"),
    };

    function setChecked(checked) {
      state.checked = checked;
      switchEl.classList.toggle("bt-switch--on", checked);

      if (config.onChange) {
        config.onChange(checked);
      }
    }

    function toggle() {
      if (!config.disabled && !switchEl.classList.contains("bt-switch--disabled")) {
        setChecked(!state.checked);
      }
    }

    const cleanup = on(switchEl, "click", toggle);

    // Initialize
    if (config.defaultChecked) {
      setChecked(true);
    }

    return {
      isChecked: () => state.checked,
      setChecked,
      toggle,
      setDisabled: (disabled) => {
        config.disabled = disabled;
        switchEl.classList.toggle("bt-switch--disabled", disabled);
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
    const container =
      typeof element === "string" ? $(element) : element;
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

      items.forEach((item, idx) => {
        if (item === "ellipsis") {
          html += `<span class="bt-pagination__ellipsis" aria-hidden="true">…</span>`;
        } else {
          const isActive = item === config.page;
          html += `
            <button
              class="bt-pagination__page${isActive ? " bt-pagination__page--active" : ""}"
              data-page="${item}"
              ${isActive ? 'aria-current="page"' : ""}
            >
              ${item}
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

    // Modal triggers
    $$("[data-bt-modal-open]").forEach((btn) => {
      const targetId = btn.dataset.btModalOpen;
      const modal = $(`#${targetId}`);
      if (modal && modal._btModal) {
        btn.addEventListener("click", () => modal._btModal.open());
      }
    });

    // Switch
    $$("[data-bt-switch]").forEach((el) => {
      if (!el._btSwitch) {
        el._btSwitch = Switch(el);
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
    Switch,
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
