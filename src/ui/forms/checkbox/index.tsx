"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
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
		() => inputRef.current as HTMLInputElement,
	);

	React.useEffect(() => {
		if (!inputRef.current) return;
		inputRef.current.indeterminate = Boolean(indeterminate);
	}, [indeterminate]);

	const rootClassName = cn(
		"checkbox",
		error && "checkbox_error",
		props.disabled && "checkbox_disabled",
		className,
	);

	return (
		<label className={rootClassName}>
			{/* {...props} 를 먼저 펼쳐 소비자 값은 통과시키되 type/className/aria-invalid 는
			    컴포넌트가 항상 이기도록 뒤에 배치 (Toggle 과 동일한 스프레드 순서).
			    error 는 시각 표시만으로는 AT 에 전달되지 않으므로 aria-invalid 로 노출 (WCAG 4.1.2) */}
			<input
				{...props}
				ref={inputRef}
				type="checkbox"
				className="checkbox_input"
				aria-invalid={error || undefined}
			/>
			<span className="checkbox_state_layer" aria-hidden="true">
				<span className="checkbox_icon" />
			</span>
			{label ? <span className="checkbox_label">{label}</span> : null}
		</label>
	);
};

Checkbox.displayName = "Checkbox";
