import type { DocPage } from "../docs";

export const timePicker: DocPage = {
	slug: "time-picker",
	category: "날짜 · 시간",
	order: 3,
	title: "TimePicker",
	name: "시간 선택",
	summary: '시 · 분 드롭다운으로 시각을 고릅니다. 값은 `"HH:mm"` 문자열입니다.',
	when: [
		["알림 · 예약 시각", "TimePicker", true],
		["날짜도 같이", "DatePicker + TimePicker", false],
	],
	examples: [
		{ id: "time-picker/basic", title: "15분 단위" },
		{ id: "time-picker/states", title: "필수 · 비활성" },
	],
	props: "TimePickerProps",
};
