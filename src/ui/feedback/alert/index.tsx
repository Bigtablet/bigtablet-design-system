"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
  return (
    <div className="alert-overlay" onClick={onClose}>
      <div
        className={`alert-modal alert-modal--${variant}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message">
        {title && (
          <div className="alert-modal__title" id="alert-title">
            {title}
          </div>
        )}
        {message && (
          <div className="alert-modal__message" id="alert-message">
            {message}
          </div>
        )}
        <div className={`alert-modal__actions alert-modal__actions--${actionsAlign}`}>
          {showCancel && (
            <button
              type="button"
              className="alert-modal__button alert-modal__button--cancel"
              onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="alert-modal__button alert-modal__button--confirm"
            onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// 기존 Alert 컴포넌트는 deprecated로 유지
export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  showActions?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  actionsAlign?: AlertActionsAlign;
}

/**
 * @deprecated Use useAlert hook with AlertProvider instead
 */
export const Alert = ({
  variant = "info",
  title,
  icon,
  closable,
  onClose,
  showActions = false,
  onConfirm,
  onCancel,
  confirmText = "확인",
  cancelText = "취소",
  actionsAlign = "left",
  className,
  children,
  ...props
}: AlertProps) => {
  return (
    <div
      className={["alert", `alert--${variant}`, closable && "alert--closable", className]
        .filter(Boolean)
        .join(" ")}
      role="alert"
      aria-live="polite"
      {...props}>
      {icon && (
        <span className="alert__icon" aria-hidden="true">
          {icon}
        </span>
      )}

      <div className="alert__content">
        {title && <div className="alert__title">{title}</div>}
        {children && <div className="alert__desc">{children}</div>}

        {showActions && (
          <div className={`alert__actions alert__actions--${actionsAlign}`}>
            {onCancel && (
              <button
                type="button"
                className="alert__button alert__button--cancel"
                onClick={onCancel}>
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                className="alert__button alert__button--confirm"
                onClick={onConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>

      {closable && (
        <button
          type="button"
          className="alert__close"
          aria-label="닫기"
          onClick={onClose}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};
