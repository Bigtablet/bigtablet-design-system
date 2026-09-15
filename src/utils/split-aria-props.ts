import type * as React from "react";

/**
 * 소비자가 넘긴 props 에서 `aria-*` 만 떼어낸다.
 *
 * 컨트롤을 래퍼로 감싸는 컴포넌트(Combobox·TagInput·RadioGroup)는 `{...props}` 를 래퍼에
 * 펼치는데, 그러면 소비자의 `aria-label`·`aria-describedby` 가 의미 없는 div 에 붙어 보조기술에
 * 닿지 않는다. 떼어낸 `aria-*` 는 실제 컨트롤로, 나머지(`data-*`·`className`·이벤트)는 래퍼로
 * 보낸다.
 * @param props 컴포넌트가 받은 나머지 props
 * @returns 컨트롤에 펼칠 `ariaProps` 와 래퍼에 펼칠 `restProps`
 */
export function splitAriaProps<P extends Record<string, unknown>>(
	props: P,
): { ariaProps: React.AriaAttributes; restProps: P } {
	const ariaProps: Record<string, unknown> = {};
	const restProps: Record<string, unknown> = {};

	for (const key of Object.keys(props)) {
		(key.startsWith("aria-") ? ariaProps : restProps)[key] = props[key];
	}

	return { ariaProps: ariaProps as React.AriaAttributes, restProps: restProps as P };
}
