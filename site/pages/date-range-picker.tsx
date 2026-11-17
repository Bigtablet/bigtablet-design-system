import type { DocPage } from "../docs";

export const dateRangePicker: DocPage = {
	slug: "date-range-picker",
	category: "Forms",
	title: "DateRangePicker",
	summary: "시작일과 종료일을 고릅니다. 종료일은 시작일보다 앞설 수 없습니다.",
	when: [
		["조회 기간 · 예약 기간", "DateRangePicker", true],
		["날짜 하나", "DatePicker", false],
	],
	examples: [{ id: "date-range-picker/basic", title: "기본" }],
	props: "DateRangePickerProps",
};
