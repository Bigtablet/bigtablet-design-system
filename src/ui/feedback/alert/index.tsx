"use client";

import * as React from "react";
import {createContext, useContext, useState, useCallback} from "react";
import {createPortal} from "react-dom";
import "./style.scss";

export type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertActionsAlign = "left" | "center" | "right";

export interface AlertOptions {
    variant?: AlertVariant;
    title?: React.ReactNode;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    actionsAlign?: AlertActionsAlign;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface AlertContextValue {
    showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

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

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                           children,
                                                                       }) => {
    const [alertState, setAlertState] = useState<AlertState>({
        isOpen: false,
    });

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertState({
            ...options,
            isOpen: true,
        });
    }, []);

    const handleClose = useCallback(() => {
        setAlertState((prev) => ({...prev, isOpen: false}));
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
        <AlertContext.Provider value={{showAlert}}>
            {children}
            {alertState.isOpen &&
                createPortal(
                    <AlertModal
                        {...alertState}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        onClose={handleClose}
                    />,
                    document.body
                )}
        </AlertContext.Provider>
    );
};

interface AlertModalProps extends AlertOptions {
    onClose: () => void;
}

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
    const modalClassName = [
        "alert_modal",
        `alert_variant_${variant}`,
    ]
        .filter(Boolean)
        .join(" ");

    const actionsClassName = [
        "alert_actions",
        `alert_actions_${actionsAlign}`,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="alert_overlay" onClick={onClose}>
            <div
                className={modalClassName}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="alert_title"
                aria-describedby="alert_message"
            >
                {title && (
                    <div className="alert_title" id="alert_title">
                        {title}
                    </div>
                )}

                {message && (
                    <div className="alert_message" id="alert_message">
                        {message}
                    </div>
                )}

                <div className={actionsClassName}>
                    {showCancel && (
                        <button
                            type="button"
                            className="alert_button alert_button_cancel"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        className="alert_button alert_button_confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
