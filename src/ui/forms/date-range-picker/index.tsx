"use client";

import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import { DatePicker } from "../date-picker";
import { useFieldControl } from "../field";
import "./style.scss";

export interface DateRange {
	/** 시작일 (`"YYYY-MM-DD"`). 아직 고르지 않았으면 undefined */
	start?: string;
	/** 종료일 (`"YYYY-MM-DD"`). 아직 고르지 않았으면 undefined */
	end?: string;
}

export interface DateRangePickerProps {
	/** 제어형 값 */
	value?: DateRange;
	/** 범위 변경. 시작일이 종료일을 넘어서면 종료일이 비워진 값이 온다 */
	onValueChange: (value: DateRange) => void;
	/** 시작일 select 묶음의 라벨 */
	startLabel?: string;
	/** 종료일 select 묶음의 라벨 */
	endLabel?: string;
	/** 연도 선택 범위 시작 (기본값: 1950) */
	startYear?: number;
	/** 연도 선택 범위 끝. 미지정 시 현재 연도 + 10 */
	endYear?: number;
	/** 선택 가능한 가장 이른 날짜 (`"YYYY-MM-DD"`) */
	minDate?: string;
	/** `"until-today"` 면 오늘 이후를 고를 수 없다 (기본값: "all") */
	selectableRange?: "all" | "until-today";
	/** 비활성 여부 */
	disabled?: boolean;
	/** 전체 너비 차지 (기본값: true) */
	fullWidth?: boolean;
}

/**
 * 시작일·종료일 한 쌍. `DatePicker` 둘을 묶는다.
 *
 * **거꾸로 된 범위를 만들 수 없다.** 종료일의 최소값이 시작일이라 애초에 이전 날짜가 목록에
 * 없고, 시작일을 종료일보다 뒤로 옮기면 종료일이 비워진다. 손으로 두 개를 나란히 두면 이
 * 검증을 화면마다 다시 쓰고, 대개 "조회" 버튼을 누른 뒤 서버 오류로 알게 된다.
 *
 * 종료일을 조용히 시작일로 맞추지 않고 **비운다** - 사용자가 고르지 않은 날짜를 고른 것처럼
 * 만들면 그대로 조회·저장된다.
 *
 * @example
 * ```tsx
 * <Field name="period" label="조회 기간">
 *   <DateRangePicker value={period} onValueChange={setPeriod} selectableRange="until-today" />
 * </Field>
 * ```
 */
export const DateRangePicker = ({
	value,
	onValueChange,
	startLabel: startLabelProp,
	endLabel: endLabelProp,
	startYear,
	endYear,
	minDate,
	selectableRange = "all",
	disabled,
	fullWidth = true,
}: DateRangePickerProps) => {
	const t = useLocaleText();
	const startLabel = startLabelProp ?? t("dateRange.start");
	const endLabel = endLabelProp ?? t("dateRange.end");

	const field = useFieldControl();

	const start = value?.start;
	const end = value?.end;

	const handleStartChange = (next: string) => {
		// 시작일이 종료일을 넘어서면 종료일을 비운다. 시작일로 맞춰 버리면 사용자가 고르지
		// 않은 날짜가 그대로 조회·저장된다.
		onValueChange({ start: next, end: end && end < next ? undefined : end });
	};

	const handleEndChange = (next: string) => {
		onValueChange({ start, end: next });
	};

	// 종료일의 최소값은 시작일이다 - 이전 날짜는 목록에 아예 없다.
	const endMinDate = start ?? minDate;

	return (
		<div
			className={cn("date_range_picker", {
				date_range_picker_full_width: fullWidth,
				date_range_picker_disabled: disabled,
			})}
		>
			{/* biome-ignore lint/a11y/useSemanticElements: DatePicker 와 같은 이유 - fieldset/legend 는 부모의 라벨 규약과 충돌한다 */}
			<div
				className="date_range_picker_fields"
				role="group"
				// Field 밖에서는 이름을 붙이지 않는다. 없는 id 를 가리키면 보조기술이 존재하지
				// 않는 요소를 참조한다 - 안쪽 DatePicker 두 개가 각자 라벨을 갖고 있다.
				aria-labelledby={field?.labelId}
				aria-describedby={field?.describedBy}
				aria-invalid={field?.invalid || undefined}
			>
				<DatePicker
					label={startLabel}
					value={start}
					onValueChange={handleStartChange}
					startYear={startYear}
					endYear={endYear}
					minDate={minDate}
					selectableRange={selectableRange}
					disabled={disabled}
					fullWidth
				/>
				<DatePicker
					label={endLabel}
					value={end}
					onValueChange={handleEndChange}
					startYear={startYear}
					endYear={endYear}
					minDate={endMinDate}
					selectableRange={selectableRange}
					// 시작일을 고르기 전에는 종료일을 열지 않는다 - 순서가 뒤집힌 입력을 막는다.
					disabled={disabled || !start}
					fullWidth
				/>
			</div>
		</div>
	);
};
