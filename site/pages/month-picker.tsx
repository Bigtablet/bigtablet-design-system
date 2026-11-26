import type { DocPage } from "../docs";

export const monthPicker: DocPage = {
	slug: "month-picker",
	category: "날짜 · 시간",
	order: 4,
	title: "MonthPicker",
	name: "월 선택",
	summary: '연 · 월 드롭다운으로 달을 고릅니다. 값은 `"YYYY-MM"` 문자열입니다.',
	when: [
		["정산 월 · 카드 유효기간처럼 월까지만", "MonthPicker", true],
		["날까지 고른다", "DatePicker", false],
	],
	examples: [{ id: "month-picker/basic", title: "기본" }],
	props: "MonthPickerProps",
	notes: ['`min` · `max` 도 `"YYYY-MM"` 으로 줍니다. `"today"` 는 이번 달입니다'],
};
