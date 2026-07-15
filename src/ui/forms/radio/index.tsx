"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import { useRadioGroupContext } from "../radio-group";
import "./style.scss";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	/** 라디오 버튼 옆에 표시할 라벨 */
	label?: React.ReactNode;
	/** 라디오 버튼 크기 (기본값: "md"). `RadioGroup` 안에서는 그룹 size 가 기본값. */
	size?: "sm" | "md" | "lg";
	/** 입력 요소 참조 */
	ref?: React.Ref<HTMLInputElement>;
}

/**
 * 라디오 버튼을 렌더링한다.
 * `RadioGroup` 안에서는 그룹 컨텍스트(name/value/size/disabled)를 자동 수신하고,
 * 밖에서는 native radio 로 standalone 동작한다 (기존 동작 유지).
 * @param props 라디오 속성
 * @returns 렌더링된 라디오 UI
 */
export const Radio = ({
	label,
	size: sizeProp,
	className,
	ref,
	value,
	checked,
	onChange,
	name: nameProp,
	disabled: disabledProp,
	...props
}: RadioProps) => {
	const group = useRadioGroupContext();

	// 그룹 컨텍스트가 있으면 그룹 값으로 해소, 없으면 개별 prop 으로 standalone.
	const size = sizeProp ?? group?.size ?? "md";
	const name = nameProp ?? group?.name;
	const disabled = disabledProp ?? group?.disabled;
	// value 없는 Radio 가 그룹 미선택 상태(group.value === undefined)에서
	// undefined === undefined 로 전부 checked 렌더되지 않도록 value 존재를 먼저 확인.
	const resolvedChecked = group ? value !== undefined && group.value === value : checked;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (group && value !== undefined) group.onChange(String(value));
		onChange?.(event);
	};

	const rootClassName = cn("radio", `radio_size_${size}`, disabled && "radio_disabled", className);

	return (
		<label className={rootClassName}>
			<input
				ref={ref}
				type="radio"
				className="radio_input"
				value={value}
				name={name}
				disabled={disabled}
				checked={resolvedChecked}
				onChange={handleChange}
				{...props}
			/>
			<span className="radio_state_layer" aria-hidden="true">
				<span className="radio_dot" />
			</span>
			{label ? <span className="radio_label">{label}</span> : null}
		</label>
	);
};

Radio.displayName = "Radio";
