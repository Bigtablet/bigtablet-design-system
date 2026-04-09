"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { cn, useFocusTrap } from "../../../utils";
import "./style.scss";

export type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertActionsAlign = "left" | "center" | "right";

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
	/** 액션 버튼 정렬 (기본값: "right") */
	actionsAlign?: AlertActionsAlign;
	/** 확인 버튼 클릭 시 호출되는 콜백 */
	onConfirm?: () => void;
	/** 취소 버튼 클릭 시 호출되는 콜백 */
	onCancel?: () => void;
}

interface AlertContextValue {
	showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

/**
 * AlertContext를 사용하는 훅.
 * Provider 외부에서 호출되면 오류를 던진다.
 * @returns alert 컨트롤러
 */
export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("useAlert must be used within AlertProvider");
	}
	return context;
};

interface AlertState extends AlertOptions {
	isOpen: boolean;
}

/**
 * 알림 모달을 제어하는 Provider를 렌더링한다.
 * 내부 상태를 통해 AlertModal 표시와 확인/취소 흐름을 관리한다.
 * @param props Provider 속성
 * @returns 렌더링된 Provider와 모달
 */
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [alertState, setAlertState] = useState<AlertState>({
		isOpen: false,
	});

	/**
	 * 알림을 열고 옵션을 상태로 반영한다.
	 * @param options 알림 옵션
	 * @returns void
	 */
	const showAlert = useCallback((options: AlertOptions) => {
		setAlertState({
			...options,
			isOpen: true,
		});
	}, []);

	/**
	 * 알림을 닫는다.
	 * @returns void
	 */
	const handleClose = useCallback(() => {
		setAlertState((prev) => ({ ...prev, isOpen: false }));
	}, []);

	/**
	 * 확인 동작을 실행하고 알림을 닫는다.
	 * @returns void
	 */
	const handleConfirm = useCallback(() => {
		alertState.onConfirm?.();
		handleClose();
	}, [alertState.onConfirm, handleClose]);

	/**
	 * 취소 동작을 실행하고 알림을 닫는다.
	 * @returns void
	 */
	const handleCancel = useCallback(() => {
		alertState.onCancel?.();
		handleClose();
	}, [alertState.onCancel, handleClose]);

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			{alertState.isOpen &&
				createPortal(
					<AlertModal
						{...alertState}
						onConfirm={handleConfirm}
						onCancel={handleCancel}
						onClose={handleClose}
					/>,
					document.body,
				)}
		</AlertContext.Provider>
	);
};

interface AlertModalProps extends AlertOptions {
	onClose: () => void;
}

/**
 * AlertModal을 렌더링한다.
 * 옵션에 따라 제목/메시지/액션 버튼을 구성하고 오버레이 닫기를 처리한다.
 * @param props 모달 속성
 * @returns 렌더링된 알림 모달
 */
const AlertModal: React.FC<AlertModalProps> = ({
	variant = "info",
	title,
	message,
	confirmText = "확인",
	cancelText = "취소",
	showCancel = false,
	actionsAlign = "right",
	onConfirm,
	onCancel,
	onClose,
}) => {
	const panelRef = React.useRef<HTMLDivElement>(null);
	const titleId = React.useId();
	const messageId = React.useId();
	useFocusTrap(panelRef, true);

	const modalClassName = cn("alert_modal", `alert_variant_${variant}`);
	const actionsClassName = cn("alert_actions", `alert_actions_${actionsAlign}`);

	return (
		<div
			className="alert_overlay"
			role="presentation"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<div
				ref={panelRef}
				className={modalClassName}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => { if (e.key !== "Escape") e.stopPropagation(); }}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={messageId}
			>
				{title && (
					<div className="alert_title" id={titleId}>
						{title}
					</div>
				)}

				{message && (
					<div className="alert_message" id={messageId}>
						{message}
					</div>
				)}

				<div className={actionsClassName}>
					{showCancel && (
						<button type="button" className="alert_button alert_button_cancel" onClick={onCancel}>
							{cancelText}
						</button>
					)}
					<button type="button" className="alert_button alert_button_confirm" onClick={onConfirm}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};
