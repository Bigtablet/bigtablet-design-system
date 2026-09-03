"use client";

import * as React from "react";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import { Dropdown, type DropdownOption } from "../dropdown";
import { useFieldControl } from "../field";
import "./style.scss";

export interface TimePickerProps {
	/** 위에 표시할 라벨 */
	label?: string;
	/** 제어형 값 (`"HH:mm"`) */
	value?: string;
	/** 선택 변경 */
	onValueChange: (value: string) => void;
	/** 분 간격 (기본값: 5). 5·10·15·30 처럼 60 의 약수를 준다 */
	minuteStep?: number;
	/** 선택 가능한 가장 이른 시각 (`"HH:mm"`) */
	minTime?: string;
	/** 선택 가능한 가장 늦은 시각 (`"HH:mm"`) */
	maxTime?: string;
	/** 비활성 여부 */
	disabled?: boolean;
	/** 전체 너비 차지 (기본값: true) */
	fullWidth?: boolean;
	/** 시 select 의 라벨/placeholder */
	hourLabel?: string;
	/** 분 select 의 라벨/placeholder */
	minuteLabel?: string;
}

/** `"HH:mm"` 을 분 단위 정수로. 형식이 아니면 null */
const toMinutes = (value: string | undefined) => {
	if (!value) return null;
	const [h, m] = value.split(":").map(Number);
	if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
	if (h < 0 || h > 23 || m < 0 || m > 59) return null;
	return h * 60 + m;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 시·분 선택. `DatePicker` 와 같은 방식으로 DS `Dropdown` 두 개를 조합한다.
 *
 * 손으로 만들면 갈리는 것들을 여기서 소유한다.
 *
 * - **분 간격** — 예약·근무 시간은 5분·30분 단위인데 60개 옵션을 다 그리면 고르기 어렵다
 * - **영업시간 밖 차단** — `minTime`/`maxTime` 이 시 목록까지 좁힌다. 분만 걸러 두면 09:00 이
 *   최소인데 08시를 고를 수 있고, 그때 분 목록이 비어 막힌 화면이 된다
 * - **경계에서의 분 목록** — 최소가 09:30 이면 09시의 분은 30분부터 시작한다
 *
 * 값은 24시간 `"HH:mm"` 이다 - 12시간 표기는 화면 표시의 문제라 소비자가 포맷한다.
 *
 * @example
 * ```tsx
 * <Field name="pickupAt" label="픽업 시각">
 *   <TimePicker value={time} onValueChange={setTime} minuteStep={30} minTime="09:00" maxTime="21:00" />
 * </Field>
 * ```
 */
export const TimePicker = ({
	label,
	value,
	onValueChange,
	minuteStep = 5,
	minTime,
	maxTime,
	disabled,
	fullWidth = true,
	hourLabel: hourLabelProp,
	minuteLabel: minuteLabelProp,
}: TimePickerProps) => {
	const t = useLocaleText();
	const hourLabel = hourLabelProp ?? t("timePicker.hour");
	const minuteLabel = minuteLabelProp ?? t("timePicker.minute");

	// Field 가 감싸면 Field 라벨이 그룹 이름이 된다.
	const field = useFieldControl();
	const groupId = React.useId();
	const constraintId = React.useId();

	const min = toMinutes(minTime) ?? 0;
	const max = toMinutes(maxTime) ?? 23 * 60 + 59;

	const parsed = toMinutes(value);
	const hour = parsed === null ? null : Math.floor(parsed / 60);
	const minute = parsed === null ? null : parsed % 60;

	const hourOptions = React.useMemo<DropdownOption[]>(() => {
		const first = Math.floor(min / 60);
		const last = Math.floor(max / 60);
		return Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => {
			const h = first + i;
			return { value: String(h), label: pad(h) };
		});
	}, [min, max]);

	const minuteOptions = React.useMemo<DropdownOption[]>(() => {
		if (hour === null) return [];
		const step = Math.max(1, Math.floor(minuteStep));
		return (
			Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step)
				.filter((m) => m < 60)
				// 경계 시각에서는 분도 좁힌다 - 최소가 09:30 이면 09시의 분은 30분부터다.
				.filter((m) => hour * 60 + m >= min && hour * 60 + m <= max)
				.map((m) => ({ value: String(m), label: pad(m) }))
		);
	}, [hour, minuteStep, min, max]);

	const emit = (h: number, m: number) => onValueChange(`${pad(h)}:${pad(m)}`);

	const handleHourChange = (raw: string | null) => {
		if (!raw) return;
		const h = Number(raw);
		// 시를 바꾸면 지금 분이 범위 밖일 수 있다 (09:00~ 에서 09시로 옮기면 00분은 밖).
		const step = Math.max(1, Math.floor(minuteStep));
		const candidates = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step).filter(
			(m) => m < 60 && h * 60 + m >= min && h * 60 + m <= max,
		);
		if (candidates.length === 0) return;
		const keep = minute !== null && candidates.includes(minute) ? minute : candidates[0];
		emit(h, keep);
	};

	const handleMinuteChange = (raw: string | null) => {
		if (!raw || hour === null) return;
		emit(hour, Number(raw));
	};

	const constraint =
		minTime || maxTime
			? t("timePicker.rangeSr", { min: minTime ?? "00:00", max: maxTime ?? "23:59" })
			: "";

	return (
		<div
			className={cn("time_picker", {
				time_picker_full_width: fullWidth,
				time_picker_disabled: disabled,
			})}
		>
			{label && (
				<span className="time_picker_label" id={groupId}>
					{label}
				</span>
			)}
			{constraint && (
				<span id={constraintId} className="time_picker_sr_only">
					{constraint}
				</span>
			)}
			{/* biome-ignore lint/a11y/useSemanticElements: DatePicker 와 같은 이유 - fieldset/legend 는 부모의 라벨 규약과 충돌한다. role=group 이 그 등가물이다 */}
			<div
				className="time_picker_fields"
				role="group"
				aria-labelledby={field?.labelId ?? (label ? groupId : undefined)}
				aria-describedby={
					[field?.describedBy, constraint ? constraintId : undefined].filter(Boolean).join(" ") ||
					undefined
				}
				aria-invalid={field?.invalid || undefined}
			>
				<Dropdown
					size="sm"
					fullWidth
					label={hourLabel}
					placeholder={hourLabel}
					options={hourOptions}
					value={hour === null ? null : String(hour)}
					onValueChange={handleHourChange}
					disabled={disabled}
				/>
				<Dropdown
					size="sm"
					fullWidth
					label={minuteLabel}
					placeholder={minuteLabel}
					options={minuteOptions}
					value={minute === null ? null : String(minute)}
					onValueChange={handleMinuteChange}
					disabled={disabled || hour === null}
				/>
			</div>
		</div>
	);
};
