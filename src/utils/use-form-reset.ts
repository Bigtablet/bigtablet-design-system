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
		const form = ref.current?.closest("form");
		if (!form) return;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const handle = () => {
			timer = setTimeout(() => onResetRef.current());
		};
		form.addEventListener("reset", handle);
		return () => {
			clearTimeout(timer);
			form.removeEventListener("reset", handle);
		};
	}, [ref]);
}
