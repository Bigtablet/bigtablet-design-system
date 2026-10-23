"use client";

import * as React from "react";
import { useSafeLayoutEffect } from "./use-safe-layout-effect";

/**
 * 퇴출 모션이 끝날 때까지 마운트를 붙잡는다. 모션 자체는 CSS(`token.presence` mixin)가 한다.
 *
 * - `open` 이 true 가 되는 렌더에서 바로 마운트한다(effect 로 미루면 포커스 트랩이 한 렌더 늦게 붙는다).
 * - `open` 이 false 가 되면 `refs` 요소의 `getAnimations()` 가 모두 끝난 뒤 언마운트하고 `onExited` 를 부른다.
 * - 돌고 있는 애니메이션이 없으면(reduced-motion, `linear()` 미지원, jsdom) 같은 effect 에서 바로 언마운트한다.
 * - 퇴출 중에 다시 열리면 대기를 버린다. transition 은 CSS 가 제자리에서 되돌린다.
 *
 * `refs` 는 자식까지 훑지 않는다(`subtree` 미사용) - 본문의 Spinner 같은 무한 애니메이션을 기다리면
 * 영영 닫히지 않는다.
 *
 * @example
 * ```tsx
 * const panelRef = React.useRef<HTMLDivElement>(null);
 * const mounted = usePresence(open, [panelRef], onExited);
 * if (!mounted) return null;
 * return <div ref={panelRef} className="panel" data-state={open ? "open" : "closed"} />;
 * ```
 */
export function usePresence(
	open: boolean,
	refs: ReadonlyArray<React.RefObject<Element | null>>,
	onExited?: () => void,
): boolean {
	const [mounted, setMounted] = React.useState(open);
	// React "render 중 상태 조정" 패턴 - 조건이 곧 거짓이 되어 루프가 없다.
	if (open && !mounted) setMounted(true);

	const latest = React.useRef({ refs, onExited });
	useSafeLayoutEffect(() => {
		latest.current = { refs, onExited };
	});

	React.useEffect(() => {
		if (open || !mounted) return;
		let cancelled = false;
		const finish = () => {
			if (cancelled) return;
			setMounted(false);
			latest.current.onExited?.();
		};
		// getAnimations() 는 대기 중인 스타일 변경을 먼저 반영하므로 방금 시작된 퇴출 transition 이 잡힌다.
		const animations = latest.current.refs.flatMap((ref) => ref.current?.getAnimations?.() ?? []);
		if (animations.length === 0) finish();
		// allSettled - 취소된 애니메이션(finished reject)도 끝난 것으로 본다.
		else void Promise.allSettled(animations.map((a) => a.finished)).then(finish);
		return () => {
			cancelled = true;
		};
	}, [open, mounted]);

	return mounted;
}
