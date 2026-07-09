"use client";

import { animated, useSpring } from "@react-spring/web";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import { cn, useFocusTrap } from "../../../utils";
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
	onConfirm,
	onCancel,
	onClose,
}) => {
	const panelRef = React.useRef<HTMLDivElement>(null);
	const titleId = React.useId();
	const messageId = React.useId();

	const [shouldRender, setShouldRender] = useState(isOpen);

	useFocusTrap(panelRef, isOpen);

	React.useEffect(() => {
		if (isOpen) setShouldRender(true);
	}, [isOpen]);

	const overlayStyle = useSpring({
		opacity: isOpen ? 1 : 0,
		config: { tension: 280, friction: 28, clamp: !isOpen },
		onRest: (result) => {
			if (!isOpen && result.finished) setShouldRender(false);
		},
	});

	const panelStyle = useSpring({
		opacity: isOpen ? 1 : 0,
		transform: isOpen ? "scale(1) translateY(0px)" : "scale(0.96) translateY(-4px)",
		config: { tension: 280, friction: 28, clamp: !isOpen },
	});

	if (!shouldRender) return null;

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
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<animated.div
				ref={panelRef}
				className={modalClassName}
				style={panelStyle}
				onClick={(e) => e.stopPropagation()}
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
