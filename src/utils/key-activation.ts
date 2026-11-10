import type * as React from "react";

export interface KeyActivationOptions<E extends HTMLElement> {
	/** 실제 클릭 동작. 없으면 눌리는 표면이 아니므로 role·tabIndex 도 붙지 않는다 */
	onClick?: React.MouseEventHandler<E> | undefined;
	/** 소비자가 덮어쓴 role. 주면 그것이 이긴다 */
	role?: React.AriaRole | undefined;
	/** 비활성 상태. 포커스도 키 활성화도 막는다 */
	disabled?: boolean | undefined;
	/** 소비자 keydown 핸들러. 내부 핸들러보다 **먼저** 실행된다 */
	onKeyDown?: React.KeyboardEventHandler<E> | undefined;
}

export interface KeyActivationProps<E extends HTMLElement> {
	role: React.AriaRole | undefined;
	tabIndex: number | undefined;
	onKeyDown: React.KeyboardEventHandler<E>;
	/** 안쪽 컨트롤에서 온 클릭을 거른 onClick. onClick 이 없으면 undefined */
	onClick: React.MouseEventHandler<E> | undefined;
}

/** 표면 안에서 자기 동작을 가진 요소 - 여기서 시작한 클릭 · 키는 표면 것이 아니다 */
const INNER_CONTROL =
	"a, button, input, select, textarea, label, [role='button'], [role='menuitem'], [role='checkbox'], [role='switch'], [contenteditable='true']";

/**
 * 이벤트가 표면 안 컨트롤(또는 포털로 띄운 메뉴)에서 왔는지. 버튼 Enter 도 `click` 으로 올라오므로 keydown
 * 만 걸러서는 버튼을 눌렀는데 표면까지 열린다. 포털 안 요소는 DOM 상 표면 밖이지만 React 이벤트는 표면으로
 * 올라온다 - 그래서 "표면 안에 없음" 도 컨트롤로 본다 (Table 행과 같은 규칙, #983)
 */
export const isFromInnerControl = (e: React.SyntheticEvent<HTMLElement>) => {
	const target = e.target as Element;
	if (target === e.currentTarget) return false;
	if (!e.currentTarget.contains(target)) return true;
	const control = target.closest(INNER_CONTROL);
	return control !== null && control !== e.currentTarget && e.currentTarget.contains(control);
};

/**
 * div 로 만든 "눌리는 표면" 에 키보드 조작을 붙인다 (WCAG 2.1.1).
 *
 * 판정 기준은 겉모습 prop(`interactive`·`clickable`)이 아니라 실제 `onClick` 이다 - 동작하는
 * 것만 탭 순서에 들어가야 한다. Card·MediaCard·ListItem 이 각자 복제하던 규칙을 한곳에 둔다.
 * @param options 클릭 핸들러·role·비활성 여부·소비자 keydown 핸들러
 * @returns 루트 요소에 펼칠 `role`·`tabIndex`·`onKeyDown`
 */
export function keyActivationProps<E extends HTMLElement>({
	onClick,
	role,
	disabled,
	onKeyDown,
}: KeyActivationOptions<E>): KeyActivationProps<E> {
	// 소비자가 준 role 이 이긴다. 키 처리도 그 값을 따라야 한다 - link 로 덮었는데 Space 로
	// 눌리면 안 된다.
	const resolvedRole = role ?? (onClick ? "button" : undefined);
	const isInteractive = !!onClick && !disabled;

	return {
		role: resolvedRole,
		tabIndex: isInteractive ? 0 : undefined,
		onKeyDown: (event) => {
			// 소비자 핸들러를 **먼저** 부른다. 그래야 `preventDefault()` 로 활성화를 막을 수 있다.
			onKeyDown?.(event);
			// 안쪽 버튼 · 입력에서 올라온 Enter · Space 는 그쪽 몫이다 - 받으면 버튼이 키보드로 안 눌리고
			// 표면이 대신 열렸고, textarea 에서 Space 를 칠 수 없었다 (#983)
			if (event.target !== event.currentTarget) return;
			// `event.repeat` - 키를 누르고 있으면 keydown 이 반복되어 삭제·이동 같은 부수효과가
			// 여러 번 실행된다. 네이티브 `<button>` 은 Space 를 눌러도 keyup 에 한 번만 click 을 낸다.
			if (!isInteractive || event.defaultPrevented || event.repeat) return;
			// Space 는 button 일 때만 활성화한다. 소비자가 `role="link"` 로 덮어썼다면 링크 규약을
			// 따라야 하고, 링크는 Space 로 눌리지 않는다(스크롤이다).
			if (event.key === "Enter" || (event.key === " " && resolvedRole === "button")) {
				event.preventDefault();
				// 진짜 click 을 쏜다 - onClick 이 가짜 캐스팅 없이 MouseEvent 로 불린다.
				event.currentTarget.click();
			}
		},
		onClick: onClick
			? (event) => {
					if (!isFromInnerControl(event)) onClick(event);
				}
			: undefined,
	};
}
