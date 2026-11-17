import type { DocPage } from "../docs";

export const datePicker: DocPage = {
	slug: "date-picker",
	category: "날짜 · 시간",
	order: 0,
	title: "DatePicker",
	summary: '연 · 월 · 일 드롭다운으로 날짜를 고릅니다. `mode="year-month"` 면 월까지만 고릅니다.',
	when: [
		["생년월일 · 계약일처럼 날짜 하나", "DatePicker", true],
		["정산 월처럼 월까지만", '`mode="year-month"`', true],
		["시작 ~ 끝 기간", "DateRangePicker", false],
	],
	examples: [{ id: "date-picker/basic", title: "날짜 · 월" }],
	props: "DatePickerProps",
	notes: ['값은 `"YYYY-MM-DD"` (월 모드는 `"YYYY-MM"`) 문자열입니다'],
};
