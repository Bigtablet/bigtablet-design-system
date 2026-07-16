"use client";

import { animated, useSpring } from "@react-spring/web";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import {
	cn,
	useFocusTrap,
	useIsMounted,
	useOverlayEscape,
	useReducedMotion,
	useSpringPresence,
} from "../../../utils";
import "./style.scss";

/** Drawer 가 미끄러져 들어오는 방향 (top 은 범위 외) */
export type DrawerPlacement = "left" | "right" | "bottom";

// onClick/onKeyDown/role 은 오버레이 동작(stopPropagation·Escape·role="document")을 위해
// 컴포넌트가 전유하므로 타입에서 제외한다. style/className 은 병합되어 소비자 값도 반영된다.
export interface DrawerProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onClick" | "onKeyDown" | "role"> {
	/** 드로어 열림 여부 */
	open: boolean;
	/** 드로어 닫기 콜백 */
	onClose?: () => void;
	/** 슬라이드 방향 (기본값: "right") */
	placement?: DrawerPlacement;
	/** 패널 크기 - left/right 는 너비, bottom 은 높이 (기본값: 360). number ⇒ px */
	size?: number | string;
	/** 드로어 제목 (헤더 h2, heading_small_bold) */
	title?: React.ReactNode;
	/** 하단 액션 영역 (Button들). 미지정 시 footer 영역 자체가 안 보임 */
	footer?: React.ReactNode;
	/** 오버레이 클릭 시 닫기 여부 (기본값: true) */
	closeOnOverlay?: boolean;
	/** 우상단 X 닫기 아이콘 표시 여부 (기본값: true) */
	showCloseIcon?: boolean;
	/** X 닫기 버튼 접근성 레이블 (기본값: "닫기") */
	closeLabel?: string;
	/** 드로어 접근성 레이블 (title 없을 때 사용, 기본값: "Dialog") */
	ariaLabel?: string;
}

// placement 별 진입 시작(=퇴출 도착) transform. 방향 축과 단위(%)를 진입/퇴출 양쪽에서
// 일치시켜야 react-spring 문자열 보간이 올바른 축으로 슬라이드한다.
const SLIDE_FROM: Record<DrawerPlacement, string> = {
	left: "translateX(-100%)",
	right: "translateX(100%)",
	bottom: "translateY(100%)",
};

/**
 * 화면 가장자리에서 미끄러져 들어오는 패널(Drawer)을 렌더링한다.
 * react-spring 기반 방향별 슬라이드 진입/퇴출 + 포커스 트랩 + 바디 스크롤 잠금.
 *
 * @param props 드로어 속성
 * @returns 열림 상태일 때 렌더링된 드로어, 닫힘 상태면 null
 */
