"use client";

import { animated, useSpring } from "@react-spring/web";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import { cn, useFocusTrap, useOverlayEscape, useReducedMotion } from "../../../utils";
import { Button, type ButtonVariant } from "../../general/button";
import "./style.scss";

export type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertActionsAlign = "left" | "center" | "right";

const ICONS: Record<AlertVariant, React.ReactNode> = {
	info: <Info size={iconSize.lg} aria-hidden="true" />,
	success: <CheckCircle2 size={iconSize.lg} aria-hidden="true" />,
	warning: <AlertTriangle size={iconSize.lg} aria-hidden="true" />,
	error: <XCircle size={iconSize.lg} aria-hidden="true" />,
};

export interface AlertOptions {
	/** 알림 스타일 변형 (기본값: "info") */
	variant?: AlertVariant;
	/** 알림 제목 */
	title?: React.ReactNode;
	/** 알림 본문 메시지 */
	message?: React.ReactNode;
	/** 확인 버튼 텍스트 (기본값: "확인") */
	confirmText?: string;
	/** 취소 버튼 텍스트 (기본값: "취소") */
	cancelText?: string;
	/** 취소 버튼 표시 여부 (기본값: false) */
	showCancel?: boolean;
	/**
	 * Destructive 액션 여부. true 시 확인 버튼이 빨간 강조(danger)로 표시되고
	 * 취소 버튼은 outline으로 유지. 위험성을 시각적으로 표현해 사용자가 인지 가능.
	 * (Material/shadcn/Radix 표준 패턴)
	 * @default false
	 */
	destructive?: boolean;
	/** 액션 버튼 정렬 (기본값: "right") */
	actionsAlign?: AlertActionsAlign;
	/** 변형 아이콘 표시 여부 (기본값: false). 원하면 명시적으로 켜기 */
	showIcon?: boolean;
	/** 확인 버튼 클릭 시 호출되는 콜백 */
	onConfirm?: () => void;
	/** 취소 버튼 클릭 시 호출되는 콜백 */
	onCancel?: () => void;
	/**
	 * 오버레이 클릭으로 닫기 허용 여부 (기본값: true).
	 * destructive 확인처럼 실수 닫힘을 막아야 하면 false 로.
	 */
	closeOnOverlay?: boolean;
}

interface AlertContextValue {
	showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error(
			"[Bigtablet DS] useAlert는 <AlertProvider> 안에서만 사용 가능합니다.\n\n" +
				"앱 최상단에 <AlertProvider>로 감싸주세요:\n" +
				"  <AlertProvider>\n" +
				"    <YourApp />\n" +
				"  </AlertProvider>",
		);
	}
	return context;
};

interface AlertState extends AlertOptions {
	isOpen: boolean;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [alertState, setAlertState] = useState<AlertState>({ isOpen: false });

	const showAlert = useCallback((options: AlertOptions) => {
		setAlertState({ ...options, isOpen: true });
	}, []);

	const handleClose = useCallback(() => {
		setAlertState((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const handleConfirm = useCallback(() => {
		alertState.onConfirm?.();
		handleClose();
	}, [alertState.onConfirm, handleClose]);

	const handleCancel = useCallback(() => {
		alertState.onCancel?.();
		handleClose();
	}, [alertState.onCancel, handleClose]);

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			<AlertModal
				{...alertState}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				onClose={handleClose}
			/>
		</AlertContext.Provider>
	);
};

interface AlertModalProps extends AlertOptions {
	isOpen: boolean;
	onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
	isOpen,
	variant = "info",
	title,
	message,
	confirmText = "확인",
	cancelText = "취소",
	showCancel = false,
	destructive = false,
	actionsAlign = "right",
	showIcon = false,
	closeOnOverlay = true,
	onConfirm,
	onCancel,
	onClose,
}) => {
	// Escape/overlay 닫힘은 취소 동작과 동등해야 한다 (APG alertdialog) - onCancel 경로로
	// 보내 소비자의 취소 정리 로직(롤백 등)이 우회되지 않게 한다.
	const dismiss = onCancel ?? onClose;
	const panelRef = React.useRef<HTMLDivElement>(null);
	const titleId = React.useId();
	const messageId = React.useId();

	const [shouldRender, setShouldRender] = useState(isOpen);

	useFocusTrap(panelRef, isOpen);

	// Escape 닫기 - 공유 오버레이 스택에 등록해 최상단일 때만 닫는다 (overlay-stack.ts 참고).
	// dismiss = onCancel ?? onClose 로 라우팅해 취소 정리 로직이 우회되지 않게 한다 (APG alertdialog).
	// Modal 위에 confirm Alert 를 띄우는 조합에서도 Alert(최상단)만 닫히고 Modal 은 유지된다.
	useOverlayEscape(isOpen, () => dismiss());

	// isOpen 이 true 가 되면 렌더 단계에서 즉시 마운트 플래그를 켠다 (Modal 과 동일한
	// React "render 중 상태 조정" 패턴). effect 로 미루면 패널 마운트가 한 렌더 늦어져
	// useFocusTrap effect 실행 시점에 panelRef.current 가 null 이라 트랩(초기 포커스 이동·
	// Tab 격리·포커스 복원)이 전혀 걸리지 않는다 — AlertProvider 는 항상 isOpen=false 로
	// 마운트해 두고 showAlert() 로 여는 구조라 모든 useAlert() 경로에서 재현되는 버그였다.
	if (isOpen && !shouldRender) setShouldRender(true);

	// reduced-motion: 진입/퇴출 모션 없이 즉시 최종 상태 (WCAG 2.3.3). onRest 는 그대로 발화.
	const reduced = useReducedMotion();

	const overlayStyle = useSpring({
		opacity: isOpen ? 1 : 0,
		immediate: reduced,
		config: { tension: 280, friction: 28, clamp: !isOpen },
		onRest: (result) => {
			if (!isOpen && result.finished) setShouldRender(false);
		},
	});

	const panelStyle = useSpring({
		opacity: isOpen ? 1 : 0,
		transform: isOpen ? "scale(1) translateY(0px)" : "scale(0.96) translateY(-4px)",
		immediate: reduced,
		config: { tension: 280, friction: 28, clamp: !isOpen },
	});

	// 바디 스크롤 잠금 - Modal/Drawer 와 동일한 data-open-modals 카운터 공유
	// (Modal 위에서 confirm Alert 를 띄우는 패턴에서도 카운터가 맞게 유지된다).
	// isOpen 대신 shouldRender 에 묶어 퇴출 애니메이션이 끝나 완전히 unmount 될 때까지
	// 잠금을 유지한다 (isOpen 기준이면 닫힘 시작 즉시 풀려 페이드 중 배경이 스크롤됨).
	React.useEffect(() => {
		if (!shouldRender) return;

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
	}, [shouldRender]);

	// isOpen 이 true 로 바뀌는 렌더에서 패널을 즉시 마운트해야 useFocusTrap effect 실행 시점에
	// panelRef.current 가 붙어 있다. shouldRender 는 퇴출 애니메이션 동안 마운트 유지용.
	if (!isOpen && !shouldRender) return null;

	// destructive: confirm을 빨간 filled(danger)로 강조 - 위험성을 시각적으로 표현
	// (Material/shadcn/Radix 표준 - 빨간 버튼 = 위험한 액션)
	const confirmVariant: ButtonVariant = "filled";
	const cancelVariant: ButtonVariant = "outline";

	const modalClassName = cn("alert_modal", `alert_variant_${variant}`);

	return createPortal(
		// biome-ignore lint/a11y/noStaticElementInteractions: modal overlay pattern
		<animated.div
			className="alert_overlay"
			style={overlayStyle}
			role="presentation"
			onClick={() => closeOnOverlay && dismiss()}
		>
			<animated.div
				ref={panelRef}
				className={modalClassName}
				style={panelStyle}
				onClick={(e) => e.stopPropagation()}
				// Escape 는 공유 스택(useOverlayEscape)이 처리하고, 여기서는 그 외 키가 알림 밖으로
				// 새어 상위 오버레이/소비자 단축키를 건드리지 않게 막는다.
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				aria-describedby={message ? messageId : undefined}
			>
				{(showIcon || title) && (
					<div className="alert_header">
						{showIcon && (
							<span className={cn("alert_icon", `alert_icon_${variant}`)} aria-hidden="true">
								{ICONS[variant]}
							</span>
						)}
						{title && (
							<div className="alert_title" id={titleId}>
								{title}
							</div>
						)}
					</div>
				)}

				{message && (
					<div className="alert_message" id={messageId}>
						{message}
					</div>
				)}

				<div className={cn("alert_actions", `alert_actions_${actionsAlign}`)}>
					{showCancel && (
						<Button variant={cancelVariant} size="md" radius="md" onClick={onCancel}>
							{cancelText}
						</Button>
					)}
					<Button
						variant={confirmVariant}
						danger={destructive}
						size="md"
						radius="md"
						onClick={onConfirm}
					>
						{confirmText}
					</Button>
				</div>
			</animated.div>
		</animated.div>,
		document.body,
	);
};
