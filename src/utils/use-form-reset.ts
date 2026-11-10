"use client";

import * as React from "react";

/**
 * 감싼 `<form>` 이 reset 되면 onReset 을 부른다. 비제어 컴포넌트의 React 상태는 `form.reset()` 을 모른다 -
 * 네이티브 입력 · 숨은 input 만 처음 값으로 돌아가 화면과 상태가 어긋났다 (#985 · #986).
 * reset 이벤트는 값을 되돌리기 **전에** 오므로 다음 틱에 부른다 - 그래야 되돌아간 DOM 값을 읽을 수 있다.
 * @param ref 폼 안의 아무 요소
 * @param onReset 처음 값으로 되돌리는 함수 (매 렌더 새 함수여도 된다)
 */
export function useFormReset(ref: React.RefObject<HTMLElement | null>, onReset: () => void) {
	const onResetRef = React.useRef(onReset);
	React.useEffect(() => {
		onResetRef.current = onReset;
	});
	React.useEffect(() => {
		// 입력이면 `form` 속성으로 연결된 폼(밖에 있어도)까지 받는다. 그 밖의 요소는 감싼 폼
		const el = ref.current;
		const form = (el instanceof HTMLInputElement ? el.form : null) ?? el?.closest("form");
		if (!form) return;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const handle = (event: Event) => {
			// 다른 리스너가 reset 을 취소했으면 네이티브 값도 그대로다 - 상태만 되돌리지 않는다
			timer = setTimeout(() => {
				if (!event.defaultPrevented) onResetRef.current();
			});
		};
		form.addEventListener("reset", handle);
		return () => {
			clearTimeout(timer);
			form.removeEventListener("reset", handle);
		};
	}, [ref]);
}
