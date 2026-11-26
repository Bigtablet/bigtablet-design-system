import type { DocPage } from "../docs";

export const datePicker: DocPage = {
	slug: "date-picker",
	category: "날짜 · 시간",
	order: 0,
	title: "DatePicker",
	name: "날짜 선택",
	summary:
		"연 · 월 · 일 드롭다운이나 달력으로 날짜를 고릅니다. `min` · `max` · `isDateDisabled` 로 고를 수 있는 날을 정합니다.",
	when: [
		["생년월일 · 계약일처럼 날짜 하나", "DatePicker", true],
		["정산 월처럼 월까지만", "MonthPicker", false],
		["시작 ~ 끝 기간", "DateRangePicker", false],
	],
	examples: [
		{ id: "date-picker/basic", title: "기본" },
		{ id: "date-picker/limits", title: "범위 · 막는 날" },
		{ id: "date-picker/states", title: "필수 · 비활성" },
	],
	props: "DatePickerProps",
	notes: [
		'값은 `"YYYY-MM-DD"` 문자열입니다',
		'`min` · `max` 는 `"YYYY-MM-DD"` 또는 `"today"` 를 받습니다. 연 목록도 이 범위로 좁혀집니다',
	],
};
