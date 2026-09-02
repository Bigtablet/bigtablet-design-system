"use client";

import type * as React from "react";
import { createContext, useContext, useId } from "react";
import { cn } from "../../../utils";
import { useFormError } from "../form";
import "./style.scss";

/**
 * `Field` 가 자식 입력에게 내리는 값.
 *
 * 입력이 직접 읽지 않고 {@link useFieldControl} 을 거친다 - `Field` 밖에서는 `undefined` 라,
 * 입력은 지금까지처럼 자기 id 와 자기 `supportingText` 로 동작한다.
 */
export interface FieldControl {
	/** 입력에 붙일 id. `Field` 의 `<label htmlFor>` 이 이 값을 가리킨다 */
	inputId: string;
	/**
	 * 라벨 요소의 id. `role="group"` 컨테이너(DatePicker·OtpInput·RadioGroup)는 `htmlFor` 로
	 * 연결되지 않으므로 이 값을 `aria-labelledby` 에 쓴다. 라벨이 없으면 undefined.
	 */
	labelId: string | undefined;
	/** help·error 를 함께 가리키는 `aria-describedby` 값. 둘 다 없으면 undefined */
	describedBy: string | undefined;
	/** 에러 상태 - 입력은 `aria-invalid` 에 반영한다 */
	invalid: boolean;
	/** 필수 여부 - 입력은 `aria-required` 에 반영한다 */
	required: boolean;
}

const FieldContext = createContext<FieldControl | undefined>(undefined);

/**
 * 입력 컴포넌트가 감싸는 `Field` 를 인식하는 훅.
 *
 * `Field` 밖에서는 `undefined` 를 돌려주므로, 입력은 아래처럼 **자기 값을 기본으로 두고**
 * 필드가 있을 때만 양보하면 된다. 기존 동작이 바뀌지 않는다.
 *
 * ```tsx
 * const generatedId = useId();
 * const field = useFieldControl();
 * const inputId = id ?? field?.inputId ?? generatedId;
 * ```
 */
export function useFieldControl(): FieldControl | undefined {
	return useContext(FieldContext);
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** 필드 이름. `Form` 의 `errors[name]` 을 찾는 키이자 입력 id 의 접두사 */
	name: string;
	/** 라벨 텍스트. `Field` 가 소유하므로 자식 입력에는 `label` 을 주지 않는다 */
	label?: string;
	/** 필수 표시(*). 자식 입력에 `aria-required` 로도 전달된다 */
	required?: boolean;
	/** 입력 아래 도움말. 에러가 있으면 에러가 대신 보인다 */
	help?: React.ReactNode;
	/**
	 * 에러 메시지. 지정하면 `Form` 의 `errors[name]` 보다 우선한다.
	 * 문자열이 아니어도 되지만 스크린리더가 읽으므로 텍스트를 권장한다.
	 */
	error?: React.ReactNode;
	/** 입력 하나 (`<TextField />`, `<Dropdown />` 등) */
	children: React.ReactNode;
}

/**
 * 라벨·필수 표시·도움말·에러와 그 접근성 연결을 소유하는 폼 필드 래퍼.
 *
 * 입력 11종은 label/supportingText/error 를 **서로 다르게** 갖고 있다 - 9종만 label 이 있고
 * error 는 5종뿐이라, 폼 화면은 입력 밖에 문구를 직접 그려 왔다. `Field` 가 그 자리를 가져가면
 * 어떤 입력을 넣어도 라벨 위치·간격·에러 문구·`aria-describedby` 가 같아진다.
 *
 * 입력의 기존 prop 은 그대로 살아 있다. `Field` 없이 쓰면 지금과 동일하게 동작한다.
 *
 * @example
 * ```tsx
 * <Field name="email" label="이메일" required help="로그인 ID 로 사용됩니다">
 *   <TextField />
 * </Field>
 * ```
 */
export const Field = ({
	name,
	label,
	required = false,
	help,
	error: errorProp,
	children,
	className,
	...props
}: FieldProps) => {
	const generatedId = useId();
	const inputId = `${name}-${generatedId}`;
	// prop 이 우선한다 - 화면이 지역 검증으로 덮어쓸 수 있어야 서버 에러가 남아 있지 않는다.
	const formError = useFormError(name);
	const error = errorProp ?? formError;
	const labelId = label ? `${inputId}-label` : undefined;
	const helpId = help ? `${inputId}-help` : undefined;
	const errorId = error ? `${inputId}-error` : undefined;

	// 에러가 있으면 도움말 대신 에러를 보여준다. 둘을 동시에 띄우면 어느 쪽을 고쳐야 하는지
	// 흐려지고, 세로 간격이 필드마다 달라진다.
	const showHelp = !error && !!help;

	const control: FieldControl = {
		inputId,
		labelId,
		describedBy: [errorId, showHelp ? helpId : undefined].filter(Boolean).join(" ") || undefined,
		invalid: !!error,
		required,
	};

	return (
		<div className={cn("field", !!error && "field_error", className)} {...props}>
			{label && (
				<label id={labelId} htmlFor={inputId} className="field_label">
					{label}
					{required && (
						<span className="field_required" aria-hidden="true">
							*
						</span>
					)}
				</label>
			)}

			<FieldContext.Provider value={control}>{children}</FieldContext.Provider>

			{showHelp && (
				<div id={helpId} className="field_help">
					{help}
				</div>
			)}
			{error && (
				<div id={errorId} className="field_message">
					{error}
				</div>
			)}
		</div>
	);
};
