"use client";

import * as React from "react";

/**
 * 클라이언트 마운트 여부를 반환한다.
 *
 * 서버 렌더 및 클라이언트 하이드레이션 첫 렌더에서는 `false`, 마운트 effect 실행 후 `true`.
 * SSR 에서 `document`(포털 대상)가 없거나, open 상태로 마운트되는 오버레이가 서버 `null` /
 * 클라 포털로 갈려 hydration mismatch 가 나는 것을 막을 때 쓴다.
 *
 * @example
 * ```tsx
 * const isMounted = useIsMounted();
 * if (typeof document === "undefined" || !isMounted) return null;
 * return createPortal(..., document.body);
 * ```
 */
export function useIsMounted(): boolean {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);
	return mounted;
}
