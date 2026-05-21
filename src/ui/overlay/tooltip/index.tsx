"use client";

import { animated } from "@react-spring/web";
import * as React from "react";
import { cn, useSpringPresence } from "../../../utils";
import "./style.scss";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
	/** 툴팁 콘텐츠 */
	content: React.ReactNode;
	/** 위치 (기본값: "top") */
	placement?: TooltipPlacement;
	/** hover 후 지연 시간 ms (기본 200) */
	delay?: number;
	/** 비활성화 — children만 그대로 렌더, 툴팁 없음 */
	disabled?: boolean;
	children: React.ReactElement;
}

/**
 * hover/focus 시 추가 정보를 보여주는 툴팁. react-spring fade+slide entrance.
 *
 * @example
 * ```tsx
 * <Tooltip content="저장하기">
 *   <IconButton icon={<SaveIcon />} />
 * </Tooltip>
 * ```
 */
export const Tooltip = ({
	content,
	placement = "top",
	delay = 200,
	disabled = false,
	children,
}: TooltipProps) => {
	const [open, setOpen] = React.useState(false);
	const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const tooltipId = React.useId();

	const show = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setOpen(true), delay);
	}, [delay]);

	const hide = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		setOpen(false);
	}, []);

	React.useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const fromTransform = (() => {
		switch (placement) {
			case "top":
				return "translateY(4px)";
			case "bottom":
				return "translateY(-4px)";
			case "left":
				return "translateX(4px)";
			case "right":
				return "translateX(-4px)";
		}
	})();

	const style = useSpringPresence({ visible: open, from: fromTransform });

	const trigger = React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
		onMouseEnter: show,
		onMouseLeave: hide,
		onFocus: show,
		onBlur: hide,
		"aria-describedby": open ? tooltipId : undefined,
	} as React.HTMLAttributes<HTMLElement>);

	if (disabled) return children;

	return (
		<span className="tooltip_wrapper">
			{trigger}
			{open && (
				<span className={cn("tooltip_position", `tooltip_placement_${placement}`)}>
					<animated.span
						id={tooltipId}
						role="tooltip"
						style={style}
						className={cn("tooltip", `tooltip_placement_${placement}`)}
					>
						{content}
					</animated.span>
				</span>
			)}
		</span>
	);
};
