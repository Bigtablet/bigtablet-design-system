"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn, type SafeHTMLProps } from "../../../utils";
import { useLocaleName, useLocaleText } from "../../system/locale-provider";
import "./style.scss";

/** 요일 번호 - 0 일요일 … 6 토요일 (`Date#getDay` 와 같다) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateCalendarDayInfo {
	selected: boolean;
	today: boolean;
	disabled: boolean;
}

export interface DateCalendarProps
	extends Omit<SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>>, "onChange" | "defaultValue"> {
	/** 제어형: 고른 날 `"YYYY-MM-DD"`. 없으면 null */
	value?: string | null;
	/** 비제어형: 처음 고른 날 */
	defaultValue?: string;
	/** 날을 고를 때 `"YYYY-MM-DD"` */
	onValueChange?: (value: string) => void;
	/** 제어형: 보이는 달 `"YYYY-MM"` */
	month?: string;
	/** 비제어형: 처음 보이는 달 (기본값: 고른 날 → 오늘의 달) */
	defaultMonth?: string;
	/** 보이는 달이 바뀔 때 `"YYYY-MM"` (넘김 버튼 · PageUp/Down · 방향키로 달을 넘을 때) */
	onMonthChange?: (month: string) => void;
	/** 고를 수 있는 첫날 `"YYYY-MM-DD"` - 그 앞 달로는 넘어가지 않는다 */
	min?: string;
	/** 고를 수 있는 마지막 날 `"YYYY-MM-DD"` */
	max?: string;
	/** 그 밖에 고를 수 없는 날 (휴일 · 마감) */
	isDateDisabled?: (date: string) => boolean;
	/** 오늘 `"YYYY-MM-DD"` (기본값: 기기의 오늘). 서버 기준 날짜를 쓰려면 넘긴다 */
	today?: string;
	/** 주의 첫 요일 (기본값: 0 일요일) */
	weekStartsOn?: Weekday;
	/** 날짜 칸 장식 (일정 점 · 배지). 숫자 아래에 그려지고 보조기기에는 숨겨진다 - 뜻은 `describeDay` 로 */
	renderDay?: (date: string, info: DateCalendarDayInfo) => React.ReactNode;
	/** 날짜 이름 뒤에 붙일 설명 ("일정 2개") - 장식의 뜻을 스크린리더에 전한다 */
	describeDay?: (date: string) => string | undefined;
	/** 이전 달 버튼 이름 (기본값: 로케일 `datePicker.prevMonth`) */
	prevMonthLabel?: string;
	/** 다음 달 버튼 이름 (기본값: 로케일 `datePicker.nextMonth`) */
	nextMonthLabel?: string;
}

/** 내부 표현 - 연·월·일, 월은 1부터 */
interface Ymd {
	year: number;
	month: number;
	day: number;
}

/** 줄 수를 6으로 고정한다 - 달마다 5 · 6줄로 바뀌면 넘길 때 높이가 출렁인다. */
const ROWS = 6;

const pad = (n: number) => String(n).padStart(2, "0");
const format = ({ year, month, day }: Ymd) => `${year}-${pad(month)}-${pad(day)}`;
const formatMonth = ({ year, month }: Pick<Ymd, "year" | "month">) => `${year}-${pad(month)}`;
/** `"YYYY-MM-DD"` 또는 `"YYYY-MM"` - 형식이 틀리면 null. Date 파싱(UTC 해석)을 거치지 않는다 */
const parse = (value: string | null | undefined): Ymd | null => {
	const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value ?? "");
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = m[3] ? Number(m[3]) : 1;
	if (month < 1 || month > 12 || day < 1 || day > daysIn(year, month)) return null;
	return { year, month, day };
};

const toDate = ({ year, month, day }: Ymd) => new Date(year, month - 1, day);
const fromDate = (d: Date): Ymd => ({
	year: d.getFullYear(),
	month: d.getMonth() + 1,
	day: d.getDate(),
});
const sameDay = (a: Ymd | null, b: Ymd | null) =>
	!!a && !!b && a.year === b.year && a.month === b.month && a.day === b.day;
