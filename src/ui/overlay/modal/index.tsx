"use client";

import { animated, useSpring } from "@react-spring/web";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import {
	cn,
	lockBodyScroll,
	unlockBodyScroll,
	useFocusTrap,
	useIsMounted,
	useOverlayEscape,
	useReducedMotion,
} from "../../../utils";
import "./style.scss";

export type ModalFooterAlign = "end" | "between" | "start";

// onClick/onKeyDown/onPointerDown 은 오버레이 동작(오버레이 닫기 판정·Escape 격리)을 위해
// 컴포넌트가 전유하므로 타입에서 제외한다. style/className 은 병합되어 소비자 값도 반영된다.
export interface ModalProps
	extends Omit<
		React.HTMLAttributes<HTMLDivElement>,
		"title" | "onClick" | "onKeyDown" | "onPointerDown"
	> {
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
	/**
	 * 모달 접근성 레이블. `title` 이 없으면 이 값이 유일한 접근성 이름이다 - 폴백이 없으므로
	 * 둘 다 비우면 이름 없는 대화상자가 되고 axe `aria-dialog-name` 이 잡는다.
	 */
	ariaLabel?: string;
	/**
	 * 퇴출 애니메이션이 끝나 패널이 실제로 언마운트된 뒤 호출된다.
	 * `open` 을 끈 직후가 아니라 이 시점에 상세 데이터를 비워야 본문만 먼저 사라지지 않는다.
	 */
	onExited?: () => void;
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
	onExited,
	...props
}: ModalProps) => {
	const panelRef = React.useRef<HTMLDivElement>(null);
	// 오버레이에서 누르기 시작했는지 - 패널에서 시작한 드래그를 오버레이에서 놓으면 `click` 이
	// 공통 조상인 오버레이에 디스패치되므로, target 검사만으로는 진짜 오버레이 클릭과 구분되지 않는다.
	const pressedOverlayRef = React.useRef(false);
	const titleId = React.useId();
	const [shouldRender, setShouldRender] = React.useState(open);
	// 클라이언트 마운트 여부 - 서버/하이드레이션 첫 렌더에서는 포털을 만들지 않아 hydration
	// mismatch(서버 null vs 클라 포털)를 피한다. Toast/Alert 와 동일한 패턴을 훅으로 공유.
	const isMounted = useIsMounted();

	// 포커스 트랩 - 포털이 실제로 마운트된 뒤(isMounted) 활성화해야 panelRef 가 붙어 있다.
	useFocusTrap(panelRef, open && isMounted);

	// Escape 닫기 - 공유 오버레이 스택에 등록해 최상단일 때만 닫는다 (overlay-stack.ts 참고).
	// Tooltip/Popover 등 다른 오버레이와 조합될 때도 "최상단만 닫힘"(APG)이 일관되게 지켜진다.
	// 마운트 전(하이드레이션)엔 등록하지 않아 화면에 없는 모달이 Escape 스택 순서를 교란하지 않게 한다.
	useOverlayEscape(open && isMounted, () => onClose?.());

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
			if (open || !result.finished) return;
			setShouldRender(false);
			// 열린 적 없는 모달의 스프링은 목표값에 이미 있어 onRest 가 발화하지 않으므로 별도
			// 가드를 두지 않는다. 그 가정은 "열린 적 없으면 onExited 없음" 테스트가 지킨다.
			onExited?.();
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

		lockBodyScroll();
		return unlockBodyScroll;
	}, [open]);

	// open 이 true 로 바뀌는 렌더에서 패널을 즉시 마운트해야 useFocusTrap effect 실행 시점에
	// panelRef.current 가 이미 붙어 있어 포커스 트랩이 정상 활성화된다. shouldRender 만 보면
	// 마운트가 한 렌더 늦어 트랩이 걸리지 않는다. shouldRender 는 퇴출 애니메이션 동안 마운트 유지용.
	if (!open && !shouldRender) return null;

	// SSR/하이드레이션 가드 - 서버(document 없음) 및 클라이언트 첫 렌더(isMounted=false)에서는
	// null 을 반환해 서버/클라 출력을 일치시킨다(hydration mismatch 방지). 마운트 후 open&&isMounted
	// 가 되는 렌더에서 패널이 붙고 useFocusTrap 이 그 시점에 활성화된다.
	if (typeof document === "undefined" || !isMounted) return null;

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
			aria-label={ariaLabel}
			onPointerDown={(e) => {
				pressedOverlayRef.current = e.target === e.currentTarget;
			}}
			onClick={(e) => {
				// 누른 곳과 놓은 곳이 모두 오버레이여야 닫는다. 패널에서 시작한 드래그(텍스트 선택 등)를
				// 오버레이에서 놓아도 닫히지 않는다 - 폼 모달에서 입력이 사라지던 원인.
				if (!closeOnOverlay) return;
				if (e.target !== e.currentTarget) return;
				if (!pressedOverlayRef.current) return;
				onClose?.();
			}}
		>
			<animated.div
				ref={panelRef}
				// {...props} 를 먼저 펼쳐 소비자의 data-*/aria-*/id/role 등은 통과시키되,
				// 아래 className/style(애니메이션)/onKeyDown 은 컴포넌트가 항상 이기도록 뒤에 배치한다.
				// Escape 는 공유 스택(useOverlayEscape)이 처리하고, 여기서는 그 외 키가 모달 밖으로
				// 새어 소비자 단축키를 건드리지 않게 막는다.
				// 패널 클릭을 stopPropagation 하지 않는다 - 오버레이가 target 으로 판정하므로 불필요하고,
				// 소비자 핸들러가 상위에서 이벤트를 못 받는 부작용만 남는다.
				{...props}
				className={cn("modal_panel", className)}
				style={{ ...props.style, ...panelStyle, width }}
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
			>
				{showCloseIcon && onClose && (
					<button type="button" className="modal_close" onClick={onClose} aria-label={closeLabel}>
						<X size={iconSize.md} aria-hidden="true" />
					</button>
				)}
				{title && (
					<h2 id={titleId} className="modal_title">
						{title}
					</h2>
				)}
				{description && <div className="modal_description">{description}</div>}
				{children && (
					// 본문이 스크롤 컨테이너라 키보드로도 스크롤할 수 있어야 한다(axe
					// `scrollable-region-focusable`). 넘치는지 여부를 측정해 조건부로 주는 방법도 있지만
					// ResizeObserver 를 들일 만큼의 이득이 없고, 포커스 트랩 안에서 탭 정지 하나가
					// 늘어나는 정도의 비용이다.
					<div className="modal_body" tabIndex={0}>
						{children}
					</div>
				)}
				{footer && (
					<div className={cn("modal_footer", `modal_footer_${footerAlign}`)}>{footer}</div>
				)}
			</animated.div>
		</animated.div>,
		document.body,
	);
};
