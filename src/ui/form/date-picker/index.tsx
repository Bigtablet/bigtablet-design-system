"use client";

import "./style.scss";

type DatePickerMode = "year-month" | "year-month-day";
type SelectableRange = "all" | "until-today";

interface DatePickerProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    mode?: DatePickerMode;
    startYear?: number;
    endYear?: number;
    minDate?: string;
    selectableRange?: SelectableRange;
    disabled?: boolean;
    /** Whether the date picker should take the full width of its container */
    fullWidth?: boolean;
    /**
     * Custom width for the date picker
     * @deprecated Use `fullWidth` prop or CSS instead
     */
    width?: number | string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

const normalizeWidth = (v?: number | string) =>
    typeof v === "number" ? `${v}px` : v;

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

    const clampDay = (year: number, month: number, day: number) =>
        Math.min(day, getDaysInMonth(year, month));

    const emit = (yy: number, mm: number, dd?: number) => {
        if (mode === "year-month") {
            onChange(`${yy}-${pad(mm)}`);
            return;
        }

        const safeDay = clampDay(yy, mm, dd ?? 1);

        onChange(`${yy}-${pad(mm)}-${pad(safeDay)}`);
    };

    const containerStyle = width ? { width: normalizeWidth(width) } : undefined;
    const rootClassName = [
        "date_picker",
        fullWidth && "date_picker_full_width",
    ].filter(Boolean).join(" ");

    return (
        <div className={rootClassName} style={containerStyle}>
            {label && (
                <label className="date_picker_label">{label}</label>
            )}
            <div className="date_picker_fields">
                <select
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
