"use client";

import { animated, useSpring } from "@react-spring/web";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import { cn, useFocusTrap, useOverlayEscape, useReducedMotion } from "../../../utils";
import "./style.scss";

export type ModalFooterAlign = "end" | "between" | "start";

// onClick/onKeyDown/role 은 오버레이 동작(stopPropagation·Escape·role="document")을 위해
// 컴포넌트가 전유하므로 타입에서 제외한다. style/className 은 병합되어 소비자 값도 반영된다.
export interface ModalProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onClick" | "onKeyDown" | "role"> {
	/** 모달 열림 여부 */
	open: boolean;
	/** 모달 닫기 콜백 */
	onClose?: () => void;
	/** 오버레이 클릭 시 닫기 여부 (기본값: true) */
	closeOnOverlay?: boolean;
	/** 모달 패널 너비 (기본값: 480) */
	width?: number | string;
	/** 모달 제목 (h2, heading_large_bold) */
	title?: React.ReactNode;
	/** 제목 아래 본문 설명 - paragraph로 자동 wrap */
	description?: React.ReactNode;
	/** 하단 액션 영역 (Button들). 미지정 시 footer 영역 자체가 안 보임 */
	footer?: React.ReactNode;
	/** Footer 정렬 (기본값: "end"). between은 좌우 분리 패턴 (destructive 액션 등) */
	footerAlign?: ModalFooterAlign;
	/** 우상단 X 닫기 아이콘 표시 여부 (기본값: true) */
	showCloseIcon?: boolean;
	/** X 닫기 버튼 접근성 레이블 (기본값: "닫기") */
	closeLabel?: string;
	/** 모달 접근성 레이블(기본값: title 또는 "Dialog") */
	ariaLabel?: string;
}

/**
 * 모달을 렌더링한다.
 * react-spring 기반 진입/퇴출 모션 + 포커스 트랩 + 바디 스크롤 잠금.
 * @param props 모달 속성
 * @returns 열림 상태일 때 렌더링된 모달, 닫힘 상태면 null
 */
export const Modal = ({
	open,
	onClose,
	closeOnOverlay = true,
	width = 480,
	title,
	description,
	footer,
	footerAlign = "end",
	showCloseIcon = true,
	closeLabel = "닫기",
	children,
	className,
	ariaLabel,
	...props
}: ModalProps) => {
	const panelRef = React.useRef<HTMLDivElement>(null);
	const titleId = React.useId();
	const [shouldRender, setShouldRender] = React.useState(open);

	// 포커스 트랩
	useFocusTrap(panelRef, open);

	// Escape 닫기 - 공유 오버레이 스택에 등록해 최상단일 때만 닫는다 (overlay-stack.ts 참고).
	// Tooltip/Popover 등 다른 오버레이와 조합될 때도 "최상단만 닫힘"(APG)이 일관되게 지켜진다.
	useOverlayEscape(open, () => onClose?.());

	// open 이 true 가 되면 렌더 단계에서 즉시 마운트 플래그를 켠다. effect 로 미루면 (a) 불필요한
	// double render 가 생기고, (b) open 이 곧바로 false 로 바뀌는 극단 케이스에서 shouldRender 가 미처
	// true 가 안 돼 exit 애니메이션이 누락될 수 있다. React "render 중 상태 조정" 패턴 — setState 는 이
	// 컴포넌트 자신만 대상으로 하고 조건이 곧 거짓이 되어 무한 루프가 없다.
	if (open && !shouldRender) setShouldRender(true);

	// reduced-motion: 진입/퇴출 모션 없이 즉시 최종 상태 (WCAG 2.3.3). onRest 는 그대로 발화.
	const reduced = useReducedMotion();

	// Spring: overlay (opacity) - onRest 로 exit 완료 후 unmount
	const overlayStyle = useSpring({
		opacity: open ? 1 : 0,
		immediate: reduced,
		config: { tension: 280, friction: 28, clamp: !open },
		onRest: (result) => {
			if (!open && result.finished) setShouldRender(false);
		},
	});

	// Spring: panel (opacity + scale + translateY)
	const panelStyle = useSpring({
		opacity: open ? 1 : 0,
		transform: open ? "scale(1) translateY(0px)" : "scale(0.96) translateY(-4px)",
		immediate: reduced,
		config: { tension: 280, friction: 28, clamp: !open },
	});

	// 바디 스크롤 잠금(중첩 모달 지원)
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
	// 마운트가 한 렌더 늦어 트랩이 걸리지 않는다. shouldRender 는 퇴출 애니메이션 동안 마운트 유지용.
	if (!open && !shouldRender) return null;

	// SSR 가드 - 포털 대상(document.body)이 서버에는 없다. 클라이언트 하이드레이션 후
	// 첫 렌더부터 포털이 붙으므로(commit 시점, effect 이전) 포커스 트랩 타이밍은 유지된다.
	if (typeof document === "undefined") return null;

	const hasTitle = !!title;

	// 포털로 body 끝에 렌더 - 트리거 위치 인라인 렌더는 transform/filter 조상 아래서
	// position: fixed 의 containing block 이 뷰포트가 아니게 되어 오버레이가 깨진다
	// (이 DS 자체가 useSpringHover 등 transform 을 광범위하게 사용). Alert/Toast 와 동일 패턴.
	return createPortal(
		<animated.div
			className="modal"
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
				// 처리하고, 여기서는 그 외 키가 모달 밖으로 새어 소비자 단축키를 건드리지 않게 막는다.
				{...props}
				className={cn("modal_panel", className)}
				style={{ ...props.style, ...panelStyle, width }}
				role="document"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
			>
				{showCloseIcon && onClose && (
					<button
						type="button"
						className="modal_close"
						onClick={onClose}
						aria-label={closeLabel}
					>
						<X size={iconSize.md} aria-hidden="true" />
					</button>
				)}
				{title && (
					<h2 id={titleId} className="modal_title">
						{title}
					</h2>
				)}
				{description && <div className="modal_description">{description}</div>}
				{children && <div className="modal_body">{children}</div>}
				{footer && (
					<div className={cn("modal_footer", `modal_footer_${footerAlign}`)}>{footer}</div>
				)}
			</animated.div>
		</animated.div>,
		document.body,
	);
};
