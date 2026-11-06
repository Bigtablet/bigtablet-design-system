import { intlLocale, t } from "./locale.js";
import { pushEscape } from "./overlay.js";
import { $, escapeHtml, generateId, on, parseBoolAttr } from "./utils.js";

/* ========================================
     DatePicker (달력형) - React DatePicker variant="calendar" + TimePicker 대응 (#937)
     ======================================== */

// 값은 시간대 없는 문자열이다 - "YYYY-MM-DD" 또는 시각을 켜면 "YYYY-MM-DDTHH:mm"(datetime-local 과 같은 형식).
// new Date("2026-10-16") 은 UTC 자정으로 해석돼 하루 밀리므로 Date 파싱을 거치지 않는다.
const pad = (n) => String(n).padStart(2, "0");
const daysIn = (y, m) => new Date(y, m, 0).getDate();
const ROWS = 6; // 달마다 5 · 6줄로 바뀌면 넘길 때 높이가 출렁인다

/** 셀렉터로 무효한 값("#123")은 예외 대신 null - 한 칸의 잘못된 data-min-from 이 init() 전체를 멈추지 않게 */
function safeQuery(selector) {
	try {
		return document.querySelector(selector);
	} catch {
		return null;
	}
}

/** "YYYY-MM-DD" · "YYYY-MM-DDTHH:mm" → { year, month, day, minutes } (형식이 틀리면 null) */
function parse(value) {
	const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value ?? "");
	if (!m) return null;
	const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
	if (month < 1 || month > 12 || day < 1 || day > daysIn(year, month)) return null;
	const minutes = m[4] === undefined ? null : Number(m[4]) * 60 + Number(m[5]);
	if (minutes !== null && (minutes >= 24 * 60 || Number(m[5]) > 59)) return null;
	return { year, month, day, minutes };
}

const dayKey = (d) => `${d.year}-${pad(d.month)}-${pad(d.day)}`;
const format = (d, time) =>
	time ? `${dayKey(d)}T${pad(Math.floor(d.minutes / 60))}:${pad(d.minutes % 60)}` : dayKey(d);
const compareDay = (a, b) => a.year - b.year || a.month - b.month || a.day - b.day;
const sameDay = (a, b) => !!a && !!b && compareDay(a, b) === 0;
const toDate = (d) => new Date(d.year, d.month - 1, d.day);
const fromDate = (date) => ({
	year: date.getFullYear(),
	month: date.getMonth() + 1,
	day: date.getDate(),
	minutes: null,
});
const addDays = (d, n) => {
	const date = toDate(d);
	date.setDate(date.getDate() + n);
	return { ...fromDate(date), minutes: d.minutes };
};
const addMonths = (d, n) => {
	const idx = d.year * 12 + (d.month - 1) + n;
	const year = Math.floor(idx / 12);
	const month = (idx % 12) + 1;
	return { ...d, year, month, day: Math.min(d.day, daysIn(year, month)) };
};

/**
 * 달력형 날짜(·시각) 칸. 칸을 누르면 월 달력 팝오버가 열리고, 고른 값은 숨은 input 으로 폼에 실린다.
 * 시작 ~ 종료는 칸 두 개로 만든다 - 종료 칸에 `minFrom: "#from"`(data-min-from)을 주면 시작보다 앞을 막는다.
 *
 * 키보드는 React DateCalendar(WAI-ARIA APG "Date Picker Dialog")와 같다 - ←→ 하루, ↑↓ 한 주,
 * Home/End 주의 처음 · 끝, PageUp/PageDown 한 달(Shift 와 함께면 한 해), Enter/Space 선택, Escape 닫기.
 *
 * @param {HTMLElement|string} element - `.bt-date-picker--calendar` 요소 또는 셀렉터
 * @param {Object} options - 옵션 이름은 React DatePicker · DateCalendar · TimePicker prop 과 같다
 */
