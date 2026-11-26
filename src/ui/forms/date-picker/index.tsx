"use client";

import { Calendar, X } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import { IconButton } from "../../general/icon-button";
import { Popover } from "../../overlay/popover";
import { useLocaleName, useLocaleText } from "../../system/locale-provider";
import { DateCalendar } from "../date-calendar";
import { Dropdown, type DropdownOption, type DropdownSize } from "../dropdown";
import { FieldControlBoundary, useFieldControl } from "../field";
import "./style.scss";

type DatePickerMode = "year-month" | "year-month-day";
/** 연·월·일 한 점. 월은 1부터. */
interface CalendarDate {
	year: number;
	month: number;
	day: number;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const toIso = ({ year, month, day }: CalendarDate) => `${year}-${pad2(month)}-${pad2(day)}`;
const fromIso = (iso: string): CalendarDate => {
	const [year = 0, month = 0, day = 0] = iso.split("-").map(Number);
	return { year, month, day };
};
/** 비교용 정수. 일이 0(월까지만 준 값)이면 `emptyDay` 로 읽는다 - 하한은 1일, 상한은 31 */
const pointOf = ({ year, month, day }: CalendarDate, emptyDay: number) =>
	year * 10000 + month * 100 + (day || emptyDay);
/** `min` · `max` 값 - `"today"` 또는 `"YYYY-MM(-DD)"`. 읽을 수 없으면 null */
const parseBound = (raw: string | undefined, today: CalendarDate): CalendarDate | null => {
	if (!raw) return null;
	if (raw === "today") return today;
	const { year, month, day } = fromIso(raw);
	return year > 0 ? { year, month: month || 0, day: day || 0 } : null;
};

type DatePickerVariant = "dropdown" | "calendar";
type SelectableRange = "all" | "until-today";

interface DatePickerBaseProps {
	/** 데이트 피커 위에 표시할 라벨 텍스트 */
	label?: string;
	/** 제어형 날짜 값 ("YYYY-MM" 또는 "YYYY-MM-DD" 형식) */
	value?: string;
	/**
	 * 선택 모드
	 * @deprecated 연·월만 고르려면 `MonthPicker` 를 쓴다. 다음 major 에서 제거한다.
	 */
	mode?: DatePickerMode;
	/**
	 * 고르는 방식 (기본값: "dropdown").
	 * - `"dropdown"`: 연 · 월 · 일 드롭다운 3개. 생년월일처럼 먼 과거의 연도를 고를 때 맞다.
	 * - `"calendar"`: 날짜 칸 하나 + 월 달력 팝오버. 일정처럼 가까운 날을 요일과 함께 볼 때 맞다.
	 *   `mode="year-month-day"` 에서만 쓴다 - `"year-month"` 면 달력이 고를 날이 없어 드롭다운으로 그린다.
	 */
	variant?: DatePickerVariant;
	/** `variant="calendar"` 에서 값이 없을 때 칸에 보일 문구 (기본값: "날짜 선택") */
	placeholder?: string;
	/**
	 * 고를 수 있는 가장 이른 날 - `"YYYY-MM-DD"` (MonthPicker 는 `"YYYY-MM"`) 또는 `"today"`.
	 * 연 목록도 이 해부터 시작한다 (없으면 1950)
	 */
	min?: string;
	/**
	 * 고를 수 있는 가장 늦은 날 - `"YYYY-MM-DD"` (MonthPicker 는 `"YYYY-MM"`) 또는 `"today"`.
	 * 연 목록도 이 해에서 끝난다 (없으면 현재 연도 + 10)
	 */
	max?: string;
	/**
	 * 날마다 막을지 정한다 - `"YYYY-MM-DD"` 를 받아 true 면 고를 수 없다 (휴무일 · 마감일 등).
	 * `min` · `max` 와 함께 걸린다. MonthPicker 에는 없다
	 */
	isDateDisabled?: (date: string) => boolean;
	/** @deprecated `min="YYYY-01-01"` 을 쓴다. 다음 major 에서 제거한다. */
	startYear?: number;
	/** @deprecated `max="YYYY-12-31"` 을 쓴다. 다음 major 에서 제거한다. */
	endYear?: number;
	/** @deprecated `min` 을 쓴다. 다음 major 에서 제거한다. */
	minDate?: string;
	/** @deprecated `selectableRange="until-today"` 는 `max="today"` 를 쓴다. 다음 major 에서 제거한다. */
	selectableRange?: SelectableRange;
	/** 비활성화 여부 */
	disabled?: boolean;
	/**
	 * 필수 입력 여부. `Field` 안에서는 `Field` 의 `required` 가 이긴다.
	 * `role="group"` 에는 `aria-required` 를 붙일 수 없어 안쪽 컨트롤마다 내려보낸다.
	 */
	required?: boolean;
	/** 데이트 피커가 컨테이너의 전체 너비를 차지할지 여부 */
	fullWidth?: boolean;
	/**
	 * 칸 크기 (기본값: "md"). Dropdown · TextField · Button 과 같은 높이 단계라 한 줄에 두면 맞는다
	 * - sm · md 40px, lg 48px (좁은 화면은 한 단계 위).
	 */
	size?: DropdownSize;
	/**
	 * 값이 있을 때 지우기(×) 버튼을 둔다 - 누르면 `onValueChange("")` (#965). 조회 조건처럼
	 * "값 없음 = 조건 없음" 인 칸에 쓴다. 필수 칸에는 두지 않는다. 달력형은 칸에서 Delete · Backspace 로도 지운다
	 */
	clearable?: boolean;
	/** 지우기 버튼 이름 (기본값: 로케일 `datePicker.clear`) */
	clearLabel?: string;
	/** 연도 select의 라벨/플레이스홀더 */
	yearLabel?: string;
	/** 월 select의 라벨/플레이스홀더 */
	monthLabel?: string;
	/** 일 select의 라벨/플레이스홀더 */
	dayLabel?: string;
	/**
	 * `min` 설정 시 스크린리더에 전달할 안내 문구 포맷.
	 * `{date}` 자리에 `min` 값이 치환됩니다. (기본값: "최소 날짜: {date}")
	 */
	minDateSrFormat?: string;
	/**
	 * `max="today"` 설정 시 스크린리더에 전달할 안내 문구.
	 * (기본값: "오늘까지 선택 가능")
	 */
	selectableRangeUntilTodaySrText?: string;
}

// DatePicker 는 controlled 전용(내부 value 상태 없음) → 값 콜백이 필수다.
export type DatePickerProps = DatePickerBaseProps & {
	/** 값이 바뀔 때 호출된다 - `YYYY-MM-DD` (year-month 모드는 `YYYY-MM`) */
	onValueChange: (value: string) => void;
};

/** 숫자를 두 자리 문자열로 보정한다. */
const pad = (n: number) => String(n).padStart(2, "0");

/** 해당 연/월의 일 수를 구한다. */
const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

/** start~end 범위의 숫자 배열을 생성한다. */
const range = (start: number, end: number) =>
	Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * 연/월/일 선택형 데이트 피커를 렌더링한다.
 * 내부적으로 DS Dropdown 3개를 조합해 드롭다운 UX 일관성을 유지한다.
 */
export const DatePicker = ({
	label,
	value,
	onValueChange,
	mode = "year-month-day",
	variant = "dropdown",
	placeholder: placeholderProp,
	min: minProp,
	max: maxProp,
	isDateDisabled,
	startYear,
	endYear,
	minDate,
	selectableRange = "all",
	disabled,
	required,
	fullWidth = true,
	size = "md",
	clearable = false,
	clearLabel: clearLabelProp,
	yearLabel: yearLabelProp,
	monthLabel: monthLabelProp,
	dayLabel: dayLabelProp,
	minDateSrFormat: minDateSrFormatProp,
	selectableRangeUntilTodaySrText: selectableRangeUntilTodaySrTextProp,
}: DatePickerProps) => {
	const t = useLocaleText();
	const localeName = useLocaleName();
	const yearLabel = yearLabelProp ?? t("datePicker.year");
	const monthLabel = monthLabelProp ?? t("datePicker.month");
	const dayLabel = dayLabelProp ?? t("datePicker.day");
	const minDateSrFormat = minDateSrFormatProp ?? t("datePicker.minDateSr");
	const selectableRangeUntilTodaySrText =
		selectableRangeUntilTodaySrTextProp ?? t("datePicker.rangeUntilTodaySr");
	// Field 가 감싸면 Field 라벨이 그룹 이름이 된다.
	const field = useFieldControl();
	// role="group" 은 aria-required 를 받지 못한다(axe aria-allowed-attr) - 필수 여부는
	// 안쪽 컨트롤마다 내려보낸다. Field 가 감싸면 Field 가 출처다.
	const isRequired = field ? field.required || undefined : required || undefined;
	const clearLabel = clearLabelProp ?? t("datePicker.clear");
	// 값이 있을 때만 - 비활성 칸은 지울 수 없다
	const onClear = clearable && value && !disabled ? () => onValueChange("") : undefined;
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

	// 범위 - 새 prop(min · max)과 deprecated prop 을 한 쌍으로 합친다. 여럿이면 더 좁은 쪽이 이긴다.
	// 월까지만 주면(`"YYYY-MM"`) 일은 0 - 아래 계산이 하한은 1일, 상한은 그 달 말일로 읽는다.
	const { lo, hi } = React.useMemo(() => {
		const today = { year: todayYear, month: todayMonth, day: todayDay };
		const los = [
			parseBound(minProp, today),
			parseBound(minDate, today),
			startYear ? { year: startYear, month: 1, day: 1 } : null,
		].filter((d): d is CalendarDate => d !== null);
		const his = [
			parseBound(maxProp, today),
			selectableRange === "until-today" ? today : null,
			endYear ? { year: endYear, month: 12, day: 31 } : null,
		].filter((d): d is CalendarDate => d !== null);
		return {
			lo: los.reduce<CalendarDate | null>(
				(a, d) => (!a || pointOf(d, 1) > pointOf(a, 1) ? d : a),
				null,
			),
			hi: his.reduce<CalendarDate | null>(
				(a, d) => (!a || pointOf(d, 31) < pointOf(a, 31) ? d : a),
				null,
			),
		};
	}, [
		minProp,
		maxProp,
		minDate,
		startYear,
		endYear,
		selectableRange,
		todayYear,
		todayMonth,
		todayDay,
	]);
	// 스크린리더 안내 - 상한이 오늘이면 "오늘까지", 하한은 준 날짜를 그대로 읽는다
	const untilToday = selectableRange === "until-today" || maxProp === "today";
	const minLabel = minProp === "today" ? undefined : (minProp ?? minDate);

	const { year, month, day } = parsed;

	// ── 범위 계산 ────────────────────────────────────────────────────────

	// 연 목록은 하한·상한이 있으면 그 해까지, 없으면 1950 ~ 현재 연도 + 10
	const minYear = lo?.year ?? 1950;
	const maxYear = hi?.year ?? todayYear + 10;

	const minMonth = lo && year === lo.year ? Math.min(12, Math.max(1, lo.month)) : 1;

	const maxMonth = hi && year === hi.year ? Math.min(12, Math.max(1, hi.month || 12)) : 12;

	/**
	 * 주어진 연·월에서 고를 수 있는 일의 범위. **목록과 emit 이 같은 계산을 써야 한다** -
	 * 목록만 좁히면 연·월을 바꿀 때 예전 일이 그대로 emit 되어, 소비자 상태에는 범위 밖 날짜가
	 * 들어가고 화면의 일 Dropdown 은 그 값을 목록에서 못 찾아 빈 칸으로 보인다.
	 */
	const dayBoundsFor = React.useCallback(
		(yy: number, mm: number) => {
			if (!yy || !mm) return { min: 1, max: 31 };
			const daysInMonth = getDaysInMonth(yy, mm);
			const first =
				lo && lo.month > 0 && yy === lo.year && mm === lo.month
					? Math.min(daysInMonth, Math.max(1, lo.day))
					: 1;
			const last =
				hi && yy === hi.year && mm === hi.month
					? Math.min(daysInMonth, hi.day || daysInMonth)
					: daysInMonth;
			// `first > last` 는 두 제약의 교집합이 빈 경우다 - `min="2026-09-20"` 과
			// `max="today"`(오늘 2026-09-15) 를 함께 주면 그렇게 된다.
			// `Math.max` 로 넓히면 **미래 날짜가 선택 가능해진다** - 이 컴포넌트가 막으려는
			// 바로 그 값이다. 좁은 쪽(last)을 그대로 두어 일 목록이 비고, emit 은 last 를 넘지 않는다.
			return { min: first, max: last };
		},
		[lo, hi],
	);
	/** 그 연·월에 고를 수 있는 날 - 범위 안이면서 `isDateDisabled` 가 막지 않은 날 */
	const daysFor = React.useCallback(
		(yy: number, mm: number) => {
			const bounds = dayBoundsFor(yy, mm);
			if (bounds.max < bounds.min) return [];
			const days = range(bounds.min, bounds.max);
			return isDateDisabled
				? days.filter((d) => !isDateDisabled(`${yy}-${pad(mm)}-${pad(d)}`))
				: days;
		},
		[dayBoundsFor, isDateDisabled],
	);

	/** 그 달이 고를 날을 하나라도 가졌는지. year-month 모드는 날을 고르지 않아 `isDateDisabled` 를 보지 않는다 */
	const monthSelectable = React.useCallback(
		(yy: number, mm: number) => {
			if (mode === "year-month") {
				const bounds = dayBoundsFor(yy, mm);
				return bounds.max >= bounds.min;
			}
			return daysFor(yy, mm).length > 0;
		},
		[mode, dayBoundsFor, daysFor],
	);

	// ── DropdownOption[] 변환 ──────────────────────────────────────────────

	// 하한은 연 목록도 좁힌다. 월·일만 좁히면 하한보다 이전 **연도**가 그대로 남아
	// (min="2020-01-01" 인데 1950 이 목록 첫 항목이었다) 그 해를 고르는 순간 제약이
	// 무의미해진다 - 월·일 제한은 `year === lo.year` 일 때만 걸리기 때문이다.
	const yearOptions = React.useMemo<DropdownOption[]>(
		() =>
			range(minYear, maxYear).map((y) => ({
				value: String(y),
				label: String(y),
			})),
		[minYear, maxYear],
	);

	// 그 달에 고를 수 있는 날이 하나도 없으면 월 목록에서도 뺀다. `minMonth`/`maxMonth` 는 일을
	// 보지 않으므로, `min="2026-09-20"` + `max="today"`(오늘 2026-09-15) 처럼 같은 달 안에서
	// 교집합이 비거나 `isDateDisabled` 가 그 달을 다 막은 경우를 잡지 못한다. 목록에만 남겨 두면
	// 골라도 아무 일이 없는 항목이 된다 - 이 파일이 세운 "목록과 emit 이 같은 계산을 쓴다" 원칙이 깨지는 자리다.
	const monthOptions = React.useMemo<DropdownOption[]>(
		() =>
			range(minMonth, maxMonth)
				.filter((m) => !year || monthSelectable(year, m))
				.map((m) => ({
					value: String(m),
					label: pad(m),
				})),
		[minMonth, maxMonth, monthSelectable, year],
	);

	/** 교집합이 비면 고를 수 있는 일이 없다 - 목록을 비워 그 상태를 화면에도 드러낸다. */
	const dayOptions = React.useMemo<DropdownOption[]>(
		() =>
			(year && month ? daysFor(year, month) : range(1, 31)).map((d) => ({
				value: String(d),
				label: pad(d),
			})),
		[year, month, daysFor],
	);

	// ── emit: 선택 값을 포맷팅해 onValueChange 로 전달 ─────────────────────────

	/**
	 * 마지막 관문. 목록을 아무리 좁혀도 **월 단위로 넘어가는 경로**가 남는다 -
	 * `min="2026-12-01"` + `max="today"`(오늘 2026-09-15) 처럼 교집합이 비면 월 목록에 12 가
	 * 남고, 그것을 고르면 `dayBoundsFor` 는 그 달의 일수만 보므로 미래 날짜가 그대로 나간다.
	 * 여기서 한 번 더 확인해 범위 밖이면 **아무것도 내보내지 않는다** - 잘못된 값을 소비자 상태에
	 * 넣는 것보다 낫고, 화면에는 빈 일 목록으로 충돌 상태가 드러난다.
	 */
	const withinRange = React.useCallback(
		(yy: number, mm: number, dd: number) => {
			const point = pointOf({ year: yy, month: mm, day: dd }, 1);
			if (lo && point < pointOf(lo, 1)) return false;
			if (hi && point > pointOf(hi, 31)) return false;
			return true;
		},
		[lo, hi],
	);

	const emit = React.useCallback(
		(yy: number, mm: number, dd?: number) => {
			if (mode === "year-month") {
				// 목록과 **같은 계산**을 쓴다. 대표일을 하나 골라 검사하면 목록에는 있는데 고르면
				// 아무 반응이 없는 달이 생긴다.
				if (!monthSelectable(yy, mm)) return;
				onValueChange(`${yy}-${pad(mm)}`);
				return;
			}
			const days = daysFor(yy, mm);
			const first = days[0];
			// 교집합이 비거나 모두 막혔으면 내보낼 날이 없다.
			if (first === undefined) return;
			// 연·월을 옮기면 예전 일이 그 달에 없거나 막혔을 수 있다 - 그 뒤의 가장 가까운 날, 없으면 마지막 날
			const want = dd ?? first;
			const safeDay = days.includes(want)
				? want
				: (days.find((d) => d > want) ?? days[days.length - 1] ?? first);
			if (!withinRange(yy, mm, safeDay)) return;
			onValueChange(`${yy}-${pad(mm)}-${pad(safeDay)}`);
		},
		[mode, onValueChange, monthSelectable, daysFor, withinRange],
	);

	// ── 핸들러: 연/월 변경 시 하위 값 자동 보정 ──────────────────────────

	const handleYearChange = React.useCallback(
		(raw: string | null) => {
			if (!raw) return;
			const newYear = Number(raw);
			let newMonth = month;
			const newMinMonth = lo && newYear === lo.year ? Math.max(1, lo.month) : 1;
			const newMaxMonth = hi && newYear === hi.year ? hi.month || 12 : 12;
			if (newMonth > 0 && newMonth < newMinMonth) newMonth = newMinMonth;
			if (newMonth > newMaxMonth) newMonth = newMaxMonth;

			if (newMonth > 0) {
				emit(newYear, newMonth, day || undefined);
			} else {
				emit(newYear, newMinMonth, day || undefined);
			}
		},
		[month, day, lo, hi, emit],
	);

	const handleMonthChange = React.useCallback(
		(raw: string | null) => {
			if (!raw || !year) return;
			emit(year, Number(raw), day || undefined);
		},
		[year, day, emit],
	);

	const handleDayChange = React.useCallback(
		(raw: string | null) => {
			if (!raw || !year || !month) return;
			emit(year, month, Number(raw));
		},
		[year, month, emit],
	);

	// ── 렌더링 ───────────────────────────────────────────────────────────

	const rootClassName = cn("date_picker", `date_picker_size_${size}`, {
		date_picker_full_width: fullWidth,
		date_picker_disabled: disabled,
	});

	const constraintParts: string[] = [];
	if (minLabel) constraintParts.push(minDateSrFormat.replace("{date}", minLabel));
	if (untilToday) constraintParts.push(selectableRangeUntilTodaySrText);
	else if (maxProp) constraintParts.push(t("datePicker.maxDateSr").replace("{date}", maxProp));
	const constraintDesc = constraintParts.join(". ");

	if (variant === "calendar" && mode === "year-month-day") {
		return (
			<CalendarField
				rootClassName={rootClassName}
				label={label}
				labelId={field?.labelId ?? (label ? groupId : undefined)}
				describedBy={
					[field?.describedBy, constraintDesc ? constraintId : undefined]
						.filter(Boolean)
						.join(" ") || undefined
				}
				invalid={field?.invalid}
				inputId={field?.inputId}
				groupId={groupId}
				constraintId={constraintId}
				constraintDesc={constraintDesc}
				disabled={disabled}
				selected={year && month && day ? { year, month, day } : null}
				today={{ year: todayYear, month: todayMonth, day: todayDay }}
				isSelectable={({ year: yy, month: mm, day: dd }) =>
					yy >= minYear &&
					yy <= maxYear &&
					withinRange(yy, mm, dd) &&
					!isDateDisabled?.(`${yy}-${pad(mm)}-${pad(dd)}`)
				}
				minMonth={{
					year: minYear,
					month: lo && minYear === lo.year ? Math.max(1, lo.month) : 1,
				}}
				maxMonth={{
					year: maxYear,
					month: hi && maxYear === hi.year ? hi.month || 12 : 12,
				}}
				intlLocale={localeName === "en" ? "en-US" : "ko-KR"}
				placeholder={placeholderProp ?? t("datePicker.placeholder")}
				dialogLabel={label ?? t("datePicker.calendar")}
				prevLabel={t("datePicker.prevMonth")}
				nextLabel={t("datePicker.nextMonth")}
				onSelect={(d) => emit(d.year, d.month, d.day)}
				onClear={onClear}
				clearLabel={clearLabel}
			/>
		);
	}

	return (
		<div className={rootClassName}>
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
			{/* biome-ignore lint/a11y/useSemanticElements: <fieldset> would conflict with parent label/legend conventions; role=group is the WAI-ARIA equivalent */}
			<div
				className="date_picker_fields"
				role="group"
				aria-labelledby={field?.labelId ?? (label ? groupId : undefined)}
				aria-describedby={
					[field?.describedBy, constraintDesc ? constraintId : undefined]
						.filter(Boolean)
						.join(" ") || undefined
				}
				aria-invalid={field?.invalid || undefined}
			>
				{/* 내부 Dropdown 들은 Field 의 `inputId` 를 물려받으면 안 된다 - 셋이 같은 id 가
				    되어 `<label for>` 가 전부 첫 번째 목록을 가리킨다(#629). 라벨·에러 연결은
				    바로 위 `role="group"` 이 이미 담당한다. */}
				<FieldControlBoundary>
					<Dropdown
						size={size}
						label={yearLabel}
						placeholder={yearLabel}
						options={yearOptions}
						value={year ? String(year) : null}
						onValueChange={handleYearChange}
						required={isRequired}
						disabled={disabled}
					/>

					<Dropdown
						size={size}
						label={monthLabel}
						placeholder={monthLabel}
						options={monthOptions}
						value={month ? String(month) : null}
						onValueChange={handleMonthChange}
						required={isRequired}
						disabled={disabled || !year}
					/>

					{mode === "year-month-day" && (
						<Dropdown
							size={size}
							label={dayLabel}
							placeholder={dayLabel}
							options={dayOptions}
							value={day ? String(day) : null}
							onValueChange={handleDayChange}
							required={isRequired}
							disabled={disabled || !month}
						/>
					)}
				</FieldControlBoundary>
				{onClear && (
					<IconButton
						className="date_picker_clear"
						size="sm"
						icon={<X size={iconSize.sm} />}
						aria-label={clearLabel}
						onClick={(e) => {
							// 지우면 이 버튼이 사라져 포커스가 body 로 떨어진다 - 연도 칸으로 돌린다
							const first =
								e.currentTarget.parentElement?.querySelector<HTMLButtonElement>("button");
							onClear();
							first?.focus();
						}}
					/>
				)}
			</div>
		</div>
	);
};

interface CalendarFieldProps {
	rootClassName: string;
	label: string | undefined;
	labelId: string | undefined;
	describedBy: string | undefined;
	invalid: boolean | undefined;
	inputId: string | undefined;
	groupId: string;
	constraintId: string;
	constraintDesc: string;
	disabled: boolean | undefined;
	selected: CalendarDate | null;
	today: CalendarDate;
	isSelectable: (date: CalendarDate) => boolean;
	minMonth: { year: number; month: number };
	maxMonth: { year: number; month: number };
	intlLocale: string;
	placeholder: string;
	dialogLabel: string;
	prevLabel: string;
	nextLabel: string;
	onSelect: (date: CalendarDate) => void;
	/** 지우기 - 지울 값이 있을 때만 준다 */
	onClear: (() => void) | undefined;
	clearLabel: string;
}

/**
 * `variant="calendar"` - 날짜 칸 하나 + 월 달력 팝오버. 칸은 Dropdown 트리거와 같은 높이 · 테두리라
 * 옆에 TimePicker · Dropdown 을 나란히 둬도 줄이 맞는다.
 *
 * 칸에는 요일까지 보인다("2026. 10. 12. (월)") - 일정은 "다음 주 화요일" 처럼 요일로 생각하는데,
 * 드롭다운 3개에서는 요일을 따로 계산해야 했다.
 */
const CalendarField = ({
	rootClassName,
	label,
	labelId,
	describedBy,
	invalid,
	inputId,
	groupId,
	constraintId,
	constraintDesc,
	disabled,
	selected,
	today,
	isSelectable,
	minMonth,
	maxMonth,
	intlLocale,
	placeholder,
	dialogLabel,
	prevLabel,
	nextLabel,
	onSelect,
	onClear,
	clearLabel,
}: CalendarFieldProps) => {
	const [open, setOpen] = React.useState(false);
	const valueId = React.useId();
	const valueText = React.useMemo(() => {
		if (!selected) return null;
		const options: Intl.DateTimeFormatOptions = intlLocale.startsWith("ko")
			? { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }
			: { year: "numeric", month: "short", day: "numeric", weekday: "short" };
		return new Intl.DateTimeFormat(intlLocale, options).format(
			new Date(selected.year, selected.month - 1, selected.day),
		);
	}, [selected, intlLocale]);

	return (
		<div className={cn(rootClassName, "date_picker_calendar")}>
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
			<div className={cn("date_picker_field", onClear && "date_picker_field_clearable")}>
				<Popover
					open={open && !disabled}
					onOpenChange={setOpen}
					placement="bottom"
					aria-label={dialogLabel}
					className="date_picker_popover"
					trigger={
						<button
							type="button"
							// Field 의 `<label for>` 가 이 칸을 가리킨다 - 칸이 하나뿐이라 드롭다운 3개 때의
							// id 충돌(#629)이 없다.
							id={inputId}
							className="date_picker_trigger"
							disabled={disabled}
							// 이름 = 라벨 + 지금 값. 값만 읽히면 무엇의 날짜인지 모른다.
							aria-labelledby={[labelId, valueId].filter(Boolean).join(" ")}
							aria-describedby={describedBy}
							aria-invalid={invalid || undefined}
							onKeyDown={(e) => {
								// 수정 키와 함께면 브라우저 · 보조기술 단축키라 건드리지 않는다
								const modified = e.ctrlKey || e.metaKey || e.altKey;
								if (onClear && !modified && (e.key === "Delete" || e.key === "Backspace")) {
									e.preventDefault();
									onClear();
								}
							}}
						>
							<Calendar
								size={iconSize.md}
								aria-hidden="true"
								className="date_picker_trigger_icon"
							/>
							<span
								id={valueId}
								className={
									valueText ? "date_picker_trigger_value" : "date_picker_trigger_placeholder"
								}
							>
								{valueText ?? placeholder}
							</span>
						</button>
					}
					content={
						<DateCalendar
							value={selected ? toIso(selected) : null}
							today={toIso(today)}
							// 넘김 범위는 달 단위 - 그 안의 날별 판정은 isDateDisabled 가 맡는다
							min={toIso({ ...minMonth, day: 1 })}
							max={toIso({
								...maxMonth,
								day: new Date(maxMonth.year, maxMonth.month, 0).getDate(),
							})}
							isDateDisabled={(iso) => !isSelectable(fromIso(iso))}
							prevMonthLabel={prevLabel}
							nextMonthLabel={nextLabel}
							onValueChange={(iso) => {
								onSelect(fromIso(iso));
								setOpen(false);
							}}
						/>
					}
				/>
				{onClear && (
					// 칸 안에 둘 수 없어(버튼 안 버튼) 칸 오른쪽에 겹친다. 지운 뒤 포커스는 칸으로 - 이 버튼은 사라진다
					<IconButton
						className="date_picker_clear"
						size="sm"
						icon={<X size={iconSize.sm} />}
						aria-label={clearLabel}
						onClick={(e) => {
							const trigger =
								e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
									".date_picker_trigger",
								);
							setOpen(false);
							onClear();
							trigger?.focus();
						}}
					/>
				)}
			</div>
		</div>
	);
};
