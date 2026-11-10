"use client";

import type * as React from "react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { cn, type SafeHTMLProps } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

/** `Field` 가 요약 링크를 만들 수 있게 `Form` 에 알리는 자기 정보 */
interface FieldEntry {
	label: string | undefined;
	/** 링크를 눌렀을 때 포커스할 입력 id */
	inputId: string;
}

/** `Form` 이 자식 `Field` 에게 내리는 값. 폼 밖의 `Field` 는 undefined 를 받는다. */
interface FormControl {
	/** 필드 이름 → 에러 메시지. 서버 검증(422) 결과를 그대로 넣는 자리 */
	errors: Record<string, React.ReactNode> | undefined;
	/** 에러 요약을 그리는지 - 그리면 필드는 `errors` 에서 온 에러를 따로 알리지 않는다 */
	summary: boolean;
	register: (name: string, entry: FieldEntry) => () => void;
}

const FormContext = createContext<FormControl | undefined>(undefined);

/**
 * `Field` 가 자기 `name` 의 서버 에러를 찾고, 요약 링크용 정보를 등록할 때 쓴다. `Form` 밖에서는
 * 에러 undefined · 요약 없음.
 *
 * @internal `Field` 전용. 소비자가 직접 부를 일은 없다.
 */
export function useFormField(
	name: string,
	entry: FieldEntry,
): { error: React.ReactNode | undefined; summarized: boolean } {
	const form = useContext(FormContext);
	const register = form?.register;
	const { label, inputId } = entry;
	useEffect(() => register?.(name, { label, inputId }), [register, name, label, inputId]);
	return { error: form?.errors?.[name], summarized: !!form?.summary };
}

/** 에러 맵에서 값이 있는 이름만 - `{ email: undefined }` 같은 빈 자리는 에러가 아니다 */
const errorNames = (errors: Record<string, React.ReactNode> | undefined) =>
	Object.keys(errors ?? {}).filter((name) => {
		const value = errors?.[name];
		return value !== undefined && value !== null && value !== false && value !== "";
	});

export interface FormProps
	extends Omit<SafeHTMLProps<React.FormHTMLAttributes<HTMLFormElement>>, "onSubmit"> {
	/**
	 * 필드 이름 → 에러 메시지. 해당 `Field` 가 자기 이름으로 찾아 표시한다.
	 * 서버 검증 실패(422) 응답을 필드에 꽂는 표준 경로다.
	 */
	errors?: Record<string, React.ReactNode>;
	/**
	 * 폼 위에 에러 요약을 그린다 (기본값: false). `errors` 에 값이 있으면 개수와 필드별 링크를 보이고,
	 * 제출 뒤(또는 처음부터 에러가 있으면 마운트 때) 요약으로 포커스를 옮겨 **한 번** 읽힌다. 켜면 필드는
	 * `errors` 에서 온 에러를 따로 낭독하지 않는다 - 여러 필드의 알림이 겹쳐 일부가 빠지던 것 (#993)
	 */
	errorSummary?: boolean;
	/** 요약 제목 (기본값: 로케일 `form.errorSummary` - "{count}개 항목을 확인해 주세요") */
	errorSummaryTitle?: React.ReactNode;
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
export const Form = ({
	errors,
	errorSummary = false,
	errorSummaryTitle,
	onSubmit,
	children,
	className,
	...props
}: FormProps) => {
	const t = useLocaleText();
	const [fields, setFields] = useState<Record<string, FieldEntry>>({});
	const register = useCallback((name: string, entry: FieldEntry) => {
		setFields((prev) => ({ ...prev, [name]: entry }));
		return () =>
			setFields((prev) => {
				const { [name]: _, ...rest } = prev;
				return rest;
			});
	}, []);

	const names = errorSummary ? errorNames(errors) : [];
	const summaryRef = useRef<HTMLElement>(null);
	const titleId = useId();
	// 요약이 처음 나타날 때(마운트 · 제출 뒤) 포커스를 옮긴다. errors 객체가 렌더마다 새로 만들어져도
	// 매번 뺏지 않게 "제출했다" · "막 붙었다" 를 표시로 둔다
	const focusPendingRef = useRef(true);
	const hasSummary = names.length > 0;
	useEffect(() => {
		if (!hasSummary || !focusPendingRef.current) return;
		focusPendingRef.current = false;
		summaryRef.current?.focus();
	});

	const focusField = (name: string) => {
		const id = fields[name]?.inputId;
		const target = id ? document.getElementById(id) : null;
		target?.focus();
		target?.scrollIntoView?.({ block: "center" });
	};

	return (
		<FormContext.Provider value={{ errors, summary: errorSummary, register }}>
			<form
				className={cn("form", className)}
				onSubmit={(event) => {
					// 기본 제출(페이지 이동)을 항상 막는다. 소비자가 매번 쓰던 한 줄이고,
					// 빠뜨리면 SPA 에서 화면이 통째로 새로고침된다.
					event.preventDefault();
					focusPendingRef.current = true;
					onSubmit?.(event);
				}}
				{...props}
			>
				{hasSummary && (
					// 포커스를 받아 제목과 목록이 한 번 읽힌다 - 라이브 리전이 아니라 포커스 이동이라 필드
					// 알림처럼 겹치지 않는다 (GOV.UK error summary 와 같은 방식)
					<section
						ref={summaryRef}
						className="form_error_summary"
						tabIndex={-1}
						aria-labelledby={titleId}
					>
						<div id={titleId} className="form_error_summary_title">
							{errorSummaryTitle ?? t("form.errorSummary", { count: names.length })}
						</div>
						<ul className="form_error_summary_list">
							{names.map((name) => (
								<li key={name}>
									<a
										href={`#${fields[name]?.inputId ?? name}`}
										className="form_error_summary_link"
										onClick={(event) => {
											event.preventDefault();
											focusField(name);
										}}
									>
										{fields[name]?.label ? `${fields[name].label}: ` : null}
										{errors?.[name]}
									</a>
								</li>
							))}
						</ul>
					</section>
				)}
				{children}
			</form>
		</FormContext.Provider>
	);
};

export interface FormActionsProps extends SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>> {
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
