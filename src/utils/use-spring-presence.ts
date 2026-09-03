"use client";

import { useSpring } from "@react-spring/web";
import { springEnterFrom } from "./spring-motion";
import { useReducedMotion } from "./use-reduced-motion";

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
	onProgress,
}: {
	/** 보이는 상태인지 - false면 사라짐 모션 */
	visible: boolean;
	/** 진입 시 시작 transform (기본: 아래에서 살짝 올라옴) */
	from?: string;
	/** exit 모션 완료 시 호출 - 부모에서 unmount 트리거용 */
	onExitComplete?: () => void;
	/** 프레임마다 현재 opacity(0~1). 오버레이가 잠금에 딤 진행도를 보고할 때 쓴다(#583). */
	onProgress?: (progress: number) => void;
}) {
	const reduced = useReducedMotion();

	return useSpring({
		// reduced-motion 에서는 `from` 을 생략한다 - 주면 첫 프레임에 from 이 DOM 에 커밋된 뒤
		// immediate 가 목표값으로 점프해 모션 대신 한 프레임 깜빡임이 남는다. Toast 는 항상
		// visible=true 로 마운트하므로 이 경로를 무조건 탄다. 자세한 근거는 springEnterFrom JSDoc.
		...springEnterFrom(reduced, from),
		to: {
			opacity: visible ? 1 : 0,
			transform: visible ? "translateY(0px)" : from,
		},
		// reduced-motion: 진입/퇴출 모션 없이 즉시 최종 상태로 점프 (WCAG 2.3.3). onRest는 그대로 발화.
		immediate: reduced,
		config: {
			tension: 280, // Vercel 식 부드러운 spring
			friction: 28,
			clamp: !visible, // 사라질 땐 진동 없이 빠르게
		},
		onChange: (result) => onProgress?.(Number(result.value.opacity)),
		onRest: (result) => {
			if (!visible && result.finished && onExitComplete) {
				onExitComplete();
			}
		},
	});
}
