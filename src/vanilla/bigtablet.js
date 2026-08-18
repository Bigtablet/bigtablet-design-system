/**
 * Bigtablet Design System - Vanilla JavaScript
 * For use with plain HTML/CSS/JS, Thymeleaf, JSP, etc.
 *
 * @version 1.0.0
 * @license Bigtablet Inc. Open Source License - see LICENSE at the repo root
 *          (https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)
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
		const body = document.body;
		const html = document.documentElement;
		const n = parseInt(body.dataset.btOpenModals || "0", 10);
		if (n === 0) {
			// overflow 를 건드리기 전에 스크롤바 폭을 잰다 - 잠근 뒤엔 clientWidth 가 이미 넓어져 0 이 된다.
			const scrollbarWidth = window.innerWidth - html.clientWidth;

			// 소비자가 인라인으로 지정해둔 값들을 저장했다가 마지막 unlock 때 복원
			// (React 쪽 utils/scroll-lock.ts 와 동일 동작).
			body.dataset.btOriginalOverflow = body.style.overflow;
			body.dataset.btOriginalGutter = html.style.scrollbarGutter;
			body.dataset.btOriginalPaddingRight = body.style.paddingRight;
			// 소비자가 이 변수를 직접 인라인으로 잡아둔 경우 잠금 한 번에 지워지지 않도록 함께 스냅샷.
			body.dataset.btOriginalScrollbarWidthVar =
				html.style.getPropertyValue("--bt-scrollbar-width");

			if (scrollbarWidth > 0) {
				// 잰 폭을 노출 - 앱의 `right: 0` 고정 요소가 이 변수로 자체 보정할 수 있다.
				html.style.setProperty("--bt-scrollbar-width", `${scrollbarWidth}px`);
				// `scrollbar-gutter: stable` 을 쓰는 앱은 잠금 중에도 거터가 남고, `position: fixed`
				// 의 컨테이닝 블록이 거터를 제외한 콘텐츠 영역이라 오버레이가 그 폭에 닿지 못한다
				// (dim 옆에 밝은 띠). 거터를 놓아 전폭으로 만들고 그만큼 padding 으로 되돌린다.
				html.style.scrollbarGutter = "auto";
				const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
				body.style.paddingRight = `${current + scrollbarWidth}px`;
			}

			body.style.overflow = "hidden";
		}
		body.dataset.btOpenModals = String(n + 1);
	}

	function unlockScroll() {
		const body = document.body;
		const html = document.documentElement;
		const n = parseInt(body.dataset.btOpenModals || "1", 10) - 1;
		if (n <= 0) {
			body.style.overflow = body.dataset.btOriginalOverflow || "";
			body.style.paddingRight = body.dataset.btOriginalPaddingRight || "";
			html.style.scrollbarGutter = body.dataset.btOriginalGutter || "";
			if (body.dataset.btOriginalScrollbarWidthVar) {
				html.style.setProperty("--bt-scrollbar-width", body.dataset.btOriginalScrollbarWidthVar);
			} else {
				html.style.removeProperty("--bt-scrollbar-width");
			}
			delete body.dataset.btOpenModals;
			delete body.dataset.btOriginalOverflow;
			delete body.dataset.btOriginalGutter;
			delete body.dataset.btOriginalPaddingRight;
			delete body.dataset.btOriginalScrollbarWidthVar;
		} else {
			body.dataset.btOpenModals = String(n);
		}
	}

	/* ========================================
     Dropdown Component
     ======================================== */

	/** 검색 매칭용 정규화 - 대소문자·공백 무시 (React `normalizeForSearch` 와 동일 규칙) */
	function normalizeForSearch(str) {
		return String(str).toLowerCase().replace(/\s+/g, "");
	}

	/**
	 * data-* boolean 속성 파싱 - 속성이 없으면 undefined(=설정 안 함),
	 * 있으면 `"false"` 만 false 로 보고 나머지(빈 문자열 포함)는 true.
	 */
	function parseBoolAttr(value) {
		if (value === undefined) return undefined;
		return value !== "false";
	}

	/** 검색 행 아이콘 (lucide `Search` 와 동일한 path - React Dropdown 이 쓰는 아이콘) */
	const SEARCH_ICON_SVG =
		'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
		'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
		'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

	/** 다중 선택 체크 아이콘 (lucide `Check`) - 선택 여부는 CSS 가 토글한다 */
	const CHECK_ICON_SVG =
		'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
		'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
		'<path d="M20 6 9 17l-5-5"/></svg>';

	/**
	 * Initialize Dropdown component (React `<Dropdown>` 의 Vanilla 대응)
	 *
	 * React 와 동일하게 단일 선택(기본), `multiple`(다중 선택), `searchable`(검색)을 지원한다.
	 * 값 타입도 React `value` prop 과 같은 규칙 - 단일은 `string | null`, 다중은 `string[]`.
	 * @param {HTMLElement|string} element - Dropdown wrapper element or selector
	 * @param {Object} options - Configuration options
	 */
	function Dropdown(element, options = {}) {
		const wrapper = typeof element === "string" ? $(element) : element;
		if (!wrapper) return null;

		const config = {
			placeholder: "Select...",
			disabled: false,
			// React Dropdown 과 동일한 이름의 옵션들 (별칭 없음).
			multiple: false,
			searchable: false,
			searchPlaceholder: "검색…",
			emptyText: "결과 없음",
			selectedSummary: (count) => `${count}개 선택`,
			// React Dropdown 과 동일한 값 변경 콜백.
			onValueChange: null,
			...options,
		};

		// data-* 폴백 - data-options / data-name 과 같은 기존 규칙의 연장.
		// JS 로 명시한 값이 항상 우선하고, 속성은 서버 템플릿 전용 진입점이다.
		if (options.multiple === undefined) {
			const attr = parseBoolAttr(wrapper.dataset.multiple);
			if (attr !== undefined) config.multiple = attr;
		}
		if (options.searchable === undefined) {
			const attr = parseBoolAttr(wrapper.dataset.searchable);
			if (attr !== undefined) config.searchable = attr;
		}
		if (options.searchPlaceholder === undefined && wrapper.dataset.searchPlaceholder) {
			config.searchPlaceholder = wrapper.dataset.searchPlaceholder;
		}
		if (options.emptyText === undefined && wrapper.dataset.emptyText) {
			config.emptyText = wrapper.dataset.emptyText;
		}
		if (options.placeholder === undefined && wrapper.dataset.placeholder) {
			config.placeholder = wrapper.dataset.placeholder;
		} else if (options.placeholder === undefined) {
			// 서버 마크업의 `.bt-dropdown__placeholder` 텍스트를 기본 placeholder 로 이어받는다.
			// (없으면 값을 지웠을 때 마크업에 쓴 문구 대신 라이브러리 기본값이 튀어나온다.)
			const markupPlaceholder = wrapper
				.querySelector(".bt-dropdown__placeholder")
				?.textContent.trim();
			if (markupPlaceholder) config.placeholder = markupPlaceholder;
		}

		const multiple = config.multiple === true;
		const searchable = config.searchable === true;

		const state = {
			isOpen: false,
			// 단일 모드 값 (string | null) / 다중 모드 값 목록 (string[]) - 모드에 따라 하나만 쓴다.
			value: null,
			values: [],
			activeIndex: -1,
			options: [],
			// 검색 필터를 통과한 옵션들의 raw index 목록 (searchable 아니면 전체)
			visible: [],
			// searchText 는 표시용(IME 조합 중에도 즉시 반영), committedQuery 는 필터용(조합 완료 시 반영)
			committedQuery: "",
		};
		let isComposing = false;

		// Create DOM structure
		const controlId = wrapper.id || generateId("dropdown");

		const control = wrapper.querySelector(".bt-dropdown__control");
		let panel = wrapper.querySelector(".bt-dropdown__list");

		if (!control || !panel) {
			console.warn(
				"Dropdown: Missing required elements (.bt-dropdown__control, .bt-dropdown__list)",
			);
			return null;
		}

		// 패널 구조 정규화 - React 는 `__list`(패널) > [`__search`] + `__options`(role=listbox, 스크롤)다.
		// Vanilla 는 `<ul class="bt-dropdown__list">` 에 `<li>` 를 직접 두는 평면 마크업을 계속
		// 지원해야 하므로, `__options` 컨테이너가 없으면 `__list` 자체를 listbox 로 쓴다.
		// 단 searchable 은 검색 행이 패널 안에 들어가야 하는데 `<ul>` 의 자식은 `<li>` 만 유효하다.
		// 그래서 평면 마크업 + searchable 이면 여기서 패널 `<div>` 로 감싸 올린다
		// (서버 템플릿을 고치지 않아도 검색이 동작하도록).
		let listbox = panel.querySelector(".bt-dropdown__options");
		if (!listbox) {
			if (searchable) {
				const inner = panel;
				// `bt-dropdown__list*` 만 새 패널로 옮긴다. 소비자가 붙인 커스텀 클래스는 원래
				// 붙어 있던 요소(= 이제 `__options` 스크롤 컨테이너)에 그대로 둔다 - 클래스가
				// 노드를 따라가야 리스트 내부를 겨냥한 셀렉터가 유지된다. 패널 wrapper 를
				// 직접 스타일링하려면 `__options` 를 포함한 최종 구조를 마크업에 직접 쓰면
				// 이 승격 자체를 건너뛴다 (docs/VANILLA.md 의 주의 박스 참고).
				const listClasses = Array.from(inner.classList).filter((c) =>
					c.startsWith("bt-dropdown__list"),
				);
				const newPanel = document.createElement("div");
				newPanel.className = listClasses.join(" ");
				inner.classList.remove(...listClasses);
				inner.classList.add("bt-dropdown__options");
				// 마크업이 FOUC 방지용으로 걸어둔 inline display:none 은 패널로 넘긴다.
				inner.style.display = "";
				inner.parentNode.insertBefore(newPanel, inner);
				newPanel.appendChild(inner);
				listbox = inner;
				panel = newPanel;
			} else {
				listbox = panel;
			}
		}

		// 초기 비활성 상태 흡수 - 서버가 native `disabled` 또는 `is-disabled` 로 렌더링했으면 config 에 반영.
		// 이후 native disabled / aria-disabled / 스타일 클래스를 함께 동기화한다 (React 는 native disabled 사용).
		if (control.disabled || control.classList.contains("is-disabled")) config.disabled = true;
		control.disabled = config.disabled;
		control.setAttribute("aria-disabled", config.disabled ? "true" : "false");
		control.classList.toggle("is-disabled", config.disabled);

		// Parse options: data-options JSON > JS config > 서버 렌더링된 <li data-value> 마크업.
		// Thymeleaf/JSP 처럼 서버가 옵션 li 를 직접 렌더링하는 경우(문서화된 기본 마크업)를
		// 지원해야 하므로 DOM 파싱이 반드시 필요하다.
		// data-options 는 잘못된 JSON(작은따옴표 등)이면 스크립트 전체가 크래시하므로 방어적 파싱.
		const parseDomOptions = () =>
			$$(".bt-dropdown__option", listbox).map((el) => ({
				value: el.dataset.value !== undefined ? el.dataset.value : el.textContent.trim(),
				label: el.textContent.trim(),
				disabled: el.classList.contains("is-disabled"),
			}));

		// data-options 가 유효한 배열이면(빈 배열 포함) 그대로 존중 - 명시적 빈 배열은 "옵션 없음"
		// 의도이므로 DOM 파싱으로 덮지 않는다. undefined(속성 없음/파싱 실패)일 때만 폴백.
		let optionsData;
		if (wrapper.dataset.options) {
			try {
				const parsed = JSON.parse(wrapper.dataset.options);
				if (Array.isArray(parsed)) optionsData = parsed;
				else console.warn("Dropdown: data-options is not a JSON array");
			} catch (e) {
				console.warn("Dropdown: invalid JSON in data-options", e);
			}
		}
		if (optionsData === undefined) {
			// config.options 도 배열이면(빈 배열 포함) 존중 - data-options 와 동일하게 명시적 빈
			// 배열을 "옵션 없음"으로 처리하고 DOM 파싱으로 덮지 않는다.
			optionsData = Array.isArray(config.options) ? config.options : parseDomOptions();
		}

		state.options = optionsData;

		// 옵션 DOM. 데이터만 넘기고 `<li>` 를 서버가 렌더링하지 않은 경우(data-options / config.options
		// 단독 사용)에는 여기서 생성한다 - 그래야 데이터와 DOM 인덱스가 항상 1:1 로 맞는다.
		let optionEls = $$(".bt-dropdown__option", listbox);
		if (optionEls.length === 0 && state.options.length > 0) {
			const itemTag = listbox.tagName === "UL" || listbox.tagName === "OL" ? "li" : "div";
			state.options.forEach((opt) => {
				const el = document.createElement(itemTag);
				el.className = "bt-dropdown__option";
				if (opt.disabled) el.classList.add("is-disabled");
				el.dataset.value = opt.value;
				// textContent - 라벨은 소비자 데이터라 innerHTML 금지 (XSS)
				el.textContent = opt.label;
				listbox.appendChild(el);
			});
			optionEls = $$(".bt-dropdown__option", listbox);
		}

		// Combobox ARIA (WAI-ARIA APG combobox) - React Dropdown 과 패리티.
		// searchable 이면 React 처럼 combobox 역할을 검색 입력이 갖고, 트리거는 팝업 버튼으로 남는다.
		listbox.id = listbox.id || `${controlId}_listbox`;
		listbox.setAttribute("role", "listbox");
		if (multiple) listbox.setAttribute("aria-multiselectable", "true");
		control.setAttribute("aria-haspopup", "listbox");
		control.setAttribute("aria-expanded", "false");
		control.setAttribute("aria-controls", listbox.id);
		if (searchable) control.removeAttribute("role");
		else control.setAttribute("role", "combobox");

		optionEls.forEach((el, i) => {
			el.id = el.id || `${controlId}_option_${i}`;
			el.setAttribute("role", "option");
			el.setAttribute("aria-selected", "false");
			if (state.options[i]?.disabled) el.setAttribute("aria-disabled", "true");
			// 다중 선택: 왼쪽 체크 슬롯. 미선택 시에도 폭을 유지해 라벨 정렬이 흔들리지 않는다.
			if (multiple && !el.querySelector(".bt-dropdown__option-check")) {
				const check = document.createElement("span");
				check.className = "bt-dropdown__option-check";
				check.setAttribute("aria-hidden", "true");
				check.innerHTML = CHECK_ICON_SVG; // 정적 문자열 - 소비자 데이터 아님
				el.insertBefore(check, el.firstChild);
			}
		});

		// 검색 행 (searchable) - React `.dropdown_search` 구조와 동일.
		let searchInput = null;
		let emptyEl = null;
		if (searchable) {
			let searchRow = panel.querySelector(".bt-dropdown__search");
			if (!searchRow) {
				searchRow = document.createElement("div");
				searchRow.className = "bt-dropdown__search";
				const icon = document.createElement("span");
				icon.className = "bt-dropdown__search-icon";
				icon.setAttribute("aria-hidden", "true");
				icon.innerHTML = SEARCH_ICON_SVG; // 정적 문자열 - 소비자 데이터 아님
				searchRow.appendChild(icon);
				panel.insertBefore(searchRow, panel.firstChild);
			}
			searchInput = searchRow.querySelector(".bt-dropdown__search-input");
			if (!searchInput) {
				searchInput = document.createElement("input");
				searchInput.type = "text";
				searchInput.className = "bt-dropdown__search-input";
				searchInput.autocomplete = "off";
				searchRow.appendChild(searchInput);
			}
			searchInput.placeholder = config.searchPlaceholder;
			searchInput.setAttribute("aria-label", config.searchPlaceholder);
			searchInput.setAttribute("role", "combobox");
			searchInput.setAttribute("aria-autocomplete", "list");
			searchInput.setAttribute("aria-expanded", "false");
			searchInput.setAttribute("aria-controls", listbox.id);

			// 필터 결과 0개 안내 (React `.dropdown_empty`)
			emptyEl = listbox.querySelector(".bt-dropdown__empty");
			if (!emptyEl) {
				const emptyTag = listbox.tagName === "UL" || listbox.tagName === "OL" ? "li" : "div";
				emptyEl = document.createElement(emptyTag);
				emptyEl.className = "bt-dropdown__empty";
				listbox.appendChild(emptyEl);
			}
			emptyEl.textContent = config.emptyText;
			emptyEl.hidden = true;
		}

		/** aria-activedescendant 를 갖는 요소 - searchable 이면 검색 입력, 아니면 트리거 */
		const activeDescendantHost = () => (searchable ? searchInput : control);

		// 폼 제출 참여: name(설정 또는 data-name, 서버가 미리 렌더링한 hidden input 의 name)이 있으면
		// 값을 hidden input 으로 노출한다. 다중 모드는 React 와 동일하게 **같은 name 의 input 을 반복**한다.
		// 서버 템플릿(th:field 등)이 미리 렌더링한 hidden input 이 있으면 그대로 재사용한다.
		const hiddenEls = $$('input[type="hidden"]', wrapper);
		const hiddenName = config.name || wrapper.dataset.name || hiddenEls[0]?.name || null;
		if (hiddenEls.length === 0 && hiddenName) {
			const el = document.createElement("input");
			el.type = "hidden";
			el.name = hiddenName;
			wrapper.appendChild(el);
			hiddenEls.push(el);
		}

		function syncHiddenInputs() {
			if (!hiddenName) return;
			// 단일: 항상 1개 유지(빈 값이라도 전송 - 기존 동작). 다중: 선택 개수만큼 반복, 0개면 없음(React 와 동일).
			const values = multiple
				? state.values.map((v) => (v == null ? "" : String(v)))
				: [state.value == null ? "" : String(state.value)];
			while (hiddenEls.length > values.length) {
				hiddenEls.pop().remove();
			}
			while (hiddenEls.length < values.length) {
				const el = document.createElement("input");
				el.type = "hidden";
				el.name = hiddenName;
				wrapper.appendChild(el);
				hiddenEls.push(el);
			}
			hiddenEls.forEach((el, i) => {
				el.value = values[i];
			});
		}

		// String 비교 - 서버 hidden input 초기값(항상 문자열)과 JS config 의 숫자 value 가
		// 섞여도 매칭되도록 (엄격 === 이면 조용히 placeholder 로 남던 문제 방지).
		function findOption(value) {
			return state.options.find((o) => String(o.value) === String(value));
		}

		function isSelected(value) {
			if (value === undefined) return false;
			return multiple
				? state.values.some((v) => String(v) === String(value))
				: state.value != null && String(state.value) === String(value);
		}

		function selectedOptions() {
			return state.values.map(findOption).filter(Boolean);
		}

		/** 트리거 텍스트 + 옵션 selected 상태 + hidden input 을 현재 값에 맞춰 갱신 */
		function renderSelection() {
			const valueEl = control.querySelector(".bt-dropdown__value, .bt-dropdown__placeholder");
			if (valueEl) {
				let text = config.placeholder;
				let hasValue = false;
				if (multiple) {
					// React 와 동일하게 chip 이 아니라 "N개 선택" 요약 문자열을 보여준다.
					hasValue = state.values.length > 0;
					if (hasValue) text = config.selectedSummary(state.values.length);
				} else {
					const option = findOption(state.value);
					hasValue = Boolean(option);
					if (option) text = option.label;
				}
				valueEl.textContent = text;
				valueEl.classList.toggle("bt-dropdown__value", hasValue);
				valueEl.classList.toggle("bt-dropdown__placeholder", !hasValue);
			}

			optionEls.forEach((el, i) => {
				const selected = isSelected(state.options[i]?.value);
				el.classList.toggle("is-selected", selected);
				el.setAttribute("aria-selected", selected ? "true" : "false");
			});

			syncHiddenInputs();
		}

		/**
		 * 값 설정. React `value` prop 과 같은 타입 규칙 -
		 * 단일 모드는 `string | null`, 다중 모드는 `string[]`(단일 값을 주면 1개짜리로 승격).
		 */
		function setValue(newValue) {
			if (multiple) {
				state.values =
					newValue == null ? [] : Array.isArray(newValue) ? newValue.slice() : [newValue];
				renderSelection();
				if (config.onValueChange) config.onValueChange(state.values.slice(), selectedOptions());
			} else {
				state.value = Array.isArray(newValue) ? (newValue[0] ?? null) : newValue;
				renderSelection();
				if (config.onValueChange)
					config.onValueChange(state.value, findOption(state.value) ?? null);
			}
		}

		/** 다중 모드 토글 - React `toggleMultiple` 과 동일하게 선택 순서를 유지한다 */
		function toggleValue(option) {
			const next = isSelected(option.value)
				? state.values.filter((v) => String(v) !== String(option.value))
				: [...state.values, option.value];
			setValue(next);
		}

		function updateActiveOption() {
			let activeId = null;
			optionEls.forEach((el, i) => {
				const active = i === state.activeIndex;
				el.classList.toggle("is-active", active);
				if (active) activeId = el.id;
			});
			// 키보드 탐색 중 활성 옵션을 AT 에 전달 (없으면 화살표 탐색이 스크린리더에 무음).
			// 활성 옵션이 없으면(activeIndex=-1 등) 잘못된 참조가 남지 않게 속성을 제거.
			const host = activeDescendantHost();
			if (!host) return;
			if (activeId) {
				host.setAttribute("aria-activedescendant", activeId);
			} else {
				host.removeAttribute("aria-activedescendant");
			}
		}

		/** 필터를 통과하고 비활성이 아닌 첫 옵션의 raw index (없으면 -1) */
		function firstEnabledVisible() {
			return state.visible.find((i) => !state.options[i]?.disabled) ?? -1;
		}

		/**
		 * 검색어 기준으로 옵션 표시/숨김을 갱신한다.
		 * 키보드 탐색·Enter 선택은 모두 여기서 만든 `state.visible`(필터된 목록) 위에서 동작한다.
		 */
		function applyFilter() {
			const query = searchable ? normalizeForSearch(state.committedQuery) : "";
			state.visible = [];
			optionEls.forEach((el, i) => {
				const label = state.options[i]?.label ?? el.textContent;
				const match = query === "" || normalizeForSearch(label).includes(query);
				el.hidden = !match;
				if (match) state.visible.push(i);
			});
			if (emptyEl) emptyEl.hidden = state.visible.length > 0;
			if (!state.isOpen) {
				state.activeIndex = -1;
			} else if (!state.visible.includes(state.activeIndex)) {
				// 활성 옵션이 필터로 사라졌으면 첫 후보로 되돌린다
				state.activeIndex = firstEnabledVisible();
			}
			updateActiveOption();
		}

		function open() {
			if (config.disabled || control.disabled) return;

			state.isOpen = true;
			control.classList.add("is-open");
			control.setAttribute("aria-expanded", "true");
			panel.style.display = "block";
			if (searchInput) searchInput.setAttribute("aria-expanded", "true");

			// Calculate position (auto-flip)
			const rect = control.getBoundingClientRect();
			const listHeight = Math.min(state.options.length * 40, 288);
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;

			if (spaceBelow < listHeight && spaceAbove > spaceBelow) {
				panel.classList.add("bt-dropdown__list--up");
			} else {
				panel.classList.remove("bt-dropdown__list--up");
			}

			// Set active index - 선택된 항목이 있으면 그쪽, 없으면 첫 후보 (React 와 동일).
			// applyFilter 가 필터 밖(=-1 포함)이면 첫 후보로 보정한다.
			state.activeIndex = state.options.findIndex((o) => isSelected(o.value) && !o.disabled);
			applyFilter();

			if (searchInput) searchInput.focus();

			// Rotate icon
			const icon = control.querySelector(".bt-dropdown__icon");
			if (icon) icon.classList.add("is-open");
		}

		function close() {
			state.isOpen = false;
			control.classList.remove("is-open");
			control.setAttribute("aria-expanded", "false");
			control.removeAttribute("aria-activedescendant");
			panel.style.display = "none";

			// 패널을 닫으면 검색 상태 초기화 (다음 열림 시 fresh - React 와 동일)
			if (searchInput) {
				searchInput.value = "";
				searchInput.setAttribute("aria-expanded", "false");
				searchInput.removeAttribute("aria-activedescendant");
			}
			state.committedQuery = "";
			isComposing = false;
			state.activeIndex = -1;
			applyFilter();

			const icon = control.querySelector(".bt-dropdown__icon");
			if (icon) icon.classList.remove("is-open");
		}

		/** searchable 은 포커스가 검색 입력에 있으므로 닫을 때 트리거로 되돌린다 (React `closePanel`) */
		function closePanel() {
			const wasOpen = state.isOpen;
			close();
			if (wasOpen && searchable) control.focus();
		}

		function toggle() {
			if (state.isOpen) {
				close();
			} else {
				open();
			}
		}

		/** 필터된 목록 위에서 활성 항목을 이동한다 (비활성 옵션은 건너뛰고 순환) */
		function moveActive(dir) {
			const candidates = state.visible.filter((i) => !state.options[i]?.disabled);
			if (candidates.length === 0) return;
			const pos = candidates.indexOf(state.activeIndex);
			state.activeIndex =
				pos === -1
					? dir === 1
						? candidates[0]
						: candidates[candidates.length - 1]
					: candidates[(pos + dir + candidates.length) % candidates.length];
			updateActiveOption();
		}

		/** 옵션 확정 - 단일은 선택 후 닫고, 다중은 토글만 하고 패널을 유지한다 (React 와 동일) */
		function selectOption(index) {
			const option = state.options[index];
			if (!option || option.disabled) return;
			if (multiple) {
				toggleValue(option);
			} else {
				setValue(option.value);
				closePanel();
			}
		}

		function selectActive() {
			if (!state.visible.includes(state.activeIndex)) return;
			selectOption(state.activeIndex);
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
					state.activeIndex = firstEnabledVisible();
					updateActiveOption();
					break;
				case "End":
					e.preventDefault();
					open();
					for (let i = state.visible.length - 1; i >= 0; i--) {
						if (!state.options[state.visible[i]]?.disabled) {
							state.activeIndex = state.visible[i];
							updateActiveOption();
							break;
						}
					}
					break;
				case "Escape":
					e.preventDefault();
					close();
					break;
				case "Tab":
					// APG Combobox: Tab 은 리스트를 닫고 자연스러운 포커스 이동을 허용 (preventDefault 안 함)
					close();
					break;
			}
		}

		// 검색 입력 내 키보드 - ↑/↓ 이동, Enter 선택/토글, Esc 닫기. Home/End 는 커서 이동에 양보.
		function onSearchKeyDown(e) {
			// IME 조합 중 Enter 는 조합 확정용 - 선택/토글·네비게이션·닫기 트리거 금지
			// (`keyCode === 229` 는 isComposing 을 채우지 않는 구형 브라우저 폴백)
			if (e.isComposing || e.keyCode === 229) return;
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					moveActive(1);
					break;
				case "ArrowUp":
					e.preventDefault();
					moveActive(-1);
					break;
				case "Enter":
					e.preventDefault();
					selectActive();
					break;
				case "Escape":
					e.preventDefault();
					closePanel();
					break;
				case "Tab":
					// APG Combobox: Tab 은 리스트를 닫는다. closePanel 이 트리거로 포커스를
					// 되돌린 뒤 브라우저 기본 Tab 이동이 이어진다 (preventDefault 안 함).
					closePanel();
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
				selectOption(index);
			};
		}

		function onOptionMouseEnter(index) {
			return () => {
				if (!state.options[index]?.disabled) {
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

		optionEls.forEach((el, i) => {
			cleanups.push(on(el, "click", onOptionClick(i)));
			cleanups.push(on(el, "mouseenter", onOptionMouseEnter(i)));
		});

		if (searchInput) {
			// IME(한글 등) 조합 중에는 필터 갱신을 보류한다 - 조합 중간 자모로 리스트가 튀지 않게.
			// 표시값은 input 자체가 즉시 반영하고, 필터용 committedQuery 만 조합 완료 시 커밋한다.
			cleanups.push(
				on(searchInput, "compositionstart", () => {
					isComposing = true;
				}),
			);
			cleanups.push(
				on(searchInput, "compositionend", (e) => {
					isComposing = false;
					state.committedQuery = e.target.value;
					applyFilter();
				}),
			);
			cleanups.push(
				on(searchInput, "input", (e) => {
					if (isComposing) return;
					state.committedQuery = e.target.value;
					applyFilter();
				}),
			);
			cleanups.push(on(searchInput, "keydown", onSearchKeyDown));
		}

		// Initialize.
		// 서버 바인딩(th:field 등) 초기값은 renderSelection 이 hidden input 을 재동기화하기 **전에**
		// 읽어 둔다 (다중 모드에서 선택 0개 = input 0개라 먼저 렌더하면 초기값이 지워진다).
		const serverValues = hiddenEls.map((el) => el.value).filter((v) => v !== "");
		panel.style.display = "none";
		applyFilter();
		renderSelection();
		if (multiple) {
			const initial = Array.isArray(config.defaultValue)
				? config.defaultValue
				: config.defaultValue != null
					? [config.defaultValue]
					: serverValues;
			if (initial.length > 0) setValue(initial);
			// `!= null` 로 판단 - truthy 검사면 빈 문자열("")도 유효한 값인데 미지정으로 보고
			// 서버 값/placeholder 로 넘어간다. 위 multiple 분기와 같은 기준.
		} else if (config.defaultValue != null) {
			setValue(config.defaultValue);
		} else if (serverValues[0]) {
			setValue(serverValues[0]);
		}

		// Public API
		return {
			/** 단일 모드는 `string | null`, 다중 모드는 `string[]` (React `value` prop 과 같은 규칙) */
			getValue: () => (multiple ? state.values.slice() : state.value),
			setValue,
			open,
			close,
			toggle,
			setDisabled: (disabled) => {
				config.disabled = disabled;
				control.disabled = disabled;
				control.setAttribute("aria-disabled", disabled ? "true" : "false");
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
		let panelTabindexAdded = false;

		// Dialog ARIA - React Modal 과 패리티. 접근 가능한 이름(aria-labelledby/label)도 연결한다
		// (없으면 axe aria-dialog-name 실패). 헤더가 있으면 그 id 로, 없으면 aria-label fallback.
		if (panel) {
			panel.setAttribute("role", "dialog");
			panel.setAttribute("aria-modal", "true");
			if (!panel.hasAttribute("aria-label") && !panel.hasAttribute("aria-labelledby")) {
				const header = panel.querySelector(".bt-modal__header");
				if (header) {
					header.id = header.id || generateId("modal_title");
					panel.setAttribute("aria-labelledby", header.id);
				} else {
					panel.setAttribute("aria-label", "Dialog");
				}
			}
		}

		function open() {
			if (state.isOpen) return; // 이미 열림 - 중복 lockScroll 방지
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
					panelTabindexAdded = true;
					panel.focus();
				}
			}

			if (config.onOpen) {
				config.onOpen();
			}
		}

		function close() {
			if (!state.isOpen) return; // 이미 닫힘 - 중복 unlockScroll 방지
			state.isOpen = false;
			modal.classList.remove("is-open");
			unlockScroll();

			// 우리가 추가한 tabindex 정리 (React useFocusTrap 의 wasTabIndexAdded 와 동일)
			if (panelTabindexAdded && panel) {
				panel.removeAttribute("tabindex");
				panelTabindexAdded = false;
			}

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

	// React Alert 와 동일한 버튼 variant (confirm=filled / cancel=outline).
	const CONFIRM_BUTTON_VARIANT = "bt-button--filled";
	const CANCEL_BUTTON_VARIANT = "bt-button--outline";

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

		const previousFocus = document.activeElement;

		document.body.appendChild(overlay);
		lockScroll();

		let isOpen = true;

		function close() {
			// 중복 호출 방지 - 버튼/오버레이/Escape 연타 시 unlockScroll 이 여러 번 불려
			// 스크롤 잠금 카운터가 오동작하지 않도록 최초 1회만 실행.
			if (!isOpen) return;
			isOpen = false;
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

		// 오버레이 클릭 / Escape 는 "취소"와 동등한 동작이어야 한다 (WAI-ARIA APG alertdialog).
		// React Alert 의 `dismiss = onCancel ?? onClose` 와 동일하게 onCancel 경로로 보내
		// 소비자의 취소 정리 로직(롤백 등)이 조용히 우회되지 않게 한다.
		function dismiss() {
			if (!isOpen) return;
			if (config.onCancel) config.onCancel();
			close();
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

		// Close on overlay click (React Alert 와 동일하게 closeOnOverlay 로 끌 수 있다)
		overlay.addEventListener("click", (e) => {
			if (config.closeOnOverlay && e.target === overlay) {
				dismiss();
			}
		});

		// Close on Escape + Tab 포커스 트랩 (WAI-ARIA APG Dialog) - Modal 과 동일 패턴
		function onKeyDown(e) {
			if (e.key === "Escape") {
				dismiss();
				return;
			}
			if (e.key === "Tab" && alertPanel) {
				const focusables = $$(FOCUSABLE_SELECTORS, alertPanel);
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
			// React Toggle 과 동일한 체크 변경 콜백.
			onCheckedChange: null,
			...options,
		};

		const state = {
			checked: config.defaultChecked || toggleEl.classList.contains("bt-toggle--on"),
		};

		// 초기 비활성 상태 흡수 - config.disabled 또는 native disabled 를 native `disabled` 로 통일
		// (React Toggle 과 동일하게 native disabled 사용 → 포커스 제외·:disabled 스타일 적용).
		if (toggleEl.disabled) config.disabled = true;
		toggleEl.disabled = config.disabled;

		// Switch 시맨틱 (React Toggle 과 패리티): role + aria-checked 를 항상 유지
		if (!toggleEl.hasAttribute("role")) toggleEl.setAttribute("role", "switch");
		// 폼 안에서 클릭이 submit 으로 새지 않도록 (button 기본 type=submit)
		if (toggleEl.tagName === "BUTTON" && !toggleEl.hasAttribute("type")) {
			toggleEl.setAttribute("type", "button");
		}

		// 폼 제출 참여: name(설정 또는 data-name)이 있으면 hidden input 으로 on/off 를 노출.
		// toggleEl 이 <button> 이면 그 안에 대화형 콘텐츠/폼 요소를 자식으로 둘 수 없어(invalid
		// HTML) hidden input 을 형제(sibling)로 삽입한다. 서버 템플릿이 미리 렌더링해둔 hidden
		// input(자식이든 형제든)이 있으면 재사용한다.
		const fieldName = config.name || toggleEl.dataset.name || null;
		// 직계 형제만 탐색 - parentNode.querySelector 는 하위 트리 전체를 뒤져 같은 부모를 공유하는
		// 다른 토글(예: 테이블 행 안 여러 토글)의 hidden input 을 잘못 집을 수 있다.
		let hiddenInput =
			toggleEl.querySelector('input[type="hidden"]') ||
			(fieldName && toggleEl.parentNode
				? Array.from(toggleEl.parentNode.children).find(
						(el) => el.tagName === "INPUT" && el.type === "hidden" && el.name === fieldName,
					)
				: null);
		if (!hiddenInput && fieldName) {
			hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.name = fieldName;
			if (toggleEl.tagName === "BUTTON" && toggleEl.parentNode) {
				toggleEl.parentNode.insertBefore(hiddenInput, toggleEl.nextSibling);
			} else {
				toggleEl.appendChild(hiddenInput);
			}
		}

		function setChecked(checked) {
			state.checked = checked;
			toggleEl.classList.toggle("bt-toggle--on", checked);
			toggleEl.setAttribute("aria-checked", checked ? "true" : "false");

			if (hiddenInput) {
				hiddenInput.value = checked ? "true" : "false";
			}

			if (config.onCheckedChange) {
				config.onCheckedChange(checked);
			}
		}

		function toggle() {
			// React Toggle 과 동일하게 native `disabled` 만 본다 (구 --disabled 클래스는 v3.8.0 에서 제거).
			if (!config.disabled && !toggleEl.disabled) {
				setChecked(!state.checked);
			}
		}

		const cleanup = on(toggleEl, "click", toggle);

		// Initialize - aria-checked/hidden input 을 초기 상태와 동기화.
		// 서버 템플릿이 boolean 을 "true" 외 표현("1"/"on"/"y"/"yes")으로 렌더링해도
		// 켜짐으로 인식하도록 관대하게 파싱 (Thymeleaf/JSP 등 표현 차이 흡수).
		if (hiddenInput && !state.checked) {
			const raw = String(hiddenInput.value).trim().toLowerCase();
			if (raw === "true" || raw === "1" || raw === "on" || raw === "y" || raw === "yes") {
				state.checked = true;
			}
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
				toggleEl.disabled = disabled;
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
			// React Pagination 과 동일한 페이지 변경 콜백.
			onPageChange: null,
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

			if (config.onPageChange) {
				config.onPageChange(page);
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
		Dropdown,
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