const compare = (a: Ymd, b: Ymd) => a.year - b.year || a.month - b.month || a.day - b.day;
const monthIndex = (y: number, m: number) => y * 12 + (m - 1);
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

/** 날짜를 n일 옮긴다. Date 로 계산해 월 · 연 넘김을 맡긴다. */
const addDays = (date: Ymd, n: number) => {
	const d = toDate(date);
	d.setDate(d.getDate() + n);
	return fromDate(d);
};

/** 날짜를 n달 옮긴다. 31일 → 2월처럼 그 달에 없는 날은 그 달 마지막 날로 붙인다. */
const addMonths = (date: Ymd, n: number): Ymd => {
	const idx = monthIndex(date.year, date.month) + n;
	const year = Math.floor(idx / 12);
	const month = (idx % 12) + 1;
	return { year, month, day: Math.min(date.day, daysIn(year, month)) };
};

/**
 * 월 달력 - 날짜 하나를 고른다. `DatePicker variant="calendar"` 의 팝오버도 이 컴포넌트다.
 *
 * 값은 **`"YYYY-MM-DD"` 문자열**이다 - 시간대가 없어 `new Date("2026-10-16")`(UTC 자정 해석)로
 * 하루 밀리는 버그가 생기지 않는다. Date 가 필요하면 앱에서 `new Date(y, m - 1, d)` 로 만든다.
 *
 * WAI-ARIA APG "Date Picker Dialog" 의 키보드 규칙을 따른다 - ←→ 하루, ↑↓ 한 주, Home/End 주의
 * 처음 · 끝, PageUp/PageDown 한 달(Shift 와 함께면 한 해), Enter/Space 선택. 포커스는 한 칸만
 * 받는다(roving tabindex) - Tab 한 번에 달력을 빠져나간다.
 */
