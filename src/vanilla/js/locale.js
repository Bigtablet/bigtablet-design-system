/* ========================================
     Locale - Vanilla 번들 문구 카탈로그 (#949)
     ======================================== */

// React `src/ui/system/locale-provider/messages.ts` 와 같은 키 · 같은 문구다. 카탈로그 전체(80여 키 × 2)를
// 번들에 넣으면 크기가 크게 늘어 Vanilla 컴포넌트가 쓰는 키만 둔다 - 값이 React 와 같은지는
// bigtablet.locale.test.ts 가 messages.ts 와 비교해 지킨다. `vanilla.*` 키는 Vanilla 에만 있다.
const catalogs = {
	ko: {
		"alert.cancel": "취소",
		"alert.confirm": "확인",
		"copyButton.copied": "복사됨",
		"copyButton.copy": "복사",
		"copyButton.failed": "복사하지 못했습니다",
		"datePicker.calendar": "달력",
		"datePicker.clear": "날짜 지우기",
		"datePicker.nextMonth": "다음 달",
		"datePicker.placeholder": "날짜 선택",
		"datePicker.prevMonth": "이전 달",
		"dateRange.end": "종료일",
		"dateRange.start": "시작일",
		"dropdown.empty": "결과 없음",
		"dropdown.placeholder": "선택…",
		"dropdown.searchPlaceholder": "검색…",
		"dropdown.selectedSummary": "{count}개 선택",
		"pagination.jumpLabel": "현재 {page}쪽 - 이동할 쪽 번호 (1–{total})",
		"pagination.label": "페이지 이동",
		"pagination.next": "다음 페이지",
		"pagination.prev": "이전 페이지",
		"sidebar.toggle": "사이드바 토글",
		"timePicker.hour": "시",
		"timePicker.minute": "분",
		"toast.close": "닫기",
		"toast.region": "알림",
		"vanilla.datePicker.changeView": "연 · 월 선택",
		"vanilla.datePicker.done": "완료",
		"vanilla.datePicker.nextYear": "다음 해",
		"vanilla.datePicker.nextYears": "다음 12년",
		"vanilla.datePicker.placeholderTime": "날짜와 시각 선택",
		"vanilla.datePicker.prevYear": "이전 해",
		"vanilla.datePicker.prevYears": "이전 12년",
		"vanilla.datePicker.today": "오늘",
		"vanilla.dateRange.placeholder": "기간 선택",
		"vanilla.dateRange.placeholderTime": "기간과 시각 선택",
	},
	en: {
		"alert.cancel": "Cancel",
		"alert.confirm": "OK",
		"copyButton.copied": "Copied",
		"copyButton.copy": "Copy",
		"copyButton.failed": "Couldn't copy",
		"datePicker.calendar": "Calendar",
		"datePicker.clear": "Clear date",
		"datePicker.nextMonth": "Next month",
		"datePicker.placeholder": "Select date",
		"datePicker.prevMonth": "Previous month",
		"dateRange.end": "End date",
		"dateRange.start": "Start date",
		"dropdown.empty": "No results",
		"dropdown.placeholder": "Select…",
		"dropdown.searchPlaceholder": "Search…",
		"dropdown.selectedSummary": "{count} selected",
		"pagination.jumpLabel": "Page {page} - go to page (1–{total})",
		"pagination.label": "Pagination",
		"pagination.next": "Next page",
		"pagination.prev": "Previous page",
		"sidebar.toggle": "Toggle sidebar",
		"timePicker.hour": "Hour",
		"timePicker.minute": "Minute",
		"toast.close": "Close",
		"toast.region": "Notifications",
		"vanilla.datePicker.changeView": "Choose month and year",
		"vanilla.datePicker.done": "Done",
		"vanilla.datePicker.nextYear": "Next year",
		"vanilla.datePicker.nextYears": "Next 12 years",
		"vanilla.datePicker.placeholderTime": "Select date and time",
		"vanilla.datePicker.prevYear": "Previous year",
		"vanilla.datePicker.prevYears": "Previous 12 years",
		"vanilla.datePicker.today": "Today",
		"vanilla.dateRange.placeholder": "Select dates",
		"vanilla.dateRange.placeholderTime": "Select dates and times",
	},
};

let forced = null;
const overrides = {};

/** 지금 로케일 - setLocale 로 정했으면 그것, 아니면 `<html lang>` (en* 이면 en, 그 밖은 ko) */
export function getLocale() {
	if (forced) return forced;
	const lang = (typeof document !== "undefined" && document.documentElement.lang) || "";
	return lang.toLowerCase().startsWith("en") ? "en" : "ko";
}

/** Intl 에 넘길 로케일 이름 */
export const intlLocale = () => (getLocale() === "en" ? "en-US" : "ko-KR");

/**
 * 로케일을 고른다 ("ko" · "en"). null 이면 다시 `<html lang>` 을 따른다.
 * 이미 만든 컴포넌트의 문구는 바뀌지 않는다 - 자동 초기화 전에(번들 바로 뒤 스크립트에서) 부른다.
 */
export function setLocale(locale) {
	// 자체 키만 - "constructor" 같은 프로토타입 키가 들어가면 t() 가 TypeError 를 낸다
	forced = locale && Object.hasOwn(catalogs, locale) ? locale : null;
}

/** 일부 문구를 덮어쓴다 - `{ "pagination.prev": "Prev" }`. 로케일과 무관하게 이긴다. null 이면 덮어쓴 문구를 모두 지운다 */
export function setMessages(messages) {
	if (messages === null) {
		for (const key of Object.keys(overrides)) delete overrides[key];
		return;
	}
	Object.assign(overrides, messages);
}

/** 키의 문구. `{name}` 자리표시자를 vars 로 채운다 */
export function t(key, vars) {
	const text = overrides[key] ?? catalogs[getLocale()][key] ?? catalogs.ko[key] ?? key;
	return vars
		? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m))
		: text;
}

/** 테스트 전용 - React 카탈로그와 같은지 비교한다 */
export const vanillaCatalogs = catalogs;
