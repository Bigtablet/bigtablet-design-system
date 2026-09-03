"use client";

import { useSpring } from "@react-spring/web";
import * as React from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * 마우스 hover 시 spring 기반 lift 효과를 만든다. 카드/CTA 강조에 사용.
 *
 * @example
 * ```tsx
 * const { style, bind } = useSpringHover();
 * return <animated.div style={style} {...bind}>...</animated.div>;
 * ```
 */
export function useSpringHover({
	scale = 1.02,
	lift = -2,
}: {
	/** hover 시 scale 비율 (기본 1.02) */
	scale?: number;
	/** hover 시 Y축 이동 px (기본 -2 = 살짝 떠오름) */
	lift?: number;
} = {}) {
	const [hovered, setHovered] = React.useState(false);
	const reduced = useReducedMotion();

	const style = useSpring({
		transform: hovered ? `translateY(${lift}px) scale(${scale})` : "translateY(0px) scale(1)",
		// reduced-motion: 보간을 없애 움직임을 지운다. 최종 상태(lift/scale)는 남는다 - 강조가
		// 사라지면 hover/focus 를 알 수 없다. WCAG 2.3.3 이 막는 것은 모션이다.
		immediate: reduced,
		config: { tension: 320, friction: 22 },
	});

	const bind = {
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
		onFocus: () => setHovered(true),
		onBlur: () => setHovered(false),
	};

	return { style, bind };
}
