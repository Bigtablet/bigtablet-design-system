"use client";

import "./style.scss";

type DatePickerMode = "year-month" | "year-month-day";

interface DatePickerProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    mode?: DatePickerMode;
    startYear?: number;
    endYear?: number;
    minDate?: string;
    disabled?: boolean;
    width?: {
        container?: number | string;
        year?: number | string;
        month?: number | string;
        day?: number | string;
    };
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
                               disabled,
                               width,
                           }: DatePickerProps) => {
    const [y, m, d] = value?.split("-").map(Number) ?? [];
    const [minY, minM, minD] = minDate?.split("-").map(Number) ?? [];

    const year = y ?? "";
    const month = m ?? "";
    const day = d ?? "";

    const minMonth =
        minY && year === minY ? minM : 1;

    const minDay =
        minY && minM && year === minY && month === minM
            ? minD
            : 1;

    const days =
        year && month
            ? getDaysInMonth(year, month)
            : 31;

    const clampDay = (year: number, month: number, day: number) => {
        const maxDay = getDaysInMonth(year, month);
        return Math.min(day, maxDay);
    };

    const emit = (yy: number, mm: number, dd?: number) => {
        if (mode === "year-month") {
            onChange(`${yy}-${pad(mm)}`);
            return;
        }

        const safeDay = clampDay(yy, mm, dd ?? 1);

        onChange(`${yy}-${pad(mm)}-${pad(safeDay)}`);
    };

    return (
        <div className="date_picker" style={{width: normalizeWidth(width?.container)}}>
            {label && (
                <label className="date_picker_label">{label}</label>
            )}
            <select
                style={{width: normalizeWidth(width?.year)}}
                value={year}
                disabled={disabled}
                onChange={(e) =>
                    emit(Number(e.target.value), month || minMonth, day || minDay)
                }
            >
                <option value="" disabled/>
                {Array.from(
                    {length: endYear - startYear + 1},
                    (_, i) => startYear + i,
                ).map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>

            <select
                style={{width: normalizeWidth(width?.month)}}
                value={month}
                disabled={disabled || !year}
                onChange={(e) =>
                    emit(year, Number(e.target.value), day || minDay)
                }
            >
                <option value="" disabled/>
                {Array.from({length: 12 - minMonth + 1}, (_, i) => minMonth + i).map(
                    (m) => (
                        <option key={m} value={m}>
                            {pad(m)}
                        </option>
                    ),
                )}
            </select>

            {mode === "year-month-day" && (
                <select
                    style={{width: normalizeWidth(width?.day)}}
                    value={day}
                    disabled={disabled || !month}
                    onChange={(e) =>
                        emit(year, month, Number(e.target.value))
                    }
                >
                    <option value="" disabled/>
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
    );
};