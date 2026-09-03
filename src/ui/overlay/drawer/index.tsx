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
	useSpringPresence,
} from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

/** Drawer 가 미끄러져 들어오는 방향 (top 은 범위 외) */
export type DrawerPlacement = "left" | "right" | "bottom";

// onClick/onKeyDown/onPointerDown 은 오버레이 동작(오버레이 닫기 판정·Escape 격리)을 위해
// 컴포넌트가 전유하므로 타입에서 제외한다. style/className 은 병합되어 소비자 값도 반영된다.
export interface DrawerProps
	extends Omit<
		React.HTMLAttributes<HTMLDivElement>,
		"title" | "onClick" | "onKeyDown" | "onPointerDown"
	> {
	/** 드로어 열림 여부 */
	open: boolean;
	/** 드로어 닫기 콜백 */
	onClose?: () => void;
	/** 슬라이드 방향 */
	placement?: DrawerPlacement;
	/** 패널 크기 - left/right 는 너비, bottom 은 높이 (기본값: 360). number ⇒ px */
	size?: number | string;
	/** 드로어 제목 (헤더 h2, heading_small_bold) */
	title?: React.ReactNode;
	/** 하단 액션 영역 (Button들). 미지정 시 footer 영역 자체가 안 보임 */
	footer?: React.ReactNode;
	/** 오버레이 클릭 시 닫기 여부 (기본값: true) */
	closeOnOverlay?: boolean;
	/**
	 * Escape 와 오버레이 클릭을 한 축으로 묶는다. 사용자에게는 둘 다 "실수로 닫기" 축이라
	 * 따로 다루면 한쪽만 막는 실수가 나온다. `false` 면 두 경로 모두 닫지 않는다.
	 *
	 * 주면 `closeOnOverlay` 를 이긴다. 안 주면 기존 동작 그대로다 - 오버레이는
	 * `closeOnOverlay`(기본 `true`), Escape 는 항상 켜짐.
	 */
	dismissible?: boolean;

	/** 우상단 X 닫기 아이콘 표시 여부 (기본값: true) */
	showCloseIcon?: boolean;
	/** X 닫기 버튼 접근성 레이블 */
	closeLabel?: string;
	/**
	 * 드로어 접근성 레이블. `title` 이 없을 때 이 값이 접근성 이름이 된다.
	 * 둘 다 비우면 이름 없는 대화상자가 되고 axe `aria-dialog-name` 이 잡는다.
	 */
	ariaLabel?: string;
	/**
	 * 퇴출 애니메이션이 끝나 패널이 실제로 언마운트된 뒤 호출된다.
	 * `open` 을 끈 직후가 아니라 이 시점에 상세 데이터를 비워야 본문만 먼저 사라지지 않는다.
	 */
	onExited?: () => void;
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
	dismissible,
	showCloseIcon = true,
	closeLabel: closeLabelProp,
	ariaLabel,
	onExited,
	children,
	className,
	...props
}: DrawerProps) => {
	const t = useLocaleText();
	const closeLabel = closeLabelProp ?? t("drawer.close");
	// 퇴출 애니메이션 동안 내용을 붙잡는다. 부모가 `open` 과 내용을 같은 값에 묶으면 닫는 tick 에
	// 내용이 먼저 비어, 빈 패널이 슬라이드아웃한다 - 두 단계로 닫히는 것이 눈에 보인다. 마지막으로
	// 열려 있던 값을 기억해 그 동안 그대로 그린다. 다시 열리면 `open` 이 true 라 새 값이 즉시 이긴다.
	//
	// 세 슬롯을 함께 얼린다. `children` 만 얼리면 같은 데이터에 묶인 `footer`(선택 항목에 종속된
	// 삭제 버튼 등)나 `title` 만 먼저 사라져 같은 버그가 다른 슬롯에서 재현된다.
	const lastContentRef = React.useRef({ children, title, footer });
	if (open) lastContentRef.current = { children, title, footer };
	const content = open ? { children, title, footer } : lastContentRef.current;
	// Escape·오버레이를 한 축으로 - dismissible 을 주면 그것이 이긴다.
	const overlayDismissible = dismissible ?? closeOnOverlay;
	const escapeDismissible = dismissible ?? true;

	const panelRef = React.useRef<HTMLDivElement>(null);
	// 오버레이 닫기 판정용 - pointerdown 이 오버레이에서 시작했는지 기억한다.
	const pressedOverlayRef = React.useRef(false);
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
	// 등록 조건에 escapeDismissible 을 넣지 않는다. 등록하지 않으면 이 오버레이가 스택 최상단
	// 자리를 비워, Escape 가 아래에 있는 다른 오버레이로 내려가 그것이 대신 닫힌다. 등록해서
	// 최상단을 차지하고 - 스택이 stopImmediatePropagation 으로 전파를 끊는다 - 닫을지만 여기서 판정한다.
	useOverlayEscape(open && isMounted, () => {
		if (escapeDismissible) onClose?.();
	});

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
		onExitComplete: () => {
			setShouldRender(false);
			// 열린 적 없는 드로어의 스프링은 from 과 to 가 같아 onRest 가 발화하지 않으므로 별도
			// 가드를 두지 않는다. 그 가정은 "열린 적 없으면 onExited 없음" 테스트가 지킨다.
			onExited?.();
		},
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
		// `open` 이 아니라 `shouldRender` 에 묶는다. `open` 기준이면 닫기 시작 즉시 cleanup 이
		// 돌아 `scrollbar-gutter` 와 `padding-right` 보정이 풀리는데, 오버레이는 퇴출
		// 애니메이션이 끝날 때까지(= shouldRender false) 계속 렌더된다. 그 구간에서 ICB 가
		// 거터만큼 줄어 오버레이가 거터를 못 덮고(빈 띠) 배경 콘텐츠가 그만큼 튄다.
		if (!shouldRender) return;

		lockBodyScroll();
		return unlockBodyScroll;
	}, [shouldRender]);

	// open 이 true 로 바뀌는 렌더에서 패널을 즉시 마운트해야 useFocusTrap effect 실행 시점에
	// panelRef.current 가 이미 붙어 있어 포커스 트랩이 정상 활성화된다. shouldRender 만 보면
	// 마운트가 한 렌더 늦어(effect 로 세팅) 트랩이 걸리지 않는다. shouldRender 는 퇴출 애니메이션
	// 동안 마운트 유지용.
	if (!open && !shouldRender) return null;

	// SSR/하이드레이션 가드 - 서버(document 없음) 및 클라이언트 첫 렌더(isMounted=false)에서는
	// null 을 반환해 서버/클라 출력을 일치시킨다(hydration mismatch 방지).
	if (typeof document === "undefined" || !isMounted) return null;

	const hasTitle = !!content.title;
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
			aria-label={ariaLabel}
			onPointerDown={(e) => {
				pressedOverlayRef.current = e.target === e.currentTarget;
			}}
			onClick={(e) => {
				// 누른 곳과 놓은 곳이 모두 오버레이여야 닫는다. 패널에서 시작한 드래그(텍스트 선택 등)를
				// 오버레이에서 놓아도 닫히지 않는다 - 폼 드로어에서 입력이 사라지던 원인.
				if (!overlayDismissible) return;
				if (e.target !== e.currentTarget) return;
				if (!pressedOverlayRef.current) return;
				onClose?.();
			}}
		>
			<animated.div
				ref={panelRef}
				// {...props} 를 먼저 펼쳐 소비자의 data-*/aria-*/id/role 등은 통과시키되,
				// 아래 className/style(애니메이션)/onKeyDown 은 컴포넌트가 항상 이기도록 뒤에 배치한다.
				// Escape 는 공유 스택(useOverlayEscape)이 처리하고, 여기서는 그 외 키가 드로어 밖으로
				// 새어 소비자 단축키를 건드리지 않게 막는다.
				// 패널 클릭을 stopPropagation 하지 않는다 - 오버레이가 target 으로 판정하므로 불필요하고,
				// 소비자 핸들러가 상위에서 이벤트를 못 받는 부작용만 남는다.
				{...props}
				className={cn("drawer_panel", className)}
				style={{ ...props.style, ...panelStyle, ...panelSizeStyle }}
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
			>
				{showCloseIcon && onClose && (
					<button type="button" className="drawer_close" onClick={onClose} aria-label={closeLabel}>
						<X size={iconSize.md} aria-hidden="true" />
					</button>
				)}
				{content.title && (
					<div className="drawer_header">
						<h2 id={titleId} className="drawer_title">
							{content.title}
						</h2>
					</div>
				)}
				{content.children && (
					// 본문이 스크롤 컨테이너라 키보드로도 스크롤할 수 있어야 한다(axe
					// `scrollable-region-focusable`). 다만 초기 포커스 대상에서는 제외한다 - 안쪽에
					// 첫 입력이 있는데 빈 wrapper 에 포커스가 놓이면 열자마자 어디에 있는지 알 수 없다.
					<div className="drawer_body" tabIndex={0} data-focus-trap-skip-autofocus="">
						{content.children}
					</div>
				)}
				{content.footer && <div className="drawer_footer">{content.footer}</div>}
			</animated.div>
		</animated.div>,
		document.body,
	);
};

Drawer.displayName = "Drawer";
