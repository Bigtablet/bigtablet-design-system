"use client";

import * as React from "react";
import { useFocusTrap } from "../../../utils/useFocusTrap";
import { cn } from "../../../utils/cn";
import "./style.scss";

export interface ModalProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose?: () => void;
  closeOnOverlay?: boolean;
  width?: number | string;
  title?: React.ReactNode;
  /** Accessible label for the modal (required if no title) */
  ariaLabel?: string;
}

export const Modal = ({
                        open,
                        onClose,
                        closeOnOverlay = true,
                        width = 520,
                        title,
                        ariaLabel,
                        children,
                        className,
                        ...props
                      }: ModalProps) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Focus trap
  useFocusTrap(panelRef, open);

  // Escape key handler
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  const panelClassName = cn("modal_panel", className);

  return (
      <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={title ? "modal-title" : undefined}
          onClick={() => closeOnOverlay && onClose?.()}
      >
        <div
            ref={panelRef}
            className={panelClassName}
            style={{ width }}
            onClick={(e) => e.stopPropagation()}
            {...props}
        >
          {title && <div id="modal-title" className="modal_header">{title}</div>}
          <div className="modal_body">{children}</div>
        </div>
      </div>
  );
};
