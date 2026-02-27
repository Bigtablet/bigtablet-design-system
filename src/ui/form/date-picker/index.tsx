"use client";

import { cn } from "../../../utils";
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
}

/**
 * 숫자를 두 자리 문자열로 보정한다.
 * @param n 숫자
 * @returns 두 자리 문자열
 */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 해당 연/월의 일 수를 구한다.
 * @param year 연도
 * @param month 월(1-12)
 * @returns 일 수
 */
const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

/**
 * 너비 값을 CSS 문자열로 정규화한다.
 * @param v 너비 값
 * @returns CSS 너비 문자열 또는 undefined
 */
const normalizeWidth = (v?: number | string) =>
    typeof v === "number" ? `${v}px` : v;

/**
 * 연/월/일 선택형 데이트 피커를 렌더링한다.
 * 입력 값과 선택 범위를 기준으로 옵션을 계산하고, 선택 변경을 상위로 전달한다.
 * @param props 데이트 피커 속성
 * @returns 렌더링된 데이트 피커 UI
 */
export const DatePicker = ({
    label,
    value,
    onChange,
    mode = "year-month-day",
    startYear = 1950,
    endYear = new Date().getFullYear() + 10,
    minDate,
    selectableRange = "all",
    disabled,
    fullWidth = true,
    width,
}: DatePickerProps) => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const [y, m, d] = value?.split("-").map(Number) ?? [];
    const [minY, minM, minD] = minDate?.split("-").map(Number) ?? [];

    const year = y ?? "";
    const month = m ?? "";
    const day = d ?? "";

    const maxYear =
        selectableRange === "until-today"
            ? todayYear
            : endYear;

    const minMonth =
        minY && year === minY ? minM : 1;

    const maxMonth =
        selectableRange === "until-today" && year === todayYear
            ? todayMonth
            : 12;

    const minDay =
        minY && minM && year === minY && month === minM
            ? minD
            : 1;

    const maxDay =
        selectableRange === "until-today" &&
        year === todayYear &&
        month === todayMonth
            ? todayDay
            : getDaysInMonth(year || todayYear, month || 1);

    const days =
        year && month
            ? Math.min(getDaysInMonth(year, month), maxDay)
            : 31;

    /**
     * 해당 연/월의 최대 일 수를 기준으로 일 값을 보정한다.
     * @param year 연도
     * @param month 월
     * @param day 일
     * @returns 보정된 일
     */
    const clampDay = (year: number, month: number, day: number) =>
        Math.min(day, getDaysInMonth(year, month));

    /**
     * 선택 값을 포맷팅해 onChange로 전달한다.
     * @param yy 연도
     * @param mm 월
     * @param dd 일
     * @returns void
     */
    const emit = (yy: number, mm: number, dd?: number) => {
        if (mode === "year-month") {
            onChange(`${yy}-${pad(mm)}`);
            return;
        }

        const safeDay = clampDay(yy, mm, dd ?? 1);

        onChange(`${yy}-${pad(mm)}-${pad(safeDay)}`);
    };

    const containerStyle = width ? { width: normalizeWidth(width) } : undefined;
    const rootClassName = cn("date_picker", { date_picker_full_width: fullWidth && !width });

    return (
        <div className={rootClassName} style={containerStyle}>
            {label && (
                <label className="date_picker_label">{label}</label>
            )}
            <div className="date_picker_fields">
                <select
                    aria-label="연도"
                    value={year}
                    disabled={disabled}
                    onChange={(e) =>
                        emit(Number(e.target.value), month || minMonth, day || minDay)
                    }
                >
                    <option value="">연도</option>
                    {Array.from(
                        {length: maxYear - startYear + 1},
                        (_, i) => startYear + i,
                    ).map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="월"
                    value={month}
                    disabled={disabled || !year}
                    onChange={(e) =>
                        emit(year, Number(e.target.value), day || minDay)
                    }
                >
                    <option value="">월</option>
                    {Array.from({length: maxMonth - minMonth + 1}, (_, i) => minMonth + i).map(
                        (m) => (
                            <option key={m} value={m}>
                                {pad(m)}
                            </option>
                        ),
                    )}
                </select>

                {mode === "year-month-day" && (
                    <select
                        aria-label="일"
                        value={day}
                        disabled={disabled || !month}
                        onChange={(e) =>
                            emit(year, month, Number(e.target.value))
                        }
                    >
                        <option value="">일</option>
                        {Array.from(
                            {length: days - minDay + 1},
                            (_, i) => minDay + i,
                        ).map((d) => (
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
