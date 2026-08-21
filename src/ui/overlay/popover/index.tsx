"use client";

import { animated } from "@react-spring/web";
import * as React from "react";
import { createPortal } from "react-dom";
import {
	cn,
	useAnchoredPosition,
	useFocusTrap,
	useOverlayEscape,
	useSpringPresence,
} from "../../../utils";
import "./style.scss";

/** 트리거와 팝오버 사이 간격(px). */
const POPOVER_GAP = 8;

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverProps {
	/** trigger 요소 - 클릭 시 팝오버 토글 */
	trigger: React.ReactElement;
	/** 팝오버 내부 콘텐츠 - 임의 ReactNode (폼/설명/액션 조합) */
	content: React.ReactNode;
	/**
	 * 선호 위치 (기본값: "bottom"). 뷰포트를 벗어나면 반대편으로 flip 되고 교차축으로 shift 되므로
	 * 실제 위치는 계산 결과를 따른다(Radix `side` + `collisionPadding` 계약). body 로 포탈된다.
	 */
	placement?: PopoverPlacement;
	/** 제어 모드 - 열림 상태 */
	open?: boolean;
	/** 비제어 모드 초기 열림 상태 (기본값: false) */
	defaultOpen?: boolean;
	/** 열림 상태 변경 콜백 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * 팝오버 접근성 레이블. `content` 에 제목이 없으면 이 값이 접근성 이름이 된다.
	 * 폴백이 없으므로 `aria-labelledby` 와 함께 비우면 이름 없는 대화상자가 되고
	 * axe `aria-dialog-name` 이 잡는다.
	 */
	"aria-label"?: string;
	/** dialog 의 접근성 라벨 요소 id */
	"aria-labelledby"?: string;
	/** 추가 className - 팝오버 패널에 적용 */
	className?: string;
}

/**
 * 클릭 트리거로 임의의 interactive content 를 띄우는 범용 non-modal 팝오버.
 * Menu(액션 리스트) / Tooltip(hover 정보) 과 역할 분리 - 폼/설명/액션 조합을 담는다.
 * 외부 클릭/Esc 로 닫히며, 열릴 때 content 로 포커스 이동, Esc 로 닫으면 trigger 로 복귀.
 *
 * @example
 * ```tsx
 * <Popover
 *   trigger={<Button>필터</Button>}
 *   aria-label="필터 옵션"
 *   content={
 *     <Stack gap={8}>
 *       <Checkbox label="활성" />
 *       <Button size="sm">적용</Button>
 *     </Stack>
 *   }
 * />
 * ```
 */
export const Popover = ({
	trigger,
	content,
	placement = "bottom",
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledby,
	className,
}: PopoverProps) => {
	const isControlled = openProp !== undefined;
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
	const open = isControlled ? openProp : internalOpen;

	const [shouldRender, setShouldRender] = React.useState(open ?? false);
	if (open && !shouldRender) setShouldRender(true);

	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const positionRef = React.useRef<HTMLDivElement>(null);
	const popoverRef = React.useRef<HTMLDivElement>(null);
	const popoverId = React.useId();

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!isControlled) setInternalOpen(next);
			onOpenChange?.(next);
		},
		[isControlled, onOpenChange],
	);

	// 열릴 때 트리거 rect + 뷰포트로 flip/shift/shrink 를 계산해 body 로 포탈(fixed).
	// shouldRender 로 게이트해 퇴장 애니메이션 동안에도 위치를 유지한다.
	const pos = useAnchoredPosition({
		open: shouldRender,
		anchorRef: wrapperRef,
		floatingRef: positionRef,
		placement,
		gap: POPOVER_GAP,
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

	const style = useSpringPresence({
		visible: open,
		from: fromTransform,
		onExitComplete: () => setShouldRender(false),
	});

	// body 로 포탈되면 트리거 뒤 tab 순서가 끊기므로 다른 포탈 오버레이(Modal/Drawer/Alert)와 동일하게
	// 포커스를 패널 안에 트랩한다 - 열릴 때 첫 focusable 로 이동, Tab 순환, 닫힐 때 트리거로 복귀.
	useFocusTrap(popoverRef, open);

	// 외부 클릭으로 닫기. Escape 는 아래 wrapper 의 React onKeyDown 에서 처리한다.
	React.useEffect(() => {
		if (!open) return;
		const handleClick = (e: MouseEvent) => {
			const target = e.target as Node;
			// 팝오버가 body 로 포탈되므로 wrapper(트리거) + popover 패널 둘 다 "내부"로 본다.
			if (!wrapperRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open, setOpen]);

	// Escape 닫기 - 공유 오버레이 스택에 등록해 최상단일 때만 닫는다 (overlay-stack.ts 참고).
	// 레지스트리 리스너는 document 의 bubble 단계라 이벤트가 target(Popover 내부 input/select 등)에서
	// 위로 올라오며 자식이 먼저 처리할 기회를 갖는다. 자식이 자체 Escape 를 처리하고 stopPropagation
	// 하면 이벤트가 document 까지 오지 않아 Popover 는 닫히지 않는다(자식 우선 - 이전 리뷰 critical).
	// 아무도 소비하지 않고 document 까지 오면 최상단(=이 Popover)만 닫고, 상위 Modal 이나 소비자
	// 앱으로의 전파를 끊어 "최상단만 닫힘"(APG)을 지킨다.
	// 포커스 복귀(트리거로)는 useFocusTrap 의 cleanup 이 담당한다.
	useOverlayEscape(open, () => {
		setOpen(false);
	});

	const triggerWithProps = React.cloneElement(
		trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
		{
			onClick: (e: React.MouseEvent<HTMLElement>) => {
				(trigger.props as React.HTMLAttributes<HTMLElement>).onClick?.(e);
				if (e.defaultPrevented) return;
				setOpen(!open);
			},
			"aria-haspopup": "dialog",
			"aria-expanded": open,
			"aria-controls": open ? popoverId : undefined,
		} as React.HTMLAttributes<HTMLElement>,
	);

	return (
		<div className="popover_wrapper" ref={wrapperRef}>
			{triggerWithProps}
			{shouldRender &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						ref={positionRef}
						className="popover_position"
						// 측정 대상(이 컨테이너)에 max-width 상한을 걸어 자식이 좁아져도 측정값이 진동하지 않게 한다.
						// 최초 측정 전에는 숨겨 (0,0) 깜빡임을 막는다.
						style={{
							position: "fixed",
							left: pos.x,
							top: pos.y,
							// 최초 측정 전(ready=false)에는 maxWidth(=0)를 걸지 않는다 - 걸면 자연 폭 대신
							// 0px 로 측정돼 첫 프레임 좌표가 어긋난다. ready 후에만 상한 적용.
							maxWidth: pos.ready ? pos.maxWidth : undefined,
							visibility: pos.ready ? undefined : "hidden",
						}}
					>
						<animated.div
							id={popoverId}
							ref={popoverRef}
							role="dialog"
							tabIndex={-1}
							// 이름을 폴백하지 않는다 - Modal/Drawer 와 같은 계약이다. 영문 폴백은 한국어 UI 에서
							// 그대로 낭독되고, 무엇보다 이름 누락을 가려 axe `aria-dialog-name` 이 거짓 통과한다.
							aria-label={ariaLabel}
							aria-labelledby={ariaLabelledby}
							style={style}
							className={cn("popover", className)}
						>
							{content}
						</animated.div>
					</div>,
					document.body,
				)}
		</div>
	);
};

Popover.displayName = "Popover";
