"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

type DatePickerMode = "year-month" | "year-month-day";
type SelectableRange = "all" | "until-today";

interface DatePickerProps {
	/** 데이트 피커 위에 표시할 라벨 텍스트 */
	label?: string;
	/** 제어형 날짜 값 ("YYYY-MM" 또는 "YYYY-MM-DD" 형식) */
	value?: string;
	/** 날짜 변경 시 호출되는 콜백. `mode` 값에 따라 "YYYY-MM" 또는 "YYYY-MM-DD" 형식의 문자열이 전달됩니다. */
	onChange: (value: string) => void;
	/** 선택 모드 (기본값: "year-month-day") */
	mode?: DatePickerMode;
	/** 연도 선택 범위 시작 (기본값: 1950) */
	startYear?: number;
	/** 연도 선택 범위 끝 (기본값: 현재 연도 + 10) */
	endYear?: number;
	/** 선택 가능한 최소 날짜 ("YYYY-MM-DD" 형식) */
	minDate?: string;
	/** 선택 가능한 날짜 범위 ("all": 제한 없음, "until-today": 오늘까지) */
	selectableRange?: SelectableRange;
	/** 비활성화 여부 */
	disabled?: boolean;
	/** 데이트 피커가 컨테이너의 전체 너비를 차지할지 여부 */
	fullWidth?: boolean;
	/**
	 * 데이트 피커의 커스텀 너비
	 * @deprecated `fullWidth` 사용 또는 CSS로 처리
	 */
	width?: number | string;
	/** 연도 select의 aria-label 및 빈 옵션 텍스트 (기본값: "Year") */
	yearLabel?: string;
	/** 월 select의 aria-label 및 빈 옵션 텍스트 (기본값: "Month") */
	monthLabel?: string;
	/** 일 select의 aria-label 및 빈 옵션 텍스트 (기본값: "Day") */
	dayLabel?: string;
	/**
	 * minDate 설정 시 스크린리더에 전달할 안내 문구 포맷.
	 * `{date}` 자리에 minDate 값이 치환됩니다. (기본값: "Minimum date: {date}")
	 */
	minDateSrFormat?: string;
	/**
	 * selectableRange="until-today" 설정 시 스크린리더에 전달할 안내 문구.
	 * (기본값: "Selectable up to today")
	 */
	selectableRangeUntilTodaySrText?: string;
}

/** 숫자를 두 자리 문자열로 보정한다. */
const pad = (n: number) => String(n).padStart(2, "0");

/** 해당 연/월의 일 수를 구한다. */
const getDaysInMonth = (year: number, month: number) =>
	new Date(year, month, 0).getDate();

/** 너비 값을 CSS 문자열로 정규화한다. */
const normalizeWidth = (v?: number | string) =>
	typeof v === "number" ? `${v}px` : v;

/** start~end 범위의 숫자 배열을 생성한다. */
const range = (start: number, end: number) =>
	Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * 연/월/일 선택형 데이트 피커를 렌더링한다.
 * 입력 값과 선택 범위를 기준으로 옵션을 계산하고, 선택 변경을 상위로 전달한다.
 */
