"use client";

import { useSpring } from "@react-spring/web";

/**
 * 컴포넌트가 마운트/언마운트되거나 visible 상태가 토글될 때 자연스러운 진입/퇴출을 만든다.
 * Vercel/Linear 스타일의 부드러운 spring 모션.
 *
 * @example
 * ```tsx
 * const style = useSpringPresence({ visible: isOpen });
 * return <animated.div style={style}>...</animated.div>;
 * ```
 */
export function useSpringPresence({
	visible,
	from = "translateY(8px)",
	onExitComplete,
}: {
	/** 보이는 상태인지 — false면 사라짐 모션 */
	visible: boolean;
	/** 진입 시 시작 transform (기본: 아래에서 살짝 올라옴) */
	from?: string;
	/** exit 모션 완료 시 호출 — 부모에서 unmount 트리거용 */
	onExitComplete?: () => void;
}) {
	return useSpring({
		from: { opacity: 0, transform: from },
		to: {
			opacity: visible ? 1 : 0,
			transform: visible ? "translateY(0px)" : from,
		},
		config: {
			tension: 280, // Vercel 식 부드러운 spring
			friction: 28,
			clamp: !visible, // 사라질 땐 진동 없이 빠르게
		},
		onRest: (result) => {
			if (!visible && result.finished && onExitComplete) {
				onExitComplete();
			}
		},
	});
}