export const Drawer = ({
	open,
	onClose,
	placement = "right",
	size = 360,
	title,
	footer,
	closeOnOverlay = true,
	showCloseIcon = true,
	closeLabel = "닫기",
	ariaLabel,
	children,
	className,
	...props
}: DrawerProps) => {
	const panelRef = React.useRef<HTMLDivElement>(null);
	const titleId = React.useId();
	const [shouldRender, setShouldRender] = React.useState(open);
	const reduced = useReducedMotion();
	// 클라이언트 마운트 여부 - 서버/하이드레이션 첫 렌더에서는 포털을 만들지 않아 hydration
	// mismatch(서버 null vs 클라 포털)를 피한다 (Modal/Toast/Alert 와 동일 패턴을 훅으로 공유).
	const isMounted = useIsMounted();

	// 포커스 트랩 - 포털이 실제로 마운트된 뒤(isMounted) 활성화해야 panelRef 가 붙어 있다.
	useFocusTrap(panelRef, open && isMounted);

	// Escape 닫기 - 공유 오버레이 스택에 등록해 최상단일 때만 닫는다 (overlay-stack.ts 참고).
	// Modal/Popover/Tooltip 등과 조합될 때도 "최상단만 닫힘"(APG)이 일관되게 지켜진다.
	// 마운트 전(하이드레이션)엔 등록하지 않아 화면에 없는 드로어가 Escape 스택 순서를 교란하지 않게 한다.
	useOverlayEscape(open && isMounted, () => onClose?.());

	// open 이 true 가 되면 렌더 단계에서 즉시 마운트 플래그를 켠다. effect 로 미루면 (a) 불필요한
	// double render 가 생기고, (b) open 이 곧바로 false 로 바뀌는 극단 케이스에서 shouldRender 가 미처
	// true 가 안 돼 exit 애니메이션이 누락될 수 있다. React "render 중 상태 조정" 패턴 — setState 는 이
	// 컴포넌트 자신만 대상으로 하고 조건이 곧 거짓이 되어 무한 루프가 없다.
	if (open && !shouldRender) setShouldRender(true);

	// 오버레이 opacity 페이드 + presence 라이프사이클(퇴출 완료 후 unmount).
	// 오버레이는 이동하지 않으므로 transform 을 translateY(0px) 로 고정한다.
	const overlayStyle = useSpringPresence({
		visible: open,
		from: "translateY(0px)",
		onExitComplete: () => setShouldRender(false),
	});

	// 패널 슬라이드 - 진입/퇴출 모두 placement 축을 따라 동일 template 로 보간(정확한 reverse).
	const slideFrom = SLIDE_FROM[placement];
	const slideRest = placement === "bottom" ? "translateY(0%)" : "translateX(0%)";
	const panelStyle = useSpring({
		from: { transform: slideFrom },
		to: { transform: open ? slideRest : slideFrom },
		immediate: reduced,
		config: { tension: 280, friction: 28, clamp: !open },
	});

	// 바디 스크롤 잠금 - Modal 과 동일한 data-open-modals 카운터 공유.
	// Modal/Drawer 를 동시에 열거나 중첩해도 카운터가 0 이 될 때만 원래 overflow 를 복원해
	// 스크롤 잠금 오작동/원래 스타일 유실을 막는다.
	React.useEffect(() => {
		if (!open) return;

		const body = document.body;
		const openModals = parseInt(body.dataset.openModals || "0", 10);

		if (openModals === 0) {
			body.dataset.originalOverflow = window.getComputedStyle(body).overflow;
			body.style.overflow = "hidden";
		}

		body.dataset.openModals = String(openModals + 1);

		return () => {
			const currentOpenModals = parseInt(body.dataset.openModals || "1", 10);
			const nextOpenModals = currentOpenModals - 1;

			if (nextOpenModals === 0) {
				body.style.overflow = body.dataset.originalOverflow || "";
				delete body.dataset.openModals;
				delete body.dataset.originalOverflow;
			} else {
				body.dataset.openModals = String(nextOpenModals);
			}
		};
	}, [open]);

	// open 이 true 로 바뀌는 렌더에서 패널을 즉시 마운트해야 useFocusTrap effect 실행 시점에
	// panelRef.current 가 이미 붙어 있어 포커스 트랩이 정상 활성화된다. shouldRender 만 보면
	// 마운트가 한 렌더 늦어(effect 로 세팅) 트랩이 걸리지 않는다. shouldRender 는 퇴출 애니메이션
	// 동안 마운트 유지용.
	if (!open && !shouldRender) return null;

	// SSR/하이드레이션 가드 - 서버(document 없음) 및 클라이언트 첫 렌더(isMounted=false)에서는
	// null 을 반환해 서버/클라 출력을 일치시킨다(hydration mismatch 방지).
	if (typeof document === "undefined" || !isMounted) return null;

	const hasTitle = !!title;
	const sizeValue = typeof size === "number" ? `${size}px` : size;
	const panelSizeStyle = placement === "bottom" ? { height: sizeValue } : { width: sizeValue };

	// 포털로 body 끝에 렌더 - transform/filter 조상 아래서 position: fixed 가 깨지는 문제 방지
	// (Modal/Alert/Toast 와 동일 패턴).
	return createPortal(
		<animated.div
			className={cn("drawer", `drawer_placement_${placement}`)}
			style={overlayStyle}
			role="dialog"
			aria-modal="true"
			aria-labelledby={hasTitle && !ariaLabel ? titleId : undefined}
			aria-label={!hasTitle ? (ariaLabel ?? "Dialog") : ariaLabel}
			onClick={() => closeOnOverlay && onClose?.()}
		>
			<animated.div
				ref={panelRef}
				// {...props} 를 먼저 펼쳐 소비자의 data-*/aria-*/id 등은 통과시키되,
				// 아래 className/style(애니메이션)/role/onClick·onKeyDown 은 컴포넌트가 항상
				// 이기도록 뒤에 배치한다 (오버레이 동작 보호). Escape 는 공유 스택(useOverlayEscape)이
				// 처리하고, 여기서는 그 외 키가 드로어 밖으로 새어 소비자 단축키를 건드리지 않게 막는다.
				{...props}
				className={cn("drawer_panel", className)}
				style={{ ...props.style, ...panelStyle, ...panelSizeStyle }}
				role="document"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
			>
				{showCloseIcon && onClose && (
					<button
						type="button"
						className="drawer_close"
						onClick={onClose}
						aria-label={closeLabel}
					>
						<X size={iconSize.md} aria-hidden="true" />
					</button>
				)}
				{title && (
					<div className="drawer_header">
						<h2 id={titleId} className="drawer_title">
							{title}
						</h2>
					</div>
				)}
				{children && <div className="drawer_body">{children}</div>}
				{footer && <div className="drawer_footer">{footer}</div>}
			</animated.div>
		</animated.div>,
		document.body,
	);
};

Drawer.displayName = "Drawer";
