"use client";

import * as React from "react";
import { useFocusTrap } from "../../../utils";
import { cn } from "../../../utils";
import "./style.scss";

export interface ModalProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    open: boolean;
    onClose?: () => void;
    closeOnOverlay?: boolean;
    width?: number | string;
    title?: React.ReactNode;
    /** Accessible label for the modal (default uses title or "Dialog") */
    ariaLabel?: string;
}

export const Modal = ({
    open,
    onClose,
    closeOnOverlay = true,
    width = 520,
    title,
    children,
    className,
    ariaLabel,
    ...props
}: ModalProps) => {
    const panelRef = React.useRef<HTMLDivElement>(null);

    // Focus trap
    useFocusTrap(panelRef, open);

    // Escape key handler with useEffectEvent
    const handleEscape = React.useEffectEvent((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose?.();
    });

    React.useEffect(() => {
        if (!open) return;

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open]);

    // Body scroll lock (supports nested modals)
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

    if (!open) return null;

    const panelClassName = cn("modal_panel", className);
    const modalAriaLabel = ariaLabel ?? (typeof title === "string" ? title : "Dialog");

    return (
        <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modalAriaLabel}
            onClick={() => closeOnOverlay && onClose?.()}
        >
            <div
                ref={panelRef}
                className={panelClassName}
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