export function DatePicker(element, options = {}) {
	const root = typeof element === "string" ? $(element) : element;
	if (!root) return null;
	root._btDatePicker?.destroy();

	const ds = root.dataset;
	const pick = (key, attr, convert = (v) => v) =>
		options[key] !== undefined ? options[key] : attr !== undefined ? convert(attr) : undefined;
	const config = {
		name: pick("name", ds.name),
		defaultValue: pick("defaultValue", ds.value),
		// 시각까지 고른다 - 값이 "YYYY-MM-DDTHH:mm" 가 된다
		time: pick("time", ds.time, parseBoolAttr) ?? false,
		minuteStep: pick("minuteStep", ds.minuteStep, Number) ?? 5,
		min: pick("min", ds.min),
		max: pick("max", ds.max),
		// 다른 DatePicker 의 값을 최소 · 최대로 따른다 (시작 ~ 종료). 셀렉터 또는 요소
		minFrom: pick("minFrom", ds.minFrom),
		maxFrom: pick("maxFrom", ds.maxFrom),
		today: pick("today", ds.today),
		weekStartsOn: pick("weekStartsOn", ds.weekStartsOn, Number) ?? 0,
		disabled: pick("disabled", ds.disabled, parseBoolAttr) ?? false,
		placeholder: pick("placeholder", ds.placeholder),
		prevMonthLabel: pick("prevMonthLabel", ds.prevMonthLabel) ?? t("datePicker.prevMonth"),
		nextMonthLabel: pick("nextMonthLabel", ds.nextMonthLabel) ?? t("datePicker.nextMonth"),
		hourLabel: pick("hourLabel", ds.hourLabel) ?? t("timePicker.hour"),
		minuteLabel: pick("minuteLabel", ds.minuteLabel) ?? t("timePicker.minute"),
		doneLabel: pick("doneLabel", ds.doneLabel) ?? t("vanilla.datePicker.done"),
		todayLabel: pick("todayLabel", ds.todayLabel) ?? t("vanilla.datePicker.today"),
		dialogLabel: pick("dialogLabel", ds.dialogLabel),
		onValueChange: options.onValueChange ?? null,
	};
	config.placeholder ??= t(
		config.time ? "vanilla.datePicker.placeholderTime" : "datePicker.placeholder",
	);
	if (!(config.minuteStep >= 1 && 60 % config.minuteStep === 0)) config.minuteStep = 5;

	const cleanups = [];
	const created = [];
	const make = (tag, className, parent) => {
		const el = document.createElement(tag);
		if (className) el.className = className;
		if (parent) {
			parent.appendChild(el);
			if (parent === root) created.push(el);
		}
		return el;
	};

	// ── 마크업 - 서버가 라벨 · 숨은 input 을 그려 두면 재사용한다 ─────────────────────
	root.classList.add("bt-date-picker--calendar");
	const labelEl = root.querySelector(".bt-date-picker__label");
	if (labelEl && !labelEl.id) labelEl.id = generateId("bt-date-picker-label");
	const hidden =
		root.querySelector('input[type="hidden"]') || (config.name ? make("input", null, root) : null);
	if (hidden) {
		hidden.type = "hidden";
		if (config.name) hidden.name = config.name;
		config.defaultValue ??= hidden.value || undefined;
	}

	const trigger = make("button", "bt-date-picker__trigger", root);
	trigger.type = "button";
	trigger.setAttribute("aria-haspopup", "dialog");
	trigger.setAttribute("aria-expanded", "false");
	const valueId = generateId("bt-date-picker-value");
	trigger.innerHTML = `<span class="bt-date-picker__trigger-icon" aria-hidden="true"></span><span class="bt-date-picker__trigger-text" id="${valueId}"></span>`;
	const valueEl = trigger.lastElementChild;
	trigger.setAttribute("aria-labelledby", [labelEl?.id, valueId].filter(Boolean).join(" "));

	const panel = make("div", "bt-date-picker__panel", root);
	panel.setAttribute("role", "dialog");
	panel.setAttribute(
		"aria-label",
		config.dialogLabel ?? labelEl?.textContent.trim() ?? t("datePicker.calendar"),
	);
	panel.hidden = true;
	const titleId = generateId("bt-date-picker-title");
	panel.innerHTML = `
		<div class="bt-date-picker__header">
			<button type="button" class="bt-date-picker__nav" data-nav="-1" aria-label="${escapeHtml(config.prevMonthLabel)}"></button>
			<button type="button" class="bt-date-picker__title" aria-label="${escapeHtml(t("vanilla.datePicker.changeView"))}"><span id="${titleId}" aria-live="polite"></span></button>
			<button type="button" class="bt-date-picker__nav" data-nav="1" aria-label="${escapeHtml(config.nextMonthLabel)}"></button>
		</div>
		<table class="bt-date-picker__grid" role="grid" aria-labelledby="${titleId}"><thead><tr></tr></thead><tbody></tbody></table>
		<div class="bt-date-picker__picks" role="group" aria-labelledby="${titleId}" hidden></div>`;
	const [prevBtn, nextBtn] = panel.querySelectorAll(".bt-date-picker__nav");
	const titleBtn = panel.querySelector(".bt-date-picker__title");
	const titleEl = titleBtn.firstElementChild;
	const table = panel.querySelector(".bt-date-picker__grid");
	const tbody = panel.querySelector("tbody");
	const picks = panel.querySelector(".bt-date-picker__picks");

	let hourSel = null;
	let minuteSel = null;
	if (config.time) {
		const row = make("div", "bt-date-picker__time", panel);
		// select 를 감싼다 - select 는 ::after 를 못 가져 화살표(React Dropdown 의 ChevronDown)를 감싼 칸에 그린다
		const select = (label) => {
			const s = make(
				"select",
				"bt-date-picker__select",
				make("span", "bt-date-picker__select-wrap", row),
			);
			s.setAttribute("aria-label", label);
			return s;
		};
		hourSel = select(config.hourLabel);
		make("span", "bt-date-picker__time-sep", row).textContent = ":";
		minuteSel = select(config.minuteLabel);
	}
	// 아래 줄 - 오늘(왼쪽) · 완료(시각을 켰을 때, 오른쪽). 둘 다 글자 버튼이라 고른 날짜보다 눈에 덜 띈다
	const footer = make("div", "bt-date-picker__footer", panel);
	const todayBtn = make("button", "bt-date-picker__action", footer);
	todayBtn.type = "button";
	todayBtn.textContent = config.todayLabel;
	cleanups.push(on(todayBtn, "click", () => selectToday()));
	if (config.time) {
		const done = make("button", "bt-date-picker__action bt-date-picker__action--primary", footer);
		done.type = "button";
		done.textContent = config.doneLabel;
		cleanups.push(on(done, "click", () => close(true)));
	}

	const locale = intlLocale();
	const fmt = {
		title: new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }),
		year: new Intl.DateTimeFormat(locale, { year: "numeric" }),
		month: new Intl.DateTimeFormat(locale, { month: "short" }),
		full: new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
		// React CalendarField 와 같은 표기 - ko "2026. 10. 16. (금)", en "Fri, Oct 16, 2026"
		value: new Intl.DateTimeFormat(
			locale,
			locale === "ko-KR"
				? { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }
				: { year: "numeric", month: "short", day: "numeric", weekday: "short" },
		),
	};
	const headRow = panel.querySelector("thead tr");
	for (let i = 0; i < 7; i++) {
		// 2026-10-04 은 일요일 - weekStartsOn 만큼 돌린다
		const d = new Date(2026, 9, 4 + ((config.weekStartsOn + i) % 7));
		const th = make("th", "bt-date-picker__weekday", headRow);
		th.scope = "col";
		th.abbr = d.toLocaleDateString(locale, { weekday: "long" });
		th.textContent = d.toLocaleDateString(locale, { weekday: "narrow" });
	}

	// ── 상태 ─────────────────────────────────────────────────────────────────
	const today = parse(config.today) ?? fromDate(new Date());
	// view - "day"(달력) · "month"(한 해의 12달) · "year"(12년). pick - 월 · 연 보기에서 포커스된 칸의 연 · 월
	const state = { value: null, focused: null, isOpen: false, view: "day", pick: null };

	/** 다른 DatePicker 의 값(minFrom · maxFrom)이 이 칸의 값보다 우선한다 - 더 좁은 쪽 */
	const linked = (ref) => {
		const el = typeof ref === "string" ? safeQuery(ref) : ref;
		return el?._btDatePicker ? parse(el._btDatePicker.getValue()) : null;
	};
	const bound = (own, ref, pickTighter) => {
		const a = parse(own);
		const b = linked(ref);
		if (!a || !b) return a ?? b;
		return pickTighter(a, b);
	};
	const cmp = (a, b) => compareDay(a, b) || (a.minutes ?? 0) - (b.minutes ?? 0);
	const minBound = () => bound(config.min, config.minFrom, (a, b) => (cmp(a, b) >= 0 ? a : b));
	const maxBound = () => bound(config.max, config.maxFrom, (a, b) => (cmp(a, b) <= 0 ? a : b));

	const dayDisabled = (d) => {
		const lo = minBound();
		const hi = maxBound();
		return (!!lo && compareDay(d, lo) < 0) || (!!hi && compareDay(d, hi) > 0);
	};
	/** 그날 고를 수 있는 분 범위 [lo, hi] - min · max 가 같은 날일 때만 좁아진다 */
	const minuteRange = (d) => {
		const lo = minBound();
		const hi = maxBound();
		return [
			lo && sameDay(lo, d) ? (lo.minutes ?? 0) : 0,
			hi && sameDay(hi, d) ? (hi.minutes ?? 24 * 60 - 1) : 24 * 60 - 1,
		];
	};
	const clampMinutes = (d, minutes) => {
		const [lo, hi] = minuteRange(d);
		const step = config.minuteStep;
		const snapped = Math.ceil(Math.max(lo, minutes) / step) * step;
		return Math.min(snapped, Math.floor(hi / step) * step);
	};

	// ── 그리기 ───────────────────────────────────────────────────────────────
	function renderTrigger() {
		const v = state.value;
		let text = config.placeholder;
		if (v) {
			text = fmt.value.format(toDate(v));
			if (config.time) text += ` ${pad(Math.floor(v.minutes / 60))}:${pad(v.minutes % 60)}`;
		}
		valueEl.textContent = text;
		valueEl.className = `bt-date-picker__trigger-${v ? "value" : "placeholder"}`;
		trigger.disabled = config.disabled;
		if (hidden) {
			hidden.value = v ? format(v, config.time) : "";
			hidden.disabled = config.disabled;
		}
	}

	function renderGrid() {
		const f = state.focused;
		titleEl.textContent = fmt.title.format(toDate({ ...f, day: 1 }));
		prevBtn.setAttribute("aria-label", config.prevMonthLabel);
		nextBtn.setAttribute("aria-label", config.nextMonthLabel);
		const lo = minBound();
		const hi = maxBound();
		const viewIdx = f.year * 12 + f.month;
		prevBtn.disabled = !!lo && viewIdx <= lo.year * 12 + lo.month;
		nextBtn.disabled = !!hi && viewIdx >= hi.year * 12 + hi.month;
		const lead = (new Date(f.year, f.month - 1, 1).getDay() - config.weekStartsOn + 7) % 7;
		const total = daysIn(f.year, f.month);
		let html = "";
		for (let row = 0; row < ROWS; row++) {
			html += "<tr>";
			for (let col = 0; col < 7; col++) {
				const day = row * 7 + col - lead + 1;
				if (day < 1 || day > total) {
					html += '<td class="bt-date-picker__cell"></td>';
					continue;
				}
				const d = { year: f.year, month: f.month, day };
				const selected = sameDay(d, state.value);
				const cls = ["bt-date-picker__day"];
				if (selected) cls.push("bt-date-picker__day--selected");
				if (sameDay(d, today)) cls.push("bt-date-picker__day--today");
				const label = escapeHtml(`${day}, ${fmt.full.format(toDate(d))}`);
				// 고를 수 없는 날도 방향키는 지나가야 한다 - disabled 대신 aria-disabled
				html += `<td class="bt-date-picker__cell" role="gridcell" aria-selected="${selected}"><button type="button" class="${cls.join(" ")}" data-day="${day}" tabindex="${day === f.day ? 0 : -1}" aria-label="${label}"${dayDisabled(d) ? ' aria-disabled="true"' : ""}>${day}</button></td>`;
			}
			html += "</tr>";
		}
		tbody.innerHTML = html;
	}

	function renderTime() {
		if (!config.time) return;
		const base = state.value ?? state.focused;
		const [lo, hi] = minuteRange(base);
		const minutes = state.value?.minutes ?? null;
		const hour = minutes === null ? null : Math.floor(minutes / 60);
		let hours = "";
		for (let h = 0; h < 24; h++) {
			const off = h * 60 + 59 < lo || h * 60 > hi;
			hours += `<option value="${h}"${h === hour ? " selected" : ""}${off ? " disabled" : ""}>${pad(h)}</option>`;
		}
		hourSel.innerHTML = hours;
		let mins = "";
		for (let m = 0; m < 60; m += config.minuteStep) {
			const at = (hour ?? 0) * 60 + m;
			const off = at < lo || at > hi;
			mins += `<option value="${m}"${minutes !== null && minutes % 60 === m ? " selected" : ""}${off ? " disabled" : ""}>${pad(m)}</option>`;
		}
		minuteSel.innerHTML = mins;
		hourSel.disabled = minuteSel.disabled = !state.value;
	}

	/** 월 · 연 보기 - 4줄 × 3칸. 범위(min · max) 밖의 달 · 해는 고를 수 없다 */
	const YEARS = 12;
	const yearStart = (y) => y - (((y % YEARS) + YEARS) % YEARS);
	function renderPicks() {
		const { year, month } = state.pick;
		const lo = minBound();
		const hi = maxBound();
		const monthView = state.view === "month";
		const start = yearStart(year);
		titleEl.textContent = monthView
			? fmt.year.format(new Date(year, 0, 1))
			: `${start} – ${start + YEARS - 1}`;
		prevBtn.setAttribute(
			"aria-label",
			t(monthView ? "vanilla.datePicker.prevYear" : "vanilla.datePicker.prevYears"),
		);
		nextBtn.setAttribute(
			"aria-label",
			t(monthView ? "vanilla.datePicker.nextYear" : "vanilla.datePicker.nextYears"),
		);
		prevBtn.disabled = !!lo && (monthView ? year <= lo.year : start <= lo.year);
		nextBtn.disabled = !!hi && (monthView ? year >= hi.year : start + YEARS - 1 >= hi.year);
		let html = "";
		for (let i = 0; i < 12; i++) {
			const y = monthView ? year : start + i;
			const m = monthView ? i + 1 : month;
			const idx = y * 12 + m;
			const off = monthView
				? (!!lo && idx < lo.year * 12 + lo.month) || (!!hi && idx > hi.year * 12 + hi.month)
				: (!!lo && y < lo.year) || (!!hi && y > hi.year);
			const current = monthView
				? state.value?.year === y && state.value?.month === m
				: state.value?.year === y;
			const focused = monthView ? m === month : y === year;
			const text = monthView ? fmt.month.format(new Date(y, m - 1, 1)) : String(y);
			html += `<button type="button" class="bt-date-picker__pick${current ? " bt-date-picker__pick--selected" : ""}" data-pick="${monthView ? m : y}" tabindex="${focused ? 0 : -1}"${current ? ' aria-current="true"' : ""}${off ? ' aria-disabled="true"' : ""}>${escapeHtml(text)}</button>`;
		}
		picks.innerHTML = html;
	}

	function render() {
		renderTrigger();
		if (!state.isOpen) return;
		const dayView = state.view === "day";
		table.hidden = !dayView;
		picks.hidden = dayView;
		titleBtn.setAttribute("aria-disabled", String(state.view === "year"));
		if (dayView) renderGrid();
		else renderPicks();
		renderTime();
	}

	/** 보기를 바꾸고 그 보기의 포커스 칸에 앉는다 - 누른 버튼이 사라져 포커스가 body 로 떨어지지 않게 */
	function setView(view) {
		state.view = view;
		if (view !== "day") state.pick ??= { year: state.focused.year, month: state.focused.month };
		render();
		(view === "day" ? tbody : picks).querySelector('button[tabindex="0"]')?.focus();
	}

	// ── 값 ───────────────────────────────────────────────────────────────────
	/** 범위 밖 값은 경계로 맞춘다 - 시작을 종료 뒤로 옮기면 종료가 시작으로 따라온다 */
	function clamp(d) {
		if (!d) return null;
		let next = { ...d };
		const lo = minBound();
		const hi = maxBound();
		if (lo && cmp(next, { ...lo, minutes: config.time ? (lo.minutes ?? 0) : 0 }) < 0)
			next = { ...lo };
		// 날짜만 준 상한은 그날 끝까지 - 00:00 으로 보면 상한 날에 고른 시각이 00:00 으로 되돌아간다
		const hiEnd = { ...hi, minutes: config.time ? (hi?.minutes ?? 24 * 60 - 1) : 0 };
		if (hi && cmp(next, hiEnd) > 0) next = hiEnd;
		if (config.time) next.minutes = clampMinutes(next, next.minutes ?? 0);
		else next.minutes = null;
		return next;
	}

	function commit(next, notify = true) {
		const prev = state.value ? format(state.value, config.time) : null;
		state.value = clamp(next);
		const cur = state.value ? format(state.value, config.time) : null;
		render();
		if (prev === cur) return;
		if (notify) config.onValueChange?.(cur);
		// 이 칸을 minFrom · maxFrom 으로 따르는 칸들이 다시 맞춘다
		root.dispatchEvent(new CustomEvent("bt-date-picker-change", { bubbles: true }));
	}

	// ── 열고 닫기 ────────────────────────────────────────────────────────────
	let releaseEscape = null;
	function open() {
		if (config.disabled || state.isOpen) return;
		state.isOpen = true;
		const lo = minBound();
		const hi = maxBound();
		let f = state.value ?? today;
		if (lo && compareDay(f, lo) < 0) f = lo;
		if (hi && compareDay(f, hi) > 0) f = hi;
		state.focused = { ...f };
		state.view = "day";
		state.pick = null;
		panel.hidden = false;
		trigger.setAttribute("aria-expanded", "true");
		// 아래 공간이 모자라면 위로 연다
		panel.classList.remove("bt-date-picker__panel--up");
		render();
		const rect = panel.getBoundingClientRect();
		if (rect.bottom > window.innerHeight && trigger.getBoundingClientRect().top > rect.height) {
			panel.classList.add("bt-date-picker__panel--up");
		}
		releaseEscape = pushEscape(() => close(true));
		focusDay();
	}

	function close(returnFocus = false) {
		if (!state.isOpen) return;
		state.isOpen = false;
		panel.hidden = true;
		trigger.setAttribute("aria-expanded", "false");
		releaseEscape?.();
		releaseEscape = null;
		if (returnFocus) trigger.focus();
	}

	function focusDay() {
		tbody.querySelector('button[tabindex="0"]')?.focus();
	}

	function moveFocus(next, viaKeyboard) {
		const lo = minBound();
		const hi = maxBound();
		let target = next;
		if (lo && compareDay(target, lo) < 0) target = { ...lo };
		if (hi && compareDay(target, hi) > 0) target = { ...hi };
		state.focused = target;
		renderGrid();
		if (viaKeyboard) focusDay();
	}

	function selectDay(day, viaKeyboard) {
		const d = { ...state.focused, day };
		if (dayDisabled(d)) return;
		const minutes = config.time ? (state.value?.minutes ?? minuteRange(d)[0]) : null;
		state.focused = d;
		commit({ ...d, minutes });
		if (!config.time) close(true);
		// 키보드로 고르면 다음 할 일(시 칸)로 옮긴다. 마우스면 고른 날에 그대로 둔다 - 다시 그려 사라진 버튼
		// 대신 같은 날에 앉힌다. 마우스 클릭 뒤 select 로 옮기면 select 가 :focus-visible 에 걸려 링이 떴다 (#953)
		else if (viaKeyboard) hourSel.focus();
		else focusDay();
	}

	/** 오늘을 고른다 - 어느 달 · 보기에 있든 한 번에. 오늘이 범위 밖이면 그 달로 옮기기만 한다 */
	function selectToday() {
		state.view = "day";
		state.pick = null;
		state.focused = { ...today };
		if (dayDisabled(today)) {
			moveFocus(today, false);
			render();
			focusDay();
			return;
		}
		selectDay(today.day, false);
	}

	/** 월 · 연 보기에서 칸을 고른다 - 한 단계 아래 보기로 */
	function selectPick(value) {
		if (state.view === "year") {
			state.pick = { ...state.pick, year: value };
			setView("month");
			return;
		}
		const { year } = state.pick;
		state.focused = {
			...state.focused,
			year,
			month: value,
			day: Math.min(state.focused.day, daysIn(year, value)),
		};
		moveFocus(state.focused, false);
		state.pick = null;
		setView("day");
	}

	/** 월 · 연 보기의 방향키 - ←→ 한 칸, ↑↓ 한 줄(3칸), PageUp/Down 한 쪽(한 해 · 12년) */
	function movePick(key) {
		const monthView = state.view === "month";
		const steps = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -3,
			ArrowDown: 3,
			PageUp: -12,
			PageDown: 12,
		};
		const step = steps[key];
		if (step === undefined) return false;
		const p = state.pick;
		if (monthView) {
			const idx = p.year * 12 + (p.month - 1) + step;
			state.pick = { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
		} else {
			state.pick = { ...p, year: p.year + step };
		}
		render();
		picks.querySelector('button[tabindex="0"]')?.focus();
		return true;
	}

	/** ‹ › - 보기마다 한 달 · 한 해 · 12년 */
	function navigate(dir) {
		if (state.view === "day") return moveFocus(addMonths(state.focused, dir), false);
		const p = state.pick;
		state.pick = { ...p, year: p.year + dir * (state.view === "month" ? 1 : YEARS) };
		render();
	}

	// ── 이벤트 ───────────────────────────────────────────────────────────────
	cleanups.push(
		on(trigger, "click", () => (state.isOpen ? close() : open())),
		on(trigger, "keydown", (e) => {
			if (e.key === "ArrowDown" && !state.isOpen) {
				e.preventDefault();
				open();
			}
		}),
		on(prevBtn, "click", () => navigate(-1)),
		on(nextBtn, "click", () => navigate(1)),
		on(titleBtn, "click", () => {
			if (state.view !== "year") setView(state.view === "day" ? "month" : "year");
		}),
		on(tbody, "click", (e) => {
			const btn = e.target.closest("button[data-day]");
			// detail 0 - Enter · Space 가 만든 클릭 (키보드)
			if (btn) selectDay(Number(btn.dataset.day), e.detail === 0);
		}),
		on(picks, "click", (e) => {
			const btn = e.target.closest("button[data-pick]");
			if (btn && btn.getAttribute("aria-disabled") !== "true") selectPick(Number(btn.dataset.pick));
		}),
		on(picks, "keydown", (e) => {
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			if (movePick(e.key)) e.preventDefault();
		}),
		on(tbody, "keydown", (e) => {
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			const f = state.focused;
			const offset = (toDate(f).getDay() - config.weekStartsOn + 7) % 7;
			const moves = {
				ArrowLeft: () => addDays(f, -1),
				ArrowRight: () => addDays(f, 1),
				ArrowUp: () => addDays(f, -7),
				ArrowDown: () => addDays(f, 7),
				Home: () => addDays(f, -offset),
				End: () => addDays(f, 6 - offset),
				PageUp: () => addMonths(f, e.shiftKey ? -12 : -1),
				PageDown: () => addMonths(f, e.shiftKey ? 12 : 1),
			};
			if (moves[e.key]) {
				e.preventDefault();
				moveFocus(moves[e.key](), true);
			}
		}),
		// 팝오버 밖을 누르거나 Tab 으로 빠져나가면 닫는다
		on(document, "mousedown", (e) => {
			if (state.isOpen && !root.contains(e.target)) close();
		}),
		on(root, "focusout", (e) => {
			if (state.isOpen && e.relatedTarget && !root.contains(e.relatedTarget)) close();
		}),
	);
	if (config.time) {
		const onTime = () => {
			if (!state.value) return;
			const hour = Number(hourSel.value);
			const minute = Number(minuteSel.value);
			commit({ ...state.value, minutes: hour * 60 + minute });
		};
		cleanups.push(on(hourSel, "change", onTime), on(minuteSel, "change", onTime));
	}
	// 따르는 칸의 값이 바뀌면 범위를 다시 맞춘다
	const followRefs = [config.minFrom, config.maxFrom].filter(Boolean);
	if (followRefs.length) {
		cleanups.push(
			on(document, "bt-date-picker-change", (e) => {
				const hit = followRefs.some((ref) =>
					typeof ref === "string" ? e.target === safeQuery(ref) : e.target === ref,
				);
				if (hit && e.target !== root) commit(state.value);
			}),
		);
	}

	// ── 시작 ─────────────────────────────────────────────────────────────────
	state.value = clamp(parse(config.defaultValue));
	render();

	const api = {
		/** 지금 값 - "YYYY-MM-DD" · "YYYY-MM-DDTHH:mm", 없으면 null */
		getValue: () => (state.value ? format(state.value, config.time) : null),
		/** 값을 바꾼다. 범위 밖이면 경계로 맞추고, null 이면 비운다 */
		setValue: (value) => {
			// null · 빈 문자열만 비운다 - 형식이 틀린 값은 무시하고 지금 값을 지킨다
			if (!value) return commit(null);
			const parsed = parse(value);
			if (parsed) commit(parsed);
		},
		open,
		close: () => close(),
		setDisabled: (disabled) => {
			config.disabled = !!disabled;
			if (disabled) close();
			render();
		},
		setMin: (min) => {
			config.min = min ?? undefined;
			commit(state.value);
		},
		setMax: (max) => {
			config.max = max ?? undefined;
			commit(state.value);
		},
		destroy: () => {
			close();
			cleanups.forEach((cleanup) => {
				cleanup();
			});
			created.forEach((el) => {
				if (el !== hidden) el.remove();
			});
			if (root._btDatePicker === api) delete root._btDatePicker;
		},
	};
	root._btDatePicker = api;
	// 이 칸을 minFrom · maxFrom 으로 따르는 칸이 먼저 초기화됐어도 처음 값으로 다시 맞추게 알린다 -
	// api 를 붙인 뒤에 보내야 따르는 칸이 getValue() 로 이 값을 읽는다
	if (state.value) root.dispatchEvent(new CustomEvent("bt-date-picker-change", { bubbles: true }));
	return api;
}
