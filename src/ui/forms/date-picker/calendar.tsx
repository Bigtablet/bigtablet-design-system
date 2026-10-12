"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";

/** 연·월·일 한 점. 월은 1부터. */
export interface CalendarDate {
	year: number;
	month: number;
	day: number;
}

interface DateCalendarProps {
	/** 지금 고른 날. 없으면 null */
	selected: CalendarDate | null;
	/** 오늘 - 테두리로 표시하고, 고른 날이 없을 때 처음 보여 줄 달의 기준 */
	today: CalendarDate;
	/** 고를 수 있는 날인지. 목록과 emit 이 같은 계산을 쓰도록 DatePicker 의 판정을 그대로 받는다 */
	isSelectable: (date: CalendarDate) => boolean;
	/** 이전·다음 달로 넘길 수 있는 끝 - 이 달 밖으로는 넘어가지 않는다 */
	minMonth: { year: number; month: number };
	maxMonth: { year: number; month: number };
	/** Intl 포맷용 로캘 (예: "ko-KR") */
	intlLocale: string;
	prevLabel: string;
	nextLabel: string;
	onSelect: (date: CalendarDate) => void;
}

/** 일요일 시작 7칸. 한국 · 미국 달력이 모두 일요일부터 쓴다. */
const WEEK = [0, 1, 2, 3, 4, 5, 6];
/** 줄 수를 6으로 고정한다 - 달마다 5 · 6줄로 바뀌면 넘길 때 팝오버 높이가 출렁인다. */
const ROWS = 6;

const toDate = ({ year, month, day }: CalendarDate) => new Date(year, month - 1, day);
const fromDate = (d: Date): CalendarDate => ({
	year: d.getFullYear(),
	month: d.getMonth() + 1,
	day: d.getDate(),
});
const sameDay = (a: CalendarDate | null, b: CalendarDate | null) =>
	!!a && !!b && a.year === b.year && a.month === b.month && a.day === b.day;
const monthIndex = (y: number, m: number) => y * 12 + (m - 1);
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

/** 날짜를 n일 옮긴다. Date 로 계산해 월 · 연 넘김을 맡긴다. */
const addDays = (date: CalendarDate, n: number) => {
	const d = toDate(date);
	d.setDate(d.getDate() + n);
	return fromDate(d);
};

/** 날짜를 n달 옮긴다. 31일 → 2월처럼 그 달에 없는 날은 그 달 마지막 날로 붙인다. */
const addMonths = (date: CalendarDate, n: number): CalendarDate => {
	const idx = monthIndex(date.year, date.month) + n;
	const year = Math.floor(idx / 12);
	const month = (idx % 12) + 1;
	return { year, month, day: Math.min(date.day, daysIn(year, month)) };
};

/**
 * DatePicker `variant="calendar"` 의 월 달력. 팝오버 안에서만 쓰는 내부 컴포넌트다.
 *
 * WAI-ARIA APG "Date Picker Dialog" 의 키보드 규칙을 따른다 - ←→ 하루, ↑↓ 한 주, Home/End 주의
 * 처음 · 끝, PageUp/PageDown 한 달(Shift 와 함께면 한 해), Enter/Space 선택. 포커스는 한 칸만
 * 받는다(roving tabindex) - Tab 한 번에 달력을 빠져나가야 한다.
 */
export const DateCalendar = ({
	selected,
	today,
	isSelectable,
	minMonth,
	maxMonth,
	intlLocale,
	prevLabel,
	nextLabel,
	onSelect,
}: DateCalendarProps) => {
	const minIdx = monthIndex(minMonth.year, minMonth.month);
	const maxIdx = monthIndex(maxMonth.year, maxMonth.month);
	const clampToRange = React.useCallback(
		(date: CalendarDate): CalendarDate => {
			const idx = monthIndex(date.year, date.month);
			if (idx < minIdx) return { ...minMonth, day: 1 };
			if (idx > maxIdx) return { ...maxMonth, day: daysIn(maxMonth.year, maxMonth.month) };
			return date;
		},
		[minIdx, maxIdx, minMonth, maxMonth],
	);

	// 처음 포커스는 고른 날, 없으면 오늘 - 둘 다 범위 밖이면 범위 끝으로 붙인다.
	const [focused, setFocused] = React.useState<CalendarDate>(() => clampToRange(selected ?? today));
	const view = { year: focused.year, month: focused.month };
	const viewIdx = monthIndex(view.year, view.month);

	const gridRef = React.useRef<HTMLTableElement>(null);
	// 키보드로 옮겼을 때만 포커스를 따라간다. 마우스로 달을 넘겼는데 포커스가 달력 칸으로 튀면
	// 방금 누른 넘김 버튼에서 포커스가 사라진다.
	const moveFocusRef = React.useRef(false);
	React.useEffect(() => {
		if (!moveFocusRef.current) return;
		moveFocusRef.current = false;
		gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
	});

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

	// 2026-10-04 은 일요일 - 요일 머리글을 만들 기준 주.
	const weekdays = WEEK.map((i) => {
		const d = new Date(2026, 9, 4 + i);
		return { short: fmt.weekdayShort.format(d), long: fmt.weekdayLong.format(d) };
	});

	const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
	const total = daysIn(view.year, view.month);
	const cells: (CalendarDate | null)[] = Array.from({ length: ROWS * 7 }, (_, i) => {
		const day = i - firstWeekday + 1;
		return day >= 1 && day <= total ? { ...view, day } : null;
	});

	const moveTo = (next: CalendarDate) => {
		moveFocusRef.current = true;
		setFocused(clampToRange(next));
	};

	const goMonth = (n: number) => setFocused((f) => clampToRange(addMonths(f, n)));

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const weekday = toDate(focused).getDay();
		const moves: Record<string, () => CalendarDate> = {
			ArrowLeft: () => addDays(focused, -1),
			ArrowRight: () => addDays(focused, 1),
			ArrowUp: () => addDays(focused, -7),
			ArrowDown: () => addDays(focused, 7),
			Home: () => addDays(focused, -weekday),
			End: () => addDays(focused, 6 - weekday),
			PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
			PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
		};
		const move = moves[e.key];
		if (!move) return;
		e.preventDefault();
		moveTo(move());
	};

	return (
		<div className="date_calendar">
			<div className="date_calendar_header">
				{/* 넘김 버튼은 처음 포커스를 받지 않는다 - 팝오버가 열리면 고른 날(또는 오늘)에 앉아야
				    방향키로 바로 움직인다. 포커스 트랩이 이 표시를 보고 건너뛴다. */}
				<button
					type="button"
					className="date_calendar_nav"
					aria-label={prevLabel}
					onClick={() => goMonth(-1)}
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
					onClick={() => goMonth(1)}
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
								const selectable = isSelectable(cell);
								const isSelected = sameDay(cell, selected);
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
												date_calendar_day_today: sameDay(cell, today),
											})}
											tabIndex={sameDay(cell, focused) ? 0 : -1}
											// 포커스 트랩은 `tabindex="-1"` 버튼도 후보로 세서, 표시가 없으면 열자마자 1일에
											// 앉았다(브라우저 실측). 포커스 받을 한 칸만 남기고 나머지는 건너뛰게 한다.
											data-focus-trap-skip-autofocus={sameDay(cell, focused) ? undefined : ""}
											aria-label={fmt.full.format(toDate(cell))}
											aria-current={sameDay(cell, today) ? "date" : undefined}
											aria-disabled={selectable ? undefined : true}
											onClick={() => {
												setFocused(cell);
												if (selectable) onSelect(cell);
											}}
											onKeyDown={handleKeyDown}
										>
											{cell.day}
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
