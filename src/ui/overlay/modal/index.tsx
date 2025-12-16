"use client";

import * as React from "react";
import "./style.scss";

export interface ModalProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose?: () => void;
  closeOnOverlay?: boolean;
  width?: number | string;
  title?: React.ReactNode;
}

export const Modal = ({
                        open,
                        onClose,
                        closeOnOverlay = true,
                        width = 520,
                        title,
                        children,
                        className,
                        ...props
                      }: ModalProps) => {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
      <div
          className="modal"
          role="dialog"
          aria-modal="true"
          onClick={() => closeOnOverlay && onClose?.()}
      >
        <div
            className={["modal_panel", className].filter(Boolean).join(" ")}
            style={{ width }}
            onClick={(e) => e.stopPropagation()}
            {...props}
        >
          {title && <div className="modal_header">{title}</div>}
          <div className="modal_body">{children}</div>
        </div>
      </div>
  );
};