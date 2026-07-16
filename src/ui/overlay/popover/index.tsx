"use client";

import { animated } from "@react-spring/web";
import * as React from "react";
import { cn, useSpringPresence } from "../../../utils";
import "./style.scss";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverProps {
	/** trigger 요소 - 클릭 시 팝오버 토글 */
	trigger: React.ReactElement;
	/** 팝오버 내부 콘텐츠 - 임의 ReactNode (폼/설명/액션 조합) */
	content: React.ReactNode;
	/** 위치 (기본값: "bottom") */
	placement?: PopoverPlacement;
	/** 제어 모드 - 열림 상태 */
	open?: boolean;
	/** 비제어 모드 초기 열림 상태 (기본값: false) */
	defaultOpen?: boolean;
	/** 열림 상태 변경 콜백 */
	onOpenChange?: (open: boolean) => void;
	/** dialog 의 접근성 라벨 - content 에 제목이 없을 때 권장 */
	"aria-label"?: string;
	/** dialog 의 접근성 라벨 요소 id */
	"aria-labelledby"?: string;
	/** 추가 className - 팝오버 패널에 적용 */
	className?: string;
}

const FOCUSABLE_SELECTORS = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(", ");

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
	const popoverRef = React.useRef<HTMLDivElement>(null);
	/** 팝오버 열기 직전의 포커스 요소 (보통 trigger) - Esc 닫힘 시 복귀 대상 */
	const previousFocusRef = React.useRef<HTMLElement | null>(null);
	const popoverId = React.useId();

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!isControlled) setInternalOpen(next);
			onOpenChange?.(next);
		},
		[isControlled, onOpenChange],
	);

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

	const style = useSpringPresence({ visible: open, from: fromTransform, onExitComplete: () => setShouldRender(false) });

	// 열릴 때 content 첫 focusable(없으면 패널 자체)로 포커스 이동
	React.useEffect(() => {
		if (!open) return;
		previousFocusRef.current = document.activeElement as HTMLElement | null;
		const node = popoverRef.current;
		if (!node) return;
		const focusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
		(focusable ?? node).focus();
	}, [open]);

	// 외부 클릭으로 닫기. Escape 는 아래 wrapper 의 React onKeyDown 에서 처리한다.
	React.useEffect(() => {
		if (!open) return;
		const handleClick = (e: MouseEvent) => {
			if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open, setOpen]);

	// Escape 닫기 - document capture 리스너 대신 wrapper 의 React onKeyDown(버블) 로 처리한다.
	// capture+stopPropagation 은 이벤트가 타겟(Popover 내부 input/select 등)에 닿기도 전에
	// 최상단에서 끊어 자식 요소의 자체 Escape 처리를 마비시킨다(치명적). 버블 단계에서 잡으면
	// 자식이 먼저 처리할 기회를 갖고, 여기서 stopPropagation 하면 상위 Modal 의 onKeyDown 으로도
	// 전파되지 않아 "최상단만 닫힘"(APG)이 지켜진다.
	const handleWrapperKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (open && e.key === "Escape") {
			e.stopPropagation();
			setOpen(false);
			previousFocusRef.current?.focus();
		}
	};

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
		// biome-ignore lint/a11y/noStaticElementInteractions: keyboard handler for Escape dismissal; interactive children carry their own roles
		<div className="popover_wrapper" ref={wrapperRef} onKeyDown={handleWrapperKeyDown}>
			{triggerWithProps}
			{shouldRender && (
				<div className={cn("popover_position", `popover_placement_${placement}`)}>
					<animated.div
						id={popoverId}
						ref={popoverRef}
						role="dialog"
						tabIndex={-1}
						aria-label={ariaLabel}
						aria-labelledby={ariaLabelledby}
						style={style}
						className={cn("popover", className)}
					>
						{content}
					</animated.div>
				</div>
			)}
		</div>
	);
};

Popover.displayName = "Popover";
