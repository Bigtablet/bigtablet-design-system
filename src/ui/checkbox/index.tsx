"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface CheckboxProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	/** 체크박스 옆에 표시할 라벨 */
	label?: React.ReactNode;
	/** 중간 선택(indeterminate) 상태 여부 */
	indeterminate?: boolean;
	/** 에러 상태 여부 */
	error?: boolean;
	/** 입력 요소 참조 */
	ref?: React.Ref<HTMLInputElement>;
}

/**
 * 체크박스를 렌더링한다.
 * Figma DS 기준 3가지 타입(Unselected/Checked/Indeterminate)과 state layer overlay를 지원한다.
 * @param props 체크박스 속성
 * @returns 렌더링된 체크박스 UI
 */
export const Checkbox = ({
	label,
	indeterminate,
	error,
	className,
	ref,
	...props
}: CheckboxProps) => {
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useImperativeHandle(
		ref as React.Ref<HTMLInputElement>,
		() => inputRef.current!,
	);

	React.useEffect(() => {
		if (!inputRef.current) return;
		inputRef.current.indeterminate = Boolean(indeterminate);
	}, [indeterminate]);

	const rootClassName = cn(
		"checkbox",
		error && "checkbox_error",
		className,
	);

	return (
		<label className={rootClassName}>
			<input
				ref={inputRef}
				type="checkbox"
				className="checkbox_input"
				{...props}
			/>
			<span className="checkbox_state_layer" aria-hidden="true">
				<span className="checkbox_icon" />
			</span>
			{label ? <span className="checkbox_label">{label}</span> : null}
		</label>
	);
};

Checkbox.displayName = "Checkbox";
