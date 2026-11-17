import type { DocPage } from "../docs";

export const dateCalendar: DocPage = {
	slug: "date-calendar",
	category: "Forms",
	title: "DateCalendar",
	summary:
		'월 달력에서 날짜 하나를 고릅니다. DatePicker `variant="calendar"` 의 팝오버도 이 컴포넌트입니다.',
	when: [
		["화면에 펼쳐 둔 달력 (예약 · 일정)", "DateCalendar", true],
		["입력 칸에서 날짜 고르기", "DatePicker", false],
		["기간 고르기", "DateRangePicker", false],
	],
	examples: [{ id: "date-calendar/basic", title: "기본" }],
	props: "DateCalendarProps",
	notes: [
		'값은 `"YYYY-MM-DD"` 문자열입니다 - `Date` 로 바꾸면 시간대 때문에 하루 밀릴 수 있습니다',
	],
};
