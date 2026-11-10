import { t } from "./locale.js";
import { matchesSearch } from "./search.js";
import { $, $$, generateId, on, parseBoolAttr } from "./utils.js";

/* ========================================
     Dropdown Component
     ======================================== */

/** 검색 행 아이콘 (lucide `Search` 와 동일한 path - React Dropdown 이 쓰는 아이콘) */
export const SEARCH_ICON_SVG =
	'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
	'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
	'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

/** 다중 선택 체크 아이콘 (lucide `Check`) - 선택 여부는 CSS 가 토글한다 */
export const CHECK_ICON_SVG =
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
export function Dropdown(element, options = {}) {
	const wrapper = typeof element === "string" ? $(element) : element;
	if (!wrapper) return null;
	// 같은 요소에 다시 만들면 앞 인스턴스를 풀고 교체한다 (Modal · Toggle 과 같음) - document 리스너와
	// body 로 옮겨진 패널이 이중으로 남지 않게. 새 인스턴스는 앞이 만든 구조(검색 행·__options)를 재사용한다.
	wrapper._btDropdown?.destroy();

	const config = {
		placeholder: t("dropdown.placeholder"),
		disabled: false,
		// React Dropdown 과 동일한 이름의 옵션들 (별칭 없음).
		multiple: false,
		searchable: false,
		searchPlaceholder: t("dropdown.searchPlaceholder"),
		emptyText: t("dropdown.empty"),
		selectedSummary: (count) => t("dropdown.selectedSummary", { count }),
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
		// 다시 만들 때 값이 골라져 있으면 그 span 이 `__value` 라 문구를 못 읽는다 - 그때만 앞 인스턴스가 쓴 것을
		// 이어받는다. 마크업이 먼저다 - 서버가 안쪽을 새로 그려 문구가 바뀌었으면 그쪽을 따른다 (#975)
		const markupPlaceholder =
			wrapper.querySelector(".bt-dropdown__placeholder")?.textContent.trim() ||
			wrapper._btPlaceholder;
		if (markupPlaceholder) config.placeholder = markupPlaceholder;
	}
	wrapper._btPlaceholder = config.placeholder;

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

	// Create DOM structure
	const controlId = wrapper.id || generateId("dropdown");

	const control = wrapper.querySelector(".bt-dropdown__control");
	let panel = wrapper.querySelector(".bt-dropdown__list");

	if (!control || !panel) {
		console.warn("Dropdown: Missing required elements (.bt-dropdown__control, .bt-dropdown__list)");
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
	// searchable 이면 React 처럼 검색 입력도 combobox 가 되고 활성 옵션을 가리킨다 (트리거도 combobox 로 남는다).
	listbox.id = listbox.id || `${controlId}_listbox`;
	listbox.setAttribute("role", "listbox");
	if (multiple) listbox.setAttribute("aria-multiselectable", "true");
	control.setAttribute("aria-haspopup", "listbox");
	control.setAttribute("aria-expanded", "false");
	control.setAttribute("aria-controls", listbox.id);
	// React 와 같이 searchable 이어도 트리거는 combobox 다. combobox 는 내용으로 이름이 붙지 않아
	// 이름을 **라벨 + 현재 값** 으로 직접 잇는다 (APG select-only combobox).
	control.setAttribute("role", "combobox");
	// 소비자가 aria-label / aria-labelledby 를 줬으면 그대로 둔다 - labelledby 가 label 보다 우선이라 덮어쓰면 값만 읽힌다
	if (!control.hasAttribute("aria-labelledby") && !control.hasAttribute("aria-label")) {
		control.id = control.id || `${controlId}_control`;
		const labelEl = control.labels?.[0];
		if (labelEl) labelEl.id = labelEl.id || `${controlId}_label`;
		const valueEl = control.querySelector(".bt-dropdown__value, .bt-dropdown__placeholder");
		if (valueEl) valueEl.id = valueEl.id || `${controlId}_value`;
		const ids = [labelEl?.id, valueEl?.id].filter(Boolean).join(" ");
		if (ids) control.setAttribute("aria-labelledby", ids);
	}

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
		// listbox 의 자식은 option 만 - <li> 의 암시적 listitem 역할을 지운다 (React 는 <div>)
		emptyEl.setAttribute("role", "presentation");
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
			el.disabled = config.disabled;
		});
	}

	// String 비교 - 서버 hidden input 초기값(항상 문자열)과 JS config 의 숫자 value 가
	// 섞여도 매칭되도록 (엄격 === 이면 조용히 placeholder 로 남던 문제 방지).
	function findOption(value) {
		if (value == null) return undefined;
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
	function assignValue(newValue) {
		if (multiple) {
			state.values =
				newValue == null ? [] : Array.isArray(newValue) ? newValue.slice() : [newValue];
		} else {
			state.value = Array.isArray(newValue) ? (newValue[0] ?? null) : newValue;
		}
		renderSelection();
	}

	function setValue(newValue) {
		assignValue(newValue);
		if (!config.onValueChange) return;
		if (multiple) config.onValueChange(state.values.slice(), selectedOptions());
		else config.onValueChange(state.value, findOption(state.value) ?? null);
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
		let activeEl = null;
		optionEls.forEach((el, i) => {
			const active = i === state.activeIndex;
			el.classList.toggle("is-active", active);
			if (active) {
				activeId = el.id;
				activeEl = el;
			}
		});
		// 활성 항목이 스크롤 밖에 있으면 따라 스크롤한다. 포커스는 컨트롤·검색 입력에 남으므로
		// (APG) 브라우저가 알아서 해 주지 않는다 - React 번들과 같은 처리다(`block: "nearest"`
		// 로 필요한 만큼만 움직이고 페이지는 건드리지 않는다).
		activeEl?.scrollIntoView?.({ block: "nearest" });
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
		const query = searchable ? state.committedQuery : "";
		state.visible = [];
		optionEls.forEach((el, i) => {
			const label = state.options[i]?.label ?? el.textContent;
			const match = matchesSearch(label, query);
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
		// 걸러져 높이가 줄면 위로 열린 목록이 트리거에서 떨어진다 - 다시 붙인다 (#975)
		if (state.isOpen && panelHome) placePanel();
	}

	/** 바깥 클릭 리스너 해제 함수 - 열린 동안만 걸린다. */
	let untrackOutside = null;
	/** 목록의 원래 자리 - 닫을 때 되돌리려고 기억해 둔다. */
	let panelHome = null;
	/** 열려 있는 동안 좌표를 따라가는 리스너 해제 함수. */
	let untrackPanel = null;

	/**
	 * 목록을 body 로 옮기고 트리거 기준 fixed 좌표를 준다.
	 *
	 * 조상의 `overflow: hidden` 은 `z-index` 로 넘을 수 없어서(#586 - 카드 안에서 170px 목록
	 * 중 46px 만 보였다) 위치만 fixed 로 바꾸는 것으로는 부족하다 - transform 이 걸린 조상이
	 * 있으면 그것이 fixed 의 컨테이닝 블록이 되기 때문이다. 그래서 body 로 옮긴다.
	 * 아래 공간이 모자라고 위가 더 넓으면 위로 띄운다(React 배치 훅의 flip 과 같은 판정).
	 */
	function placePanel() {
		if (!panelHome) {
			panelHome = { parent: panel.parentNode, next: panel.nextSibling };
			document.body.appendChild(panel);
		}

		const rect = control.getBoundingClientRect();
		const gap = 4;
		const padding = 8;

		// 트리거 폭은 **하한**이다 - 못박으면 트리거가 좁을 때 목록이 자기 옵션 라벨을
		// ellipsis 로 접는다(#596). 상한은 뷰포트 가용 폭이고, 실제 폭은 CSS 의
		// `width: max-content` 가 내용 기준으로 정한다.
		// 폭을 먼저 확정해야 높이가 실제 줄바꿈 기준으로 잡힌다.
		const room = window.innerWidth - padding * 2;
		panel.style.minWidth = `${Math.min(rect.width, room)}px`;
		panel.style.maxWidth = `${room}px`;
		const width = panel.offsetWidth;

		// 높이도 가용 높이로 제한한다 - 목록이 뷰포트보다 길면 위/아래 어느 쪽으로도 다 안 들어간다.
		const available = window.innerHeight - padding * 2;
		panel.style.maxHeight = "";
		const natural = panel.offsetHeight;
		const height = Math.min(natural, available);
		if (natural > available) panel.style.maxHeight = `${available}px`;

		const below = window.innerHeight - rect.bottom - gap - padding;
		const above = rect.top - gap - padding;
		const up = height > below && above > below;

		panel.classList.toggle("bt-dropdown__list--up", up);
		panel.style.left = `${clampToViewport(rect.left, width, window.innerWidth, padding)}px`;
		const top = up ? rect.top - gap - height : rect.bottom + gap;
		panel.style.top = `${clampToViewport(top, height, window.innerHeight, padding)}px`;
	}

	/** 여백을 남기고 뷰포트 안으로 민다. 가용 공간이 팝업보다 작으면 여백에 고정한다. */
	function clampToViewport(start, size, viewport, padding) {
		return Math.max(padding, Math.min(start, viewport - padding - size));
	}

	/** 스크롤·리사이즈에 좌표를 갱신한다. capture=true - 스크롤 이벤트는 버블링하지 않는다. */
	function trackPanel() {
		if (untrackPanel) return;
		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				if (state.isOpen) placePanel();
			});
		};
		window.addEventListener("scroll", schedule, true);
		window.addEventListener("resize", schedule);
		untrackPanel = () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule, true);
			window.removeEventListener("resize", schedule);
			untrackPanel = null;
		};
	}

	/** 목록을 원래 자리로 되돌린다 - 소비자가 컨테이너를 지울 때 body 에 남지 않게. */
	function restorePanel() {
		untrackPanel?.();
		if (!panelHome) return;
		panelHome.parent?.insertBefore(panel, panelHome.next);
		panelHome = null;
		panel.style.left = "";
		panel.style.top = "";
		// 폭 하한·상한 둘 다 지운다 - 하나만 남으면 제자리로 돌아간 목록에 좁은 트리거의
		// 하한이 그대로 붙어 있다(#596).
		panel.style.minWidth = "";
		panel.style.maxWidth = "";
		panel.style.maxHeight = "";
	}

	function open() {
		if (config.disabled || control.disabled) return;

		state.isOpen = true;
		control.classList.add("is-open");
		control.setAttribute("aria-expanded", "true");
		// 검색 행 · 옵션 칸을 품은 패널은 세로 flex 다 (SCSS `:has(> __options)`) - block 으로 덮지 않는다
		panel.style.display = listbox === panel ? "block" : "flex";
		if (searchInput) searchInput.setAttribute("aria-expanded", "true");

		// 목록을 body 로 옮겨 fixed 로 띄운다 - 트리거 옆에 두면 `overflow: hidden` 인
		// 조상이 잘라낸다(#586, React 번들과 같은 처리). 원래 자리는 닫을 때 되돌린다.
		placePanel();
		trackPanel();
		// 바깥 클릭 감지는 열린 동안만 - 닫힌 Dropdown 이 행마다 있는 목록에서 클릭마다 N 개가 돌지 않게 (#975)
		untrackOutside ??= on(document, "mousedown", onDocumentClick);

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
		restorePanel();
		untrackOutside?.();
		untrackOutside = null;

		// 패널을 닫으면 검색 상태 초기화 (다음 열림 시 fresh - React 와 동일)
		if (searchInput) {
			searchInput.value = "";
			searchInput.setAttribute("aria-expanded", "false");
			searchInput.removeAttribute("aria-activedescendant");
		}
		state.committedQuery = "";
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
		if (config.disabled) return;
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
				// 닫혀 있으면 손대지 않는다 - preventDefault 는 스택에 "처리했다" 는 신호라, 닫힌
				// 목록이 보내면 Modal 안에서 두 번째 Esc 가 Modal 에 닿지 못한다(#697).
				if (!state.isOpen) break;
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
		// 목록은 열려 있는 동안 `body` 로 옮겨져 wrapper 의 자손이 아니다(#586). 함께 보지
		// 않으면 옵션의 `mousedown` 이 바깥 클릭으로 오인돼 - `mousedown` 은 `click` 보다
		// 먼저다 - 패널이 닫히고 원래 자리로 돌아간 뒤에 `click` 이 도착해 선택이 무산된다.
		if (state.isOpen && !wrapper.contains(e.target) && !panel.contains(e.target)) {
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
	const cleanups = [on(control, "click", onControlClick), on(control, "keydown", onControlKeyDown)];

	optionEls.forEach((el, i) => {
		// 누를 때 포커스를 옮기지 않는다 - 검색칸 · 트리거에 남아야 ↑↓ · Enter · Esc 가 이어진다 (#975)
		cleanups.push(on(el, "mousedown", (e) => e.preventDefault()));
		cleanups.push(on(el, "click", onOptionClick(i)));
		cleanups.push(on(el, "mouseenter", onOptionMouseEnter(i)));
	});

	if (searchInput) {
		// React 와 같이 조합 중에도 매 입력마다 거른다 - matchesSearch 가 조합 중인 마지막 글자를 받아준다.
		// (조합 중 Enter 가 선택으로 새지 않게 막는 건 onSearchKeyDown 의 isComposing 가드)
		cleanups.push(
			on(searchInput, "input", (e) => {
				state.committedQuery = e.target.value;
				applyFilter();
			}),
		);
		cleanups.push(on(searchInput, "keydown", onSearchKeyDown));
	}

	// Initialize.
	// 서버 바인딩(th:field 등) 초기값은 renderSelection 이 hidden input 을 재동기화하기 **전에**
	// 읽어 둔다 (다중 모드에서 선택 0개 = input 0개라 먼저 렌더하면 초기값이 지워진다).
	const hiddenValues = hiddenEls.map((el) => el.value).filter((v) => v !== "");
	// hidden input 이 없으면 서버가 옵션에 그린 `is-selected` 를 읽는다 (`th:classappend`). renderSelection 이
	// 클래스를 값 기준으로 다시 그리므로 그 전에 (#975). 다시 만들 때도 앞 인스턴스의 선택이 여기 남아 있다
	const markupValues = state.options
		.filter((_, i) => optionEls[i]?.classList.contains("is-selected"))
		.map((o) => o.value);
	const serverValues = hiddenValues.length > 0 ? hiddenValues : markupValues;
	panel.style.display = "none";
	applyFilter();
	renderSelection();
	if (multiple) {
		const initial = Array.isArray(config.defaultValue)
			? config.defaultValue
			: config.defaultValue != null
				? [config.defaultValue]
				: serverValues;
		// 초기값은 assignValue - React defaultValue 처럼 onValueChange 를 부르지 않는다
		if (initial.length > 0) assignValue(initial);
		// `!= null` 로 판단 - truthy 검사면 빈 문자열("")도 유효한 값인데 미지정으로 보고
		// 서버 값/placeholder 로 넘어간다. 위 multiple 분기와 같은 기준.
	} else if (config.defaultValue != null) {
		assignValue(config.defaultValue);
	} else if (serverValues[0]) {
		assignValue(serverValues[0]);
	}

	// Public API
	const api = {
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
			// 열린 채 비활성이 되면 닫는다 - 남겨 두면 검색 Enter·옵션 클릭으로 계속 선택된다
			if (disabled && state.isOpen) close();
			syncHiddenInputs();
		},
		destroy: () => {
			// 열린 채 destroy 되면 목록이 body 에 펼쳐진 채 남는다 - close() 가 restorePanel 까지 한다.
			// closePanel - searchable 이면 검색칸에 있던 포커스를 트리거로 돌린다 (#975)
			if (state.isOpen) closePanel();
			else restorePanel();
			cleanups.forEach((cleanup) => {
				cleanup();
			});
			// 참조를 지워야 init() 이 다시 붙인다
			if (wrapper._btDropdown === api) delete wrapper._btDropdown;
		},
	};
	wrapper._btDropdown = api;
	return api;
}
