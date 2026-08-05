"use client";

import { animated } from "@react-spring/web";
import * as React from "react";
import { createPortal } from "react-dom";
import { useAnchoredPosition, useOverlayEscape, useSpringPresence } from "../../../utils";
import "./style.scss";

/** 트리거와 툴팁 사이 간격(px). */
const TOOLTIP_GAP = 6;

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
	/** 툴팁 콘텐츠 */
	content: React.ReactNode;
	/**
	 * 선호 위치 (기본값: "top"). 뷰포트를 벗어나면 반대편으로 flip 되고 교차축으로 shift 되므로
	 * 실제 위치는 계산 결과를 따른다(Radix `side` + `collisionPadding` 계약). body 로 포탈된다.
	 */
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
	// wrapper = 앵커(트리거) 측정 대상, position = 플로팅(뷰포트 fixed 배치) 측정 대상.
	const wrapperRef = React.useRef<HTMLSpanElement>(null);
	const positionRef = React.useRef<HTMLSpanElement>(null);

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
	// 공유 오버레이 스택에 등록 - 열려 있는 동안 최상단일 때만 Escape 로 닫혀
	// 다른 오버레이나 소비자 앱 핸들러를 삼키지 않는다 (overlay-stack.ts 참고).
	// 툴팁은 hover 로 열려 포커스가 trigger 밖에 있을 수 있으므로 document 레벨 처리가 필요한데,
	// 레지스트리가 그 역할을 대신한다.
	useOverlayEscape(open, hideNow);

	// 열릴 때 트리거 rect + 뷰포트로 flip/shift/shrink 를 계산해 body 로 포탈(fixed).
	const pos = useAnchoredPosition({
		open,
		anchorRef: wrapperRef,
		floatingRef: positionRef,
		placement,
		gap: TOOLTIP_GAP,
		padding: 8,
	});

	const fromTransform = (() => {
		switch (pos.placement) {
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
		<span className="tooltip_wrapper" ref={wrapperRef}>
			{trigger}
			{open &&
				typeof document !== "undefined" &&
				createPortal(
					<span
						ref={positionRef}
						className="tooltip_position"
						// 최초 측정 전에는 숨겨 (0,0) 깜빡임을 막는다.
						style={{
							position: "fixed",
							left: pos.x,
							top: pos.y,
							visibility: pos.ready ? undefined : "hidden",
						}}
						// WCAG 1.4.13 Hoverable - 툴팁 위로 포인터가 오면 열림 유지
						onMouseEnter={cancelHide}
						onMouseLeave={hide}
					>
						<animated.span
							id={tooltipId}
							role="tooltip"
							style={{ ...style, maxWidth: pos.maxWidth ?? undefined }}
							className="tooltip"
						>
							{content}
						</animated.span>
					</span>,
					document.body,
				)}
		</span>
	);
};
