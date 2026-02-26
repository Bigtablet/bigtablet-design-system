"use client";

import * as React from "react";
import { useFocusTrap } from "../../../utils";
import { cn } from "../../../utils";
import "./style.scss";

export interface ModalProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    /** 모달 열림 여부 */
    open: boolean;
    /** 모달 닫기 콜백 */
    onClose?: () => void;
    /** 오버레이 클릭 시 닫기 여부 (기본값: true) */
    closeOnOverlay?: boolean;
    /** 모달 패널 너비 (기본값: 520) */
    width?: number | string;
    /** 모달 헤더에 표시할 제목 */
    title?: React.ReactNode;
    /** 모달 접근성 레이블(기본값: title 또는 "Dialog") */
    ariaLabel?: string;
}

/**
 * 모달을 렌더링한다.
 * 포커스 트랩과 스크롤 잠금을 적용하고, 열림 상태에 따라 오버레이/패널을 구성한다.
 * @param props 모달 속성
 * @returns 열림 상태일 때 렌더링된 모달, 닫힘 상태면 null
 */
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

    // 포커스 트랩
    useFocusTrap(panelRef, open);

    /**
     * Escape 키 입력 시 닫기 동작을 처리한다.
     * @param e 키보드 이벤트
     * @returns void
     */
    const handleEscape = React.useEffectEvent((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose?.();
    });

    React.useEffect(() => {
        if (!open) return;

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open]);

    // 바디 스크롤 잠금(중첩 모달 지원)
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
