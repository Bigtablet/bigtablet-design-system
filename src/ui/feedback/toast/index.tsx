"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, Bell, X } from "lucide-react";
import "./style.scss";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

interface ToastItem {
    id: string;
    message: string;
    variant: ToastVariant;
    duration: number;
}

interface ToastContextValue {
    addToast: (message: string, variant: ToastVariant, duration?: number) => void;
}

export const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
    /** 앱 루트에서 감싸는 자식 요소 */
    children: React.ReactNode;
    /** 최대 동시 표시 토스트 수 (기본값: 5) */
    maxCount?: number;
}

const VARIANT_ICONS: Record<ToastVariant, React.ReactElement> = {
    success: <CheckCircle2 size={18} />,
    error:   <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info:    <Info size={18} />,
    default: <Bell size={18} />,
};

// ── ToastItemComponent ───────────────────────────────────────────────────────

interface ToastItemComponentProps {
    item: ToastItem;
    onRemove: (id: string) => void;
}

/**
 * 개별 토스트 아이템을 렌더링한다.
 * 프로그레스 바 애니메이션이 끝나면 자동으로 닫히고, 닫기 버튼으로 수동 닫기도 가능하다.
 * @param props 토스트 아이템 속성
 * @returns 렌더링된 토스트 아이템
 */
const ToastItemComponent = ({ item, onRemove }: ToastItemComponentProps) => {
    const [exiting, setExiting] = React.useState(false);
    const closingRef = React.useRef(false);

    /**
     * 슬라이드 아웃 애니메이션 후 토스트를 제거한다.
     * @returns void
     */
    const close = React.useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        setExiting(true);
        setTimeout(() => onRemove(item.id), 260);
    }, [item.id, onRemove, closingRef.current, setExiting]);

    const itemClassName = [
        "toast_item",
        exiting && "toast_item_exiting",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={itemClassName}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <span className={`toast_icon toast_icon_${item.variant}`} aria-hidden="true">
                {VARIANT_ICONS[item.variant]}
            </span>

            <span className="toast_message">{item.message}</span>

            <button
                type="button"
                className="toast_close"
                onClick={close}
                aria-label="닫기"
            >
                <X size={14} />
            </button>

            <div
                className={`toast_progress toast_progress_${item.variant}`}
                style={{ "--toast-duration": `${item.duration}ms` } as React.CSSProperties}
                onAnimationEnd={close}
                aria-hidden="true"
            />
        </div>
    );
};

// ── ToastProvider ────────────────────────────────────────────────────────────

/**
 * 토스트 컨텍스트를 제공하는 Provider를 렌더링한다.
 * 앱 최상단에서 children을 감싸야 useToast 훅을 사용할 수 있다.
 * @param props Provider 속성
 * @returns 렌더링된 Provider와 토스트 컨테이너
 */
export const ToastProvider = ({ children, maxCount = 5 }: ToastProviderProps) => {
    const [toasts, setToasts] = React.useState<ToastItem[]>([]);

    /**
     * 토스트를 큐에 추가한다. maxCount를 초과하면 가장 오래된 항목을 제거한다.
     * @param message 표시할 메시지
     * @param variant 토스트 변형
     * @param duration 자동 닫힘 시간(ms), 기본값 3000
     * @returns void
     */
    const addToast = React.useCallback(
        (message: string, variant: ToastVariant, duration = 3000) => {
            const id = Math.random().toString(36).slice(2, 9);
            setToasts(prev => [{ id, message, variant, duration }, ...prev].slice(0, maxCount));
        },
        [maxCount],
    );

    /**
     * 특정 id의 토스트를 큐에서 제거한다.
     * @param id 제거할 토스트 id
     * @returns void
     */
    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="toast_container"
                        aria-live="polite"
                        aria-atomic="false"
                    >
                        {toasts.map(item => (
                            <ToastItemComponent
                                key={item.id}
                                item={item}
                                onRemove={removeToast}
                            />
                        ))}
                    </div>,
                    document.body,
                )}
        </ToastContext.Provider>
    );
};
