"use client";

import type * as React from "react";
import { createContext, useContext } from "react";
import { cn } from "../../../utils";
import "./style.scss";

/** `Form` 이 자식 `Field` 에게 내리는 값. 폼 밖의 `Field` 는 undefined 를 받는다. */
interface FormControl {
	/** 필드 이름 → 에러 메시지. 서버 검증(422) 결과를 그대로 넣는 자리 */
	errors: Record<string, React.ReactNode> | undefined;
}

const FormContext = createContext<FormControl | undefined>(undefined);

/**
 * `Field` 가 자기 `name` 의 서버 에러를 찾을 때 쓴다. `Form` 밖에서는 undefined.
 *
 * @internal `Field` 전용. 소비자가 직접 부를 일은 없다.
 */
export function useFormError(name: string): React.ReactNode | undefined {
	return useContext(FormContext)?.errors?.[name];
}

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
	/**
	 * 필드 이름 → 에러 메시지. 해당 `Field` 가 자기 이름으로 찾아 표시한다.
	 * 서버 검증 실패(422) 응답을 필드에 꽂는 표준 경로다.
	 */
	errors?: Record<string, React.ReactNode>;
	/** 제출 콜백. `event.preventDefault()` 는 `Form` 이 이미 호출한 뒤 부른다 */
	onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
	children: React.ReactNode;
}

/**
 * `Field` 들을 묶어 세로 간격과 **서버 에러 배분**을 소유하는 폼 컨테이너.
 *
 * 폼 라이브러리에 의존하지 않는다 - `errors` 맵과 `onSubmit` 만 받으므로 react-hook-form 이든
 * 수동 상태든 어댑터 한 겹으로 붙는다.
 *
 * @example
 * ```tsx
 * <Form onSubmit={save} errors={serverErrors}>
 *   <Field name="email" label="이메일" required>
 *     <TextField />
 *   </Field>
 *   <Form.Actions>
 *     <Button type="submit">저장</Button>
 *   </Form.Actions>
 * </Form>
 * ```
 */
export const Form = ({ errors, onSubmit, children, className, ...props }: FormProps) => (
	<FormContext.Provider value={{ errors }}>
		<form
			className={cn("form", className)}
			onSubmit={(event) => {
				// 기본 제출(페이지 이동)을 항상 막는다. 소비자가 매번 쓰던 한 줄이고,
				// 빠뜨리면 SPA 에서 화면이 통째로 새로고침된다.
				event.preventDefault();
				onSubmit?.(event);
			}}
			{...props}
		>
			{children}
		</form>
	</FormContext.Provider>
);

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 버튼 정렬 (기본값: "end") */
	align?: "start" | "center" | "end" | "between";
	children: React.ReactNode;
}

/**
 * 폼 하단 액션 줄. 정렬과 버튼 간격을 DS 가 정한다 - 화면마다 저장/취소 위치가 갈리지 않게.
 */
const FormActions = ({ align = "end", children, className, ...props }: FormActionsProps) => (
	<div className={cn("form_actions", `form_actions_${align}`, className)} {...props}>
		{children}
	</div>
);

FormActions.displayName = "Form.Actions";
Form.Actions = FormActions;
