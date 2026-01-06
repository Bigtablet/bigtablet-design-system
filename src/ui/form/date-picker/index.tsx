"use client";

import "./style.scss";

type DatePickerMode = "year-month" | "year-month-day";

interface DatePickerProps {
    value?: string;
    onChange: (value: string) => void;
    mode?: DatePickerMode;
    startYear?: number;
    endYear?: number;
    disabled?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

export const DatePicker = ({
                              value,
                              onChange,
                              mode = "year-month-day",
                              startYear = 1950,
                              endYear = new Date().getFullYear() + 10,
                              disabled,
                          }: DatePickerProps) => {
    const [y, m, d] = value?.split("-").map(Number) ?? [];

    const year = y ?? "";
    const month = m ?? "";
    const day = d ?? "";

    const days =
        year && month ? getDaysInMonth(year, month) : 31;

    const emit = (yy: number, mm: number, dd?: number) => {
        const result =
            mode === "year-month"
                ? `${yy}-${pad(mm)}-01`
                : `${yy}-${pad(mm)}-${pad(dd ?? 1)}`;

        onChange(result);
    };

    return (
        <div className="date_picker">
            <select
                value={year}
                disabled={disabled}
                onChange={(e) =>
                    emit(Number(e.target.value), month || 1, day || 1)
                }
            >
                <option value="" disabled />
                {Array.from(
                    { length: endYear - startYear + 1 },
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
                    emit(year, Number(e.target.value), day || 1)
                }
            >
                <option value="" disabled />
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                        {pad(m)}
                    </option>
                ))}
            </select>

            {mode === "year-month-day" && (
                <select
                    value={day}
                    disabled={disabled || !month}
                    onChange={(e) =>
                        emit(year, month, Number(e.target.value))
                    }
                >
                    <option value="" disabled />
                    {Array.from({ length: days }, (_, i) => i + 1).map(
                        (d) => (
                            <option key={d} value={d}>
                                {pad(d)}
                            </option>
                        ),
                    )}
                </select>
            )}
        </div>
    );
};