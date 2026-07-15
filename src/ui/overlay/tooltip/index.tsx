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
	/** 비활성화 - children만 그대로 렌더, 툴팁 없음 */
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

	// 포인터가 trigger→tooltip 사이 갭(6px)을 건널 시간 (WCAG 1.4.13 Hoverable)
	const HIDE_DELAY = 120;

	const show = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setOpen(true), delay);
	}, [delay]);

	// blur/Escape 는 즉시, mouseleave 는 지연 닫힘 - 포인터가 툴팁 위로 이동할 수 있도록
	const hideNow = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		setOpen(false);
	}, []);

	const hide = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setOpen(false), HIDE_DELAY);
	}, []);

	// 툴팁 자체에 포인터가 올라오면 지연 닫힘 취소 (WCAG 1.4.13 Hoverable)
	const cancelHide = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
	}, []);

	React.useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	// WCAG 1.4.13 Dismissable - 포인터/포커스를 옮기지 않고 Escape 로 닫기.
	// capture 단계 document 리스너라 아래층 오버레이(Modal 등)의 Escape 핸들러보다
	// 먼저 실행되고, 닫을 때 전파를 끊어 최상단(툴팁)만 닫는다.
	React.useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			e.stopPropagation();
			hideNow();
		};
		document.addEventListener("keydown", onKeyDown, true);
		return () => document.removeEventListener("keydown", onKeyDown, true);
	}, [open, hideNow]);

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

	const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
	const childProps = child.props;
	// 자식의 기존 핸들러를 보존하고 tooltip 핸들러를 합성 (덮어쓰기 방지)
	const trigger = React.cloneElement(child, {
		onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
			childProps.onMouseEnter?.(e);
			show();
		},
		onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
			childProps.onMouseLeave?.(e);
			hide();
		},
		onFocus: (e: React.FocusEvent<HTMLElement>) => {
			childProps.onFocus?.(e);
			show();
		},
		onBlur: (e: React.FocusEvent<HTMLElement>) => {
			childProps.onBlur?.(e);
			hideNow();
		},
		// 자식의 기존 aria-describedby 보존 + tooltip id 합성 (폼 설명/에러 연결 끊김 방지)
		"aria-describedby": open
			? [childProps["aria-describedby"], tooltipId].filter(Boolean).join(" ")
			: childProps["aria-describedby"],
	} as React.HTMLAttributes<HTMLElement>);

	if (disabled) return children;

	return (
		<span className="tooltip_wrapper">
			{trigger}
			{open && (
				<span
					className={cn("tooltip_position", `tooltip_placement_${placement}`)}
					// WCAG 1.4.13 Hoverable - 툴팁 위로 포인터가 오면 열림 유지
					onMouseEnter={cancelHide}
					onMouseLeave={hide}
				>
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
