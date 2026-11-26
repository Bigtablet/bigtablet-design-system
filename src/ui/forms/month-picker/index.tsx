"use client";

import { DateFields, type DatePickerProps } from "../date-picker";

export type MonthPickerProps = Omit<
	DatePickerProps,
	"variant" | "placeholder" | "dayLabel" | "isDateDisabled"
> & {
	/** 제어형 값 (`"YYYY-MM"`) */
	value?: string;
	/** 고를 수 있는 가장 이른 달 - `"YYYY-MM"` 또는 `"today"`(이번 달) */
	min?: string;
	/** 고를 수 있는 가장 늦은 달 - `"YYYY-MM"` 또는 `"today"`(이번 달) */
	max?: string;
	/** 값이 바뀔 때 호출된다 - `"YYYY-MM"` */
	onValueChange: (value: string) => void;
};

/**
 * 연 · 월 선택 (`"YYYY-MM"`). 정산 월 · 카드 유효기간처럼 날까지는 고르지 않는 칸에 쓴다.
 *
 * `DatePicker` 의 연 · 월 드롭다운을 그대로 쓴다 - 범위 계산 · 지우기 · `Field` 연결이 같다.
 *
 * @example
 * ```tsx
 * <Field name="settledMonth" label="정산 월">
 *   <MonthPicker value={month} onValueChange={setMonth} max="today" />
 * </Field>
 * ```
 */
export const MonthPicker = (props: MonthPickerProps) => <DateFields {...props} mode="year-month" />;
