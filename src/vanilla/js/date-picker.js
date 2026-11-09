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
		// 범위 - 한 팝오버에서 시작 · 종료를 차례로 고른다 (React DateRangePicker 대응, #951). 값은 { start, end }
		range: pick("range", ds.range, parseBoolAttr) ?? false,
		startName: pick("startName", ds.startName),
		endName: pick("endName", ds.endName),
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
		// 값이 있으면 칸 오른쪽에 지우기(×) - 조회 조건처럼 "값 없음 = 조건 없음" 인 칸 (#965). 필수 칸에는 두지 않는다
		clearable: pick("clearable", ds.clearable, parseBoolAttr) ?? false,
		clearLabel: pick("clearLabel", ds.clearLabel) ?? t("datePicker.clear"),
		// 칸 크기 - Dropdown · TextField · Button 과 같은 단계 (sm · md 40px, lg 48px, #960). 클래스
		// `bt-date-picker--{size}` 를 직접 써도 된다
		size: pick("size", ds.size),
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
		config.range
			? config.time
				? "vanilla.dateRange.placeholderTime"
				: "vanilla.dateRange.placeholder"
			: config.time
				? "vanilla.datePicker.placeholderTime"
				: "datePicker.placeholder",
	);
	// 범위의 처음 값 - { start, end } 또는 data-start · data-end
	const initial = config.range
		? {
				start: config.defaultValue?.start ?? ds.start,
				end: config.defaultValue?.end ?? ds.end,
			}
		: null;
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
	// 모르는 값은 버리고, 서버가 크기 클래스를 직접 써 둔 칸에는 기본 md 를 덧붙이지 않는다
	const sizes = ["sm", "md", "lg"];
	if (sizes.includes(config.size)) {
		root.classList.remove(...sizes.map((s) => `bt-date-picker--${s}`));
		root.classList.add(`bt-date-picker--${config.size}`);
	} else if (!sizes.some((s) => root.classList.contains(`bt-date-picker--${s}`))) {
		root.classList.add("bt-date-picker--md");
	}
	const labelEl = root.querySelector(".bt-date-picker__label");
	if (labelEl && !labelEl.id) labelEl.id = generateId("bt-date-picker-label");
	/** 숨은 input - 서버가 같은 name 으로 그려 두었으면 재사용한다 */
	const hiddenFor = (name, fallback) => {
		const el =
			(name && root.querySelector(`input[type="hidden"][name="${CSS.escape(name)}"]`)) ||
			fallback ||
			(name ? make("input", null, root) : null);
		if (el) {
			el.type = "hidden";
			if (name) el.name = name;
		}
		return el;
	};
	const hidden = config.range
		? hiddenFor(config.startName)
		: hiddenFor(config.name, root.querySelector('input[type="hidden"]'));
	const hiddenEnd = config.range ? hiddenFor(config.endName) : null;
	if (hidden && !config.range) config.defaultValue ??= hidden.value || undefined;
	if (config.range) {
		initial.start ??= hidden?.value || undefined;
		initial.end ??= hiddenEnd?.value || undefined;
	}

	// 칸 + 지우기 버튼. 지우기는 칸 안에 둘 수 없어(버튼 안 버튼) 옆에 겹쳐 둔다
	const field = make("div", "bt-date-picker__field", root);
	const trigger = make("button", "bt-date-picker__trigger", field);
	trigger.type = "button";
	trigger.setAttribute("aria-haspopup", "dialog");
	trigger.setAttribute("aria-expanded", "false");
	const valueId = generateId("bt-date-picker-value");
	trigger.innerHTML = `<span class="bt-date-picker__trigger-icon" aria-hidden="true"></span><span class="bt-date-picker__trigger-text" id="${valueId}"></span>`;
	const valueEl = trigger.lastElementChild;
	trigger.setAttribute("aria-labelledby", [labelEl?.id, valueId].filter(Boolean).join(" "));
	const clearBtn = config.clearable ? make("button", "bt-date-picker__clear", field) : null;
	if (clearBtn) {
		clearBtn.type = "button";
		clearBtn.setAttribute("aria-label", config.clearLabel);
		field.classList.add("bt-date-picker__field--clearable");
		cleanups.push(
			on(clearBtn, "click", () => {
				close();
				clear();
			}),
		);
	}

	const probe = make("span", "bt-date-picker__probe", root);
	probe.setAttribute("aria-hidden", "true");
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
			<button type="button" class="bt-date-picker__title" aria-describedby="${titleId}-hint"><span id="${titleId}"></span></button>
			<button type="button" class="bt-date-picker__nav" data-nav="1" aria-label="${escapeHtml(config.nextMonthLabel)}"></button>
		</div>
		<table class="bt-date-picker__grid" role="grid" aria-labelledby="${titleId}"><thead><tr></tr></thead><tbody></tbody></table>
		<div class="bt-date-picker__picks" role="group" aria-labelledby="${titleId}" hidden></div>
		<span class="bt-sr-only" id="${titleId}-hint">${escapeHtml(t("vanilla.datePicker.changeView"))}</span>
		<span class="bt-sr-only" aria-live="polite"></span>`;
	// 제목 버튼의 이름은 보이는 연 · 월 그대로다(WCAG 2.5.3) - 동작은 설명(describedby)으로 붙인다.
	// 달이 바뀔 때 알리는 live region 은 버튼 밖에 둔다 - 안에 두면 보기를 바꿀 때마다 포커스 낭독과 겹친다
	const [prevBtn, nextBtn] = panel.querySelectorAll(".bt-date-picker__nav");
	const titleBtn = panel.querySelector(".bt-date-picker__title");
	const titleEl = titleBtn.firstElementChild;
	const liveEl = panel.querySelector("[aria-live]");
	const table = panel.querySelector(".bt-date-picker__grid");
	const tbody = panel.querySelector("tbody");
	const picks = panel.querySelector(".bt-date-picker__picks");

	// 시각 줄 - 한 칸이면 하나, 범위면 시작 · 종료 두 줄. edge 는 그 줄이 다루는 값 ("start" · "end")
	const timeRows = [];
	if (config.time) {
		for (const edge of config.range ? ["start", "end"] : ["start"]) {
			const row = make("div", "bt-date-picker__time", panel);
			const edgeLabel = config.range
				? t(edge === "start" ? "dateRange.start" : "dateRange.end")
				: "";
			if (edgeLabel) make("span", "bt-date-picker__time-label", row).textContent = edgeLabel;
			// select 를 감싼다 - select 는 ::after 를 못 가져 화살표(React Dropdown 의 ChevronDown)를 감싼 칸에 그린다
			const select = (label) => {
				const s = make(
					"select",
					"bt-date-picker__select",
					make("span", "bt-date-picker__select-wrap", row),
				);
				s.setAttribute("aria-label", [edgeLabel, label].filter(Boolean).join(" "));
				return s;
			};
			const hour = select(config.hourLabel);
			make("span", "bt-date-picker__time-sep", row).textContent = ":";
			timeRows.push({ edge, hour, minute: select(config.minuteLabel) });
		}
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
		cleanups.push(
			on(done, "click", () => {
				fillToday();
				close(true);
			}),
		);
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
	// value - 한 칸의 값, 범위면 시작. end - 범위의 종료 (한 칸이면 늘 null)
	const state = { value: null, end: null, focused: null, isOpen: false, view: "day", pick: null };
	// 날짜보다 먼저 고른 시각(분) - 날짜를 고르는 순간 합친다 (#964). 시작 · 종료 줄마다
	const draft = { start: null, end: null };

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
	const valueText = (v) =>
		v
			? fmt.value.format(toDate(v)) +
				(config.time ? ` ${pad(Math.floor(v.minutes / 60))}:${pad(v.minutes % 60)}` : "")
			: "";

	function renderTrigger() {
		const v = state.value;
		const has = !!v || !!state.end;
		let text = config.placeholder;
		if (has)
			text = config.range ? `${valueText(v)} ~ ${valueText(state.end)}`.trim() : valueText(v);
		valueEl.textContent = text;
		valueEl.className = `bt-date-picker__trigger-${has ? "value" : "placeholder"}`;
		trigger.disabled = config.disabled;
		if (clearBtn) clearBtn.hidden = !has || config.disabled;
		for (const [el, val] of [
			[hidden, v],
			[hiddenEnd, state.end],
		]) {
			if (!el) continue;
			el.value = val ? format(val, config.time) : "";
			el.disabled = config.disabled;
		}
	}

	function renderGrid() {
		const f = state.focused;
		titleEl.textContent = fmt.title.format(toDate({ ...f, day: 1 }));
		if (liveEl.textContent !== titleEl.textContent) liveEl.textContent = titleEl.textContent;
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
				const selected = sameDay(d, state.value) || sameDay(d, state.end);
				// 범위의 띠는 칸(td)에 그린다 - 시작 · 종료 칸은 반쪽만 칠해 채운 원과 이어진다. 버튼은 원 그대로라
				// 띠 안의 오늘 테두리도 둥글다
				const span = !!state.end && !sameDay(state.value, state.end);
				const between =
					!!state.end && compareDay(d, state.value) > 0 && compareDay(d, state.end) < 0;
				const cell = ["bt-date-picker__cell"];
				if (between) cell.push("bt-date-picker__cell--in-range");
				if (span && sameDay(d, state.value)) cell.push("bt-date-picker__cell--range-start");
				if (span && sameDay(d, state.end)) cell.push("bt-date-picker__cell--range-end");
				const cls = ["bt-date-picker__day"];
				if (selected) cls.push("bt-date-picker__day--selected");
				if (sameDay(d, today)) cls.push("bt-date-picker__day--today");
				const label = escapeHtml(`${day}, ${fmt.full.format(toDate(d))}`);
				// 고를 수 없는 날도 방향키는 지나가야 한다 - disabled 대신 aria-disabled
				html += `<td class="${cell.join(" ")}" role="gridcell" aria-selected="${selected || between}"><button type="button" class="${cls.join(" ")}" data-day="${day}" tabindex="${day === f.day ? 0 : -1}" aria-label="${label}"${dayDisabled(d) ? ' aria-disabled="true"' : ""}>${day}</button></td>`;
			}
			html += "</tr>";
		}
		tbody.innerHTML = html;
	}

	function renderTime() {
		for (const row of timeRows) {
			const own = row.edge === "start" ? state.value : state.end;
			const base = own ?? state.focused;
			let [lo, hi] = minuteRange(base);
			// 같은 날의 종료는 시작 시각보다 앞일 수 없다
			if (row.edge === "end" && own && state.value && sameDay(own, state.value)) {
				lo = Math.max(lo, state.value.minutes ?? 0);
			}
			const minutes = own?.minutes ?? draft[row.edge];
			const hour = minutes === null ? null : Math.floor(minutes / 60);
			let hours = "";
			for (let h = 0; h < 24; h++) {
				const off = h * 60 + 59 < lo || h * 60 > hi;
				hours += `<option value="${h}"${h === hour ? " selected" : ""}${off ? " disabled" : ""}>${pad(h)}</option>`;
			}
			row.hour.innerHTML = hours;
			let mins = "";
			for (let m = 0; m < 60; m += config.minuteStep) {
				const at = (hour ?? 0) * 60 + m;
				const off = at < lo || at > hi;
				mins += `<option value="${m}"${minutes !== null && minutes % 60 === m ? " selected" : ""}${off ? " disabled" : ""}>${pad(m)}</option>`;
			}
			row.minute.innerHTML = mins;
			// 날짜가 없어도 막지 않는다 - 예전에는 막혀 있었는데 보통 칸과 똑같이 보였고, 막힌 select 를
			// 누르면 팝오버가 닫혔다 (#964). 고른 시각은 draft 에 들고 있다가 날짜를 고를 때 합친다
		}
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
		// 보기가 바뀌면 크기도 바뀐다 - 위로 열린 팝오버가 칸에서 떨어지지 않게 다시 붙인다
		place();
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

	/**
	 * 범위의 종료를 맞춘다. 시작보다 앞이면 비운다 - React DateRangePicker 와 같은 규칙. 시작으로 맞춰
	 * 버리면 사용자가 고르지 않은 날짜가 그대로 조회 · 저장된다. 같은 날의 더 이른 시각만 시작 시각으로 올린다
	 */
	function clampEnd(e) {
		const next = clamp(e);
		const s = state.value;
		// 시작 없는 종료는 만들지 않는다 - 달력으로는 만들 수 없는 상태라 종료만 서버로 가지 않게
		if (!next || !s) return null;
		if (cmp(next, s) >= 0) return next;
		return config.time && sameDay(next, s) ? { ...next, minutes: s.minutes } : null;
	}

	const out = (v) => (v ? format(v, config.time) : null);
	/** 바깥에 내보내는 값 - 한 칸이면 문자열, 범위면 { start, end } */
	const output = () =>
		config.range ? { start: out(state.value), end: out(state.end) } : out(state.value);

	/** 값을 비운다 (지우기 버튼 · Delete) - 범위면 시작 · 종료 함께. 팝오버는 열지 않는다 */
	function clear() {
		draft.start = draft.end = null;
		commit(null, true, null);
		trigger.focus();
	}

	/** 값을 바꾼다. 범위면 end 로 종료도 함께 (생략하면 지금 종료를 다시 맞춘다) */
	function commit(next, notify = true, end = state.end) {
		const prev = JSON.stringify(output());
		const inputs = [hidden, hiddenEnd].filter(Boolean);
		const before = inputs.map((el) => el.value);
		state.value = clamp(next);
		if (config.range) state.end = clampEnd(end);
		render();
		if (prev === JSON.stringify(output())) return;
		if (notify) config.onValueChange?.(output());
		// 이 칸을 minFrom · maxFrom 으로 따르는 칸들이 다시 맞춘다
		root.dispatchEvent(new CustomEvent("bt-date-picker-change", { bubbles: true }));
		// 폼 단위 change 리스너(자동 조회 · 바뀜 표시)가 날짜도 보게 - 숨은 input 은 스스로 change 를 내지 않는다.
		// 바뀐 input 만, 따르는 칸이 다시 맞춘 뒤에 낸다 (#974)
		if (notify) {
			inputs.forEach((el, i) => {
				if (el.value !== before[i]) el.dispatchEvent(new Event("change", { bubbles: true }));
			});
		}
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
		render();
		trackPanel();
		releaseEscape = pushEscape(() => close(true));
		focusDay();
	}

	/**
	 * 팝오버를 칸에 붙인다 - 아래 공간이 모자라면 위로, 오른쪽이 넘치면 칸의 오른쪽 끝에 맞춘다. fixed 라
	 * 스크롤 · 리사이즈 때마다 다시 잰다. 크기는 offset* 로 - 진입 모션의 transform 이 섞이지 않게
	 */
	function place() {
		const a = field.getBoundingClientRect();
		const origin = probe.getBoundingClientRect();
		const w = panel.offsetWidth;
		const h = panel.offsetHeight;
		const gap = 4;
		const up = a.bottom + gap + h > window.innerHeight && a.top - gap > h;
		const end = a.left + w > document.documentElement.clientWidth;
		panel.classList.toggle("bt-date-picker__panel--up", up);
		panel.classList.toggle("bt-date-picker__panel--end", end);
		let top = up ? a.top - gap - h : a.bottom + gap;
		// 어느 쪽에도 다 안 들어가면(낮은 화면) 화면 안으로 민다 - 칸을 덮더라도 달력 아랫줄이 밖으로 나가지 않게.
		// 칸이 스크롤로 화면 밖에 나갔으면 밀지 않는다 - 칸과 떨어져 가장자리에 붙어 남지 않게
		if (a.bottom > 0 && a.top < window.innerHeight)
			top = Math.max(gap, Math.min(top, window.innerHeight - gap - h));
		// 오른쪽 끝에 맞춰도 좁은 화면이면 왼쪽이 잘린다 - 왼쪽 여백에서 멈춘다
		const left = end ? Math.max(gap, a.right - w) : a.left;
		panel.style.top = `${top - origin.top}px`;
		panel.style.left = `${left - origin.left}px`;
	}

	let untrackPanel = null;
	/** 열려 있는 동안 좌표를 따라간다. capture - 스크롤 이벤트는 버블링하지 않는다 */
	function trackPanel() {
		if (untrackPanel) return;
		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				if (state.isOpen) place();
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

	function close(returnFocus = false) {
		if (!state.isOpen) return;
		state.isOpen = false;
		untrackPanel?.();
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
		state.focused = d;
		if (config.range) {
			// 첫 클릭은 시작, 두 번째는 종료. 종료가 이미 있거나 시작보다 앞을 누르면 새 시작이다
			const s = state.value;
			const restart = !s || !!state.end || compareDay(d, s) < 0;
			if (restart) {
				commit(
					// 시작을 다시 고르면 지금 시작 시각을 지킨다 - 한 칸 모드와 같다 (#974)
					{
						...d,
						minutes: config.time
							? (draft.start ?? state.value?.minutes ?? minuteRange(d)[0])
							: null,
					},
					true,
					null,
				);
				draft.start = null;
			} else {
				// 종료 시각의 처음 값은 그날 끝 - 하루 단위 조회가 그날 전체를 덮게 (먼저 고른 시각이 있으면 그것)
				const end = config.time ? clampMinutes(d, draft.end ?? 24 * 60 - 1) : null;
				commit(s, true, { ...d, minutes: end });
				draft.end = null;
			}
			if (!restart && !config.time) close(true);
			// 종료를 골랐으니 다음 할 일은 종료 시각 - 마지막 시각 줄로
			else if (!restart && viaKeyboard) timeRows[timeRows.length - 1].hour.focus();
			else focusDay();
			return;
		}
		const minutes = config.time ? (state.value?.minutes ?? draft.start ?? minuteRange(d)[0]) : null;
		commit({ ...d, minutes });
		draft.start = null;
		if (!config.time) close(true);
		// 키보드로 고르면 다음 할 일(시 칸)로 옮긴다. 마우스면 고른 날에 그대로 둔다 - 다시 그려 사라진 버튼
		// 대신 같은 날에 앉힌다. 마우스 클릭 뒤 select 로 옮기면 select 가 :focus-visible 에 걸려 링이 떴다 (#953)
		else if (viaKeyboard) timeRows[0].hour.focus();
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

	/**
	 * 날짜 없이 시각만 고르고 완료를 누르면 그 시각을 오늘에 붙인다 - 닫기만 하면 고른 시각이 말없이 사라졌다
	 * (#971). 범위면 시작 · 종료 둘 다 오늘. 오늘이 범위 밖이면 "오늘" 버튼처럼 채우지 않는다
	 */
	function fillToday() {
		if (state.value || (draft.start == null && draft.end == null) || dayDisabled(today)) return;
		const start = { ...today, minutes: draft.start ?? minuteRange(today)[0] };
		if (config.range) commit(start, true, { ...today, minutes: draft.end ?? 24 * 60 - 1 });
		else if (draft.start != null) commit(start);
		draft.start = draft.end = null;
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
		const lo = minBound();
		const hi = maxBound();
		// 일 보기(moveFocus)처럼 범위로 묶는다 - 고를 수 없는 칸에 포커스가 앉지 않게
		if (monthView) {
			let idx = p.year * 12 + (p.month - 1) + step;
			if (lo) idx = Math.max(idx, lo.year * 12 + lo.month - 1);
			if (hi) idx = Math.min(idx, hi.year * 12 + hi.month - 1);
			state.pick = { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
		} else {
			let year = p.year + step;
			if (lo) year = Math.max(year, lo.year);
			if (hi) year = Math.min(year, hi.year);
			state.pick = { ...p, year };
		}
		render();
		picks.querySelector('button[tabindex="0"]')?.focus();
		return true;
	}

	/** ‹ › - 보기마다 한 달 · 한 해 · 12년 */
	function navigate(dir, btn) {
		if (state.view === "day") moveFocus(addMonths(state.focused, dir), false);
		else {
			const p = state.pick;
			state.pick = { ...p, year: p.year + dir * (state.view === "month" ? 1 : YEARS) };
			render();
		}
		// 범위 끝에 닿아 누른 버튼이 막히면 포커스가 body 로 빠진다 - 고를 칸으로 옮긴다 (#974)
		if (btn.disabled) {
			if (state.view === "day") focusDay();
			else picks.querySelector('button[tabindex="0"]')?.focus();
		}
	}

	// ── 이벤트 ───────────────────────────────────────────────────────────────
	cleanups.push(
		on(trigger, "click", () => (state.isOpen ? close() : open())),

		on(trigger, "keydown", (e) => {
			if (
				config.clearable &&
				(e.key === "Delete" || e.key === "Backspace") &&
				// 수정 키와 함께면 브라우저 · 보조기술 단축키라 건드리지 않는다
				!(e.ctrlKey || e.metaKey || e.altKey) &&
				(state.value || state.end)
			) {
				e.preventDefault();
				clear();
				return;
			}
			if (e.key === "ArrowDown" && !state.isOpen) {
				e.preventDefault();
				open();
			}
		}),
		on(prevBtn, "click", () => navigate(-1, prevBtn)),
		on(nextBtn, "click", () => navigate(1, nextBtn)),
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
		// 팝오버 밖을 누르거나 Tab 으로 빠져나가면 닫는다. 안팎은 누른 자리로도 가린다 - 막힌 컨트롤을
		// 누르면 브라우저가 그 컨트롤 대신 바깥 요소를 target 으로 줄 수 있어, target 만 보면 팝오버 안을
		// 눌렀는데 닫혔다 (#964)
		on(document, "pointerdown", (e) => {
			if (!state.isOpen || root.contains(e.target)) return;
			const r = panel.getBoundingClientRect();
			const inside =
				e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
			if (!inside) close();
		}),
		on(root, "focusout", (e) => {
			if (state.isOpen && e.relatedTarget && !root.contains(e.relatedTarget)) close();
		}),
	);
	for (const row of timeRows) {
		const onTime = () => {
			const own = row.edge === "start" ? state.value : state.end;
			const minutes = Number(row.hour.value) * 60 + Number(row.minute.value);
			if (!own) {
				draft[row.edge] = minutes;
				renderTime();
				return;
			}
			const next = { ...own, minutes };
			if (row.edge === "start") commit(next);
			else commit(state.value, true, next);
		};
		cleanups.push(on(row.hour, "change", onTime), on(row.minute, "change", onTime));
	}
	// 범위 - 시작만 고른 동안 마우스가 가리키는 날까지 띠로 미리 보인다
	if (config.range) {
		cleanups.push(
			on(tbody, "mouseover", (e) => {
				const btn = e.target.closest("button[data-day]");
				if (!btn || !state.value || state.end) return;
				const hover = { ...state.focused, day: Number(btn.dataset.day) };
				for (const b of tbody.querySelectorAll("button[data-day]")) {
					const d = { ...state.focused, day: Number(b.dataset.day) };
					b.parentElement.classList.toggle(
						"bt-date-picker__cell--in-range",
						compareDay(d, state.value) > 0 && compareDay(d, hover) < 0,
					);
				}
			}),
			// 달력 밖으로 나가면 미리보기를 지운다 - 고르지 않은 종료가 고른 것처럼 남지 않게
			on(tbody, "mouseleave", () => {
				if (state.value && !state.end) renderGrid();
			}),
		);
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
	if (config.range) {
		state.value = clamp(parse(initial.start));
		state.end = clampEnd(parse(initial.end));
	} else {
		state.value = clamp(parse(config.defaultValue));
	}
	render();

	// form.reset() · <button type="reset"> 은 숨은 input 을 되돌리지 못한다 - value 를 대입하면 기본값도 바뀐다.
	// reset 이 끝난 뒤 처음 값으로 되돌린다 (#974)
	const startValue = output();
	const form = root.closest("form");
	if (form) cleanups.push(on(form, "reset", () => queueMicrotask(() => api.setValue(startValue))));

	const api = {
		/** 지금 값 - "YYYY-MM-DD" · "YYYY-MM-DDTHH:mm", 없으면 null */
		// 범위면 { start, end } (각각 문자열 또는 null)
		getValue: output,
		/** 값을 바꾼다. 범위 밖이면 경계로 맞추고, null 이면 비운다 */
		setValue: (value) => {
			// 바깥에서 값을 정하면(폼 리셋 등) 먼저 골라 둔 시각도 버린다 - 남으면 다음 날짜에 옛 시각이 붙었다
			draft.start = draft.end = null;
			// null · 빈 문자열만 비운다 - 형식이 틀린 값은 무시하고 지금 값을 지킨다
			if (!value) return commit(null, true, null);
			if (config.range) {
				const start = value.start ? parse(value.start) : null;
				const end = value.end ? parse(value.end) : null;
				if ((value.start && !start) || (value.end && !end)) return;
				return commit(start, true, end);
			}
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
			// 숨은 input 은 남긴다 - 폼이 값을 계속 보내고, 다시 만들면 같은 name 으로 이어받는다 (범위면 종료도, #974)
			created.forEach((el) => {
				if (el !== hidden && el !== hiddenEnd) el.remove();
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

/**
 * 범위형 - 한 팝오버에서 시작 · 종료를 고른다 (React DateRangePicker 대응, #951). `DatePicker(el, { range: true })` 와 같다.
 * 마크업은 `data-bt-date-picker data-range`.
 */
export function DateRangePicker(element, options = {}) {
	return DatePicker(element, { ...options, range: true });
}