export const DatePicker = ({
	label,
	value,
	onChange,
	mode = "year-month-day",
	startYear = 1950,
	endYear: endYearProp,
	minDate,
	selectableRange = "all",
	disabled,
	fullWidth = true,
	width,
	yearLabel = "Year",
	monthLabel = "Month",
	dayLabel = "Day",
	minDateSrFormat = "Minimum date: {date}",
	selectableRangeUntilTodaySrText = "Selectable up to today",
}: DatePickerProps) => {
	const groupId = React.useId();
	const constraintId = React.useId();

	// today 값을 마운트 시점에 한 번만 계산
	const { todayYear, todayMonth, todayDay } = React.useMemo(() => {
		const now = new Date();
		return {
			todayYear: now.getFullYear(),
			todayMonth: now.getMonth() + 1,
			todayDay: now.getDate(),
		};
	}, []);

	const endYear = endYearProp ?? todayYear + 10;

	// value 파싱 (NaN → 0으로 통일)
	const parsed = React.useMemo(() => {
		if (!value) return { year: 0, month: 0, day: 0 };
		const [y, m, d] = value.split("-").map(Number);
		return {
			year: y || 0,
			month: m || 0,
			day: d || 0,
		};
	}, [value]);

	// minDate 파싱
	const min = React.useMemo(() => {
		if (!minDate) return { year: 0, month: 0, day: 0 };
		const [y, m, d] = minDate.split("-").map(Number);
		return {
			year: y || 0,
			month: m || 0,
			day: d || 0,
		};
	}, [minDate]);

	const { year, month, day } = parsed;

	// ── 범위 계산 ────────────────────────────────────────────────────────

	const maxYear =
		selectableRange === "until-today" ? todayYear : endYear;

	const minMonth =
		min.year > 0 && year === min.year ? min.month : 1;

	const maxMonth =
		selectableRange === "until-today" && year === todayYear
			? todayMonth
			: 12;

	const minDay =
		min.year > 0 && min.month > 0 && year === min.year && month === min.month
			? min.day
			: 1;

	const maxDay = React.useMemo(() => {
		if (!year || !month) return 31;
		const daysInMonth = getDaysInMonth(year, month);
		if (selectableRange === "until-today" && year === todayYear && month === todayMonth) {
			return Math.min(daysInMonth, todayDay);
		}
		return daysInMonth;
	}, [year, month, selectableRange, todayYear, todayMonth, todayDay]);

	// ── 옵션 배열 메모이제이션 ────────────────────────────────────────────

	const yearOptions = React.useMemo(
		() => range(startYear, maxYear),
		[startYear, maxYear],
	);

	const monthOptions = React.useMemo(
		() => range(minMonth, Math.max(minMonth, maxMonth)),
		[minMonth, maxMonth],
	);

	const dayOptions = React.useMemo(
		() => range(minDay, Math.max(minDay, maxDay)),
		[minDay, maxDay],
	);

	// ── emit: 선택 값을 포맷팅해 onChange로 전달 ─────────────────────────

	const emit = React.useCallback(
		(yy: number, mm: number, dd?: number) => {
			if (mode === "year-month") {
				onChange(`${yy}-${pad(mm)}`);
				return;
			}
			const safeDay = Math.min(dd ?? 1, getDaysInMonth(yy, mm));
			onChange(`${yy}-${pad(mm)}-${pad(safeDay)}`);
		},
		[mode, onChange],
	);

	// ── 핸들러: 연/월 변경 시 하위 값 자동 보정 ──────────────────────────

	const handleYearChange = React.useCallback(
		(newYear: number) => {
			let newMonth = month;
			// 월이 새 범위를 벗어나면 보정
			const newMinMonth = min.year > 0 && newYear === min.year ? min.month : 1;
			const newMaxMonth =
				selectableRange === "until-today" && newYear === todayYear
					? todayMonth
					: 12;
			if (newMonth > 0 && newMonth < newMinMonth) newMonth = newMinMonth;
			if (newMonth > newMaxMonth) newMonth = newMaxMonth;

			if (newMonth > 0) {
				emit(newYear, newMonth, day || undefined);
			} else {
				// 월이 아직 선택 안 된 상태면 연도만 반영
				emit(newYear, newMinMonth, day || undefined);
			}
		},
		[month, day, min.year, min.month, selectableRange, todayYear, todayMonth, emit],
	);

	const handleMonthChange = React.useCallback(
		(newMonth: number) => {
			if (!year) return;
			emit(year, newMonth, day || undefined);
		},
		[year, day, emit],
	);

	const handleDayChange = React.useCallback(
		(newDay: number) => {
			if (!year || !month) return;
			emit(year, month, newDay);
		},
		[year, month, emit],
	);

	// ── 렌더링 ───────────────────────────────────────────────────────────

	const containerStyle = width ? { width: normalizeWidth(width) } : undefined;
	const rootClassName = cn("date_picker", {
		date_picker_full_width: fullWidth && !width,
	});

	const constraintParts: string[] = [];
	if (minDate) constraintParts.push(minDateSrFormat.replace("{date}", minDate));
	if (selectableRange === "until-today")
		constraintParts.push(selectableRangeUntilTodaySrText);
	const constraintDesc = constraintParts.join(". ");

	return (
		<div className={rootClassName} style={containerStyle}>
			{label && (
				<span className="date_picker_label" id={groupId}>
					{label}
				</span>
			)}
			{constraintDesc && (
				<span id={constraintId} className="date_picker_sr_only">
					{constraintDesc}
				</span>
			)}
			<div
				className="date_picker_fields"
				role="group"
				aria-labelledby={label ? groupId : undefined}
				aria-describedby={constraintDesc ? constraintId : undefined}
			>
				<select
					aria-label={yearLabel}
					value={year || ""}
					disabled={disabled}
					onChange={(e) => handleYearChange(Number(e.target.value))}
				>
					<option value="">{yearLabel}</option>
					{yearOptions.map((y) => (
						<option key={y} value={y}>
							{y}
						</option>
					))}
				</select>

				<select
					aria-label={monthLabel}
					value={month || ""}
					disabled={disabled || !year}
					onChange={(e) => handleMonthChange(Number(e.target.value))}
				>
					<option value="">{monthLabel}</option>
					{monthOptions.map((m) => (
						<option key={m} value={m}>
							{pad(m)}
						</option>
					))}
				</select>

				{mode === "year-month-day" && (
					<select
						aria-label={dayLabel}
						value={day || ""}
						disabled={disabled || !month}
						onChange={(e) => handleDayChange(Number(e.target.value))}
					>
						<option value="">{dayLabel}</option>
						{dayOptions.map((d) => (
							<option key={d} value={d}>
								{pad(d)}
							</option>
						))}
					</select>
				)}
			</div>
		</div>
	);
};