export const DateCalendar = ({
	value: valueProp,
	defaultValue,
	onValueChange,
	month: monthProp,
	defaultMonth,
	onMonthChange,
	min: minProp,
	max: maxProp,
	isDateDisabled,
	today: todayProp,
	weekStartsOn = 0,
	renderDay,
	describeDay,
	prevMonthLabel,
	nextMonthLabel,
	className,
	...props
}: DateCalendarProps) => {
	const t = useLocaleText();
	const intlLocale = useLocaleName() === "en" ? "en-US" : "ko-KR";
	const prevLabel = prevMonthLabel ?? t("datePicker.prevMonth");
	const nextLabel = nextMonthLabel ?? t("datePicker.nextMonth");

	const isControlled = valueProp !== undefined;
	const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
	const selected = parse(isControlled ? valueProp : innerValue);
	const today = parse(todayProp) ?? fromDate(new Date());
	const min = parse(minProp);
	const max = parse(maxProp);

	const minIdx = min ? monthIndex(min.year, min.month) : Number.NEGATIVE_INFINITY;
	const maxIdx = max ? monthIndex(max.year, max.month) : Number.POSITIVE_INFINITY;
	const clampToRange = (date: Ymd): Ymd => {
		if (min && compare(date, min) < 0) return min;
		if (max && compare(date, max) > 0) return max;
		return date;
	};
	const isDisabled = (date: Ymd) =>
		(!!min && compare(date, min) < 0) ||
		(!!max && compare(date, max) > 0) ||
		!!isDateDisabled?.(format(date));

	// 포커스된 칸이 보이는 달을 정한다. 처음은 고른 날 → 오늘 → 그 달 1일 순으로, 보이는 달을
	// 주면 그 달 안에서 고른다 - 범위 밖이면 끝으로 붙인다.
	const pickInMonth = (m: Ymd): Ymd => {
		const inMonth = (d: Ymd | null) => !!d && d.year === m.year && d.month === m.month;
		if (inMonth(selected)) return selected as Ymd;
		if (inMonth(today)) return today;
		return { ...m, day: 1 };
	};
	const [focused, setFocused] = React.useState<Ymd>(() => {
		const startMonth = parse(monthProp ?? defaultMonth);
		return clampToRange(startMonth ? pickInMonth(startMonth) : (selected ?? today));
	});

	const gridRef = React.useRef<HTMLTableElement>(null);
	// 키보드로 옮겼을 때만 포커스를 따라간다. 마우스로 달을 넘겼는데 포커스가 달력 칸으로 튀면
	// 방금 누른 넘김 버튼에서 포커스가 사라진다.
	const moveFocusRef = React.useRef(false);
	React.useEffect(() => {
		if (!moveFocusRef.current) return;
		moveFocusRef.current = false;
		gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
	});

	// 제어형에서 달을 넘기려던 칸 - 부모가 month 를 바꿔 주면 그 칸에 앉는다
	const pendingRef = React.useRef<{ date: Ymd; viaKeyboard: boolean } | null>(null);
	// 제어형 month 가 바깥에서 바뀌면 그 달로 따라간다
	const controlledMonth = parse(monthProp);
	if (
		controlledMonth &&
		(controlledMonth.year !== focused.year || controlledMonth.month !== focused.month)
	) {
		const pending = pendingRef.current;
		pendingRef.current = null;
		const hit =
			pending &&
			pending.date.year === controlledMonth.year &&
			pending.date.month === controlledMonth.month;
		// 포커스는 이 경우에만 따라간다 - 부모가 거절했다 나중에 다른 이유로 렌더될 때 튀지 않게
		moveFocusRef.current = !!hit && pending.viaKeyboard;
		setFocused(clampToRange(hit ? pending.date : pickInMonth(controlledMonth)));
	}

	const view = { year: focused.year, month: focused.month };
	const viewIdx = monthIndex(view.year, view.month);

	const titleId = React.useId();
	const fmt = React.useMemo(
		() => ({
			title: new Intl.DateTimeFormat(intlLocale, { year: "numeric", month: "long" }),
			weekdayShort: new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" }),
			weekdayLong: new Intl.DateTimeFormat(intlLocale, { weekday: "long" }),
			full: new Intl.DateTimeFormat(intlLocale, { dateStyle: "full" }),
		}),
		[intlLocale],
	);

	// 2026-10-04 은 일요일 - 요일 머리글을 만들 기준 주. weekStartsOn 만큼 돌린다.
	const weekdays = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(2026, 9, 4 + ((weekStartsOn + i) % 7));
		return { short: fmt.weekdayShort.format(d), long: fmt.weekdayLong.format(d) };
	});

	const lead = (new Date(view.year, view.month - 1, 1).getDay() - weekStartsOn + 7) % 7;
	const total = daysIn(view.year, view.month);
	const cells: (Ymd | null)[] = Array.from({ length: ROWS * 7 }, (_, i) => {
		const day = i - lead + 1;
		return day >= 1 && day <= total ? { ...view, day } : null;
	});

	/** 포커스를 옮긴다. 달이 바뀌면 알린다 - 제어형이면 부모가 month 를 바꿔야 실제로 넘어간다 */
	const focusDate = (next: Ymd, viaKeyboard: boolean) => {
		const target = clampToRange(next);
		if (target.year !== focused.year || target.month !== focused.month) {
			onMonthChange?.(formatMonth(target));
			if (monthProp !== undefined) {
				// 제어형 - 달은 부모가 정한다. 바꿔 주면 그 렌더에서 이 칸에 앉고, 키보드 이동이면 포커스도
				pendingRef.current = { date: target, viaKeyboard };
				return;
			}
		}
		moveFocusRef.current = viaKeyboard;
		setFocused(target);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const offset = (toDate(focused).getDay() - weekStartsOn + 7) % 7;
		const moves: Record<string, () => Ymd> = {
			ArrowLeft: () => addDays(focused, -1),
			ArrowRight: () => addDays(focused, 1),
			ArrowUp: () => addDays(focused, -7),
			ArrowDown: () => addDays(focused, 7),
			Home: () => addDays(focused, -offset),
			End: () => addDays(focused, 6 - offset),
			PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
			PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
		};
		const move = moves[e.key];
		if (!move) return;
		e.preventDefault();
		focusDate(move(), true);
	};

	const select = (date: Ymd) => {
		const next = format(date);
		if (!isControlled) setInnerValue(next);
		onValueChange?.(next);
	};

	return (
		<div className={cn("date_calendar", className)} {...props}>
			<div className="date_calendar_header">
				{/* 넘김 버튼은 처음 포커스를 받지 않는다 - 팝오버가 열리면 고른 날(또는 오늘)에 앉아야
				    방향키로 바로 움직인다. 포커스 트랩이 이 표시를 보고 건너뛴다. */}
				<button
					type="button"
					className="date_calendar_nav"
					aria-label={prevLabel}
					onClick={() => focusDate(addMonths(focused, -1), false)}
					disabled={viewIdx <= minIdx}
					data-focus-trap-skip-autofocus=""
				>
					<ChevronLeft size={iconSize.md} aria-hidden="true" />
				</button>
				<span className="date_calendar_title" id={titleId} aria-live="polite">
					{fmt.title.format(new Date(view.year, view.month - 1, 1))}
				</span>
				<button
					type="button"
					className="date_calendar_nav"
					aria-label={nextLabel}
					onClick={() => focusDate(addMonths(focused, 1), false)}
					disabled={viewIdx >= maxIdx}
					data-focus-trap-skip-autofocus=""
				>
					<ChevronRight size={iconSize.md} aria-hidden="true" />
				</button>
			</div>
			{/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA APG "Date Picker Dialog" 의 표 구조 그대로다 - 요일 머리글(th)이 각 칸을 설명하고, grid 라서 화면낭독기가 방향키를 달력에 넘긴다 */}
			<table ref={gridRef} className="date_calendar_grid" role="grid" aria-labelledby={titleId}>
				<thead>
					<tr>
						{weekdays.map((w) => (
							<th key={w.long} scope="col" abbr={w.long} className="date_calendar_weekday">
								{w.short}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: ROWS }, (_, row) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: 줄은 위치 자체가 정체성이다(달이 바뀌어도 6줄)
						<tr key={row}>
							{cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
								if (!cell) {
									// biome-ignore lint/suspicious/noArrayIndexKey: 빈 칸은 위치 말고 구별할 값이 없다
									return <td key={`empty-${col}`} className="date_calendar_cell" />;
								}
								const disabled = isDisabled(cell);
								const isSelected = sameDay(cell, selected);
								const isToday = sameDay(cell, today);
								const iso = format(cell);
								const description = describeDay?.(iso);
								const decoration = renderDay?.(iso, {
									selected: isSelected,
									today: isToday,
									disabled,
								});
								return (
									// biome-ignore lint/a11y/useFocusableInteractive: 포커스는 칸 안 button 이 받는다 - 칸과 버튼이 둘 다 받으면 Tab 이 달력 안에서 두 번 멈춘다
									<td
										key={cell.day}
										// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: grid 의 칸이라 gridcell 이어야 aria-selected 를 실을 수 있다(button 에는 aria-selected 가 없다)
										role="gridcell"
										aria-selected={isSelected}
										className="date_calendar_cell"
									>
										{/* 고를 수 없는 날도 포커스는 지나가야 한다(방향키가 그 칸에서 멈추면 안 된다) -
										    disabled 대신 aria-disabled 로 막는다. */}
										<button
											type="button"
											className={cn("date_calendar_day", {
												date_calendar_day_selected: isSelected,
												date_calendar_day_today: isToday,
											})}
											tabIndex={sameDay(cell, focused) ? 0 : -1}
											// 포커스 트랩은 `tabindex="-1"` 버튼도 후보로 세서, 표시가 없으면 열자마자 1일에
											// 앉았다(브라우저 실측). 포커스 받을 한 칸만 남기고 나머지는 건너뛰게 한다.
											data-focus-trap-skip-autofocus={sameDay(cell, focused) ? undefined : ""}
											aria-label={[fmt.full.format(toDate(cell)), description]
												.filter(Boolean)
												.join(", ")}
											aria-current={isToday ? "date" : undefined}
											aria-disabled={disabled || undefined}
											onClick={() => {
												focusDate(cell, false);
												if (!disabled) select(cell);
											}}
											onKeyDown={handleKeyDown}
										>
											{cell.day}
											{decoration != null && (
												<span className="date_calendar_decoration" aria-hidden="true">
													{decoration}
												</span>
											)}
										</button>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

DateCalendar.displayName = "DateCalendar";
