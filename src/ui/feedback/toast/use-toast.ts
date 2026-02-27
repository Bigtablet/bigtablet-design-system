"use client";

import { useContext } from "react";
import { ToastContext } from ".";

/**
 * 토스트 메시지를 표시하는 훅.
 * ToastProvider 내부에서만 사용할 수 있다.
 * @returns 토스트 메시지 표시 함수 객체
 */
export const useToast = () => {
    const ctx = useContext(ToastContext);

    if (!ctx) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return {
        /** 성공 메시지를 표시한다 */
        success: (message: string, duration?: number) =>
            ctx.addToast(message, "success", duration),
        /** 오류 메시지를 표시한다 */
        error: (message: string, duration?: number) =>
            ctx.addToast(message, "error", duration),
        /** 경고 메시지를 표시한다 */
        warning: (message: string, duration?: number) =>
            ctx.addToast(message, "warning", duration),
        /** 정보 메시지를 표시한다 */
        info: (message: string, duration?: number) =>
            ctx.addToast(message, "info", duration),
        /** 기본 메시지를 표시한다 */
        message: (message: string, duration?: number) =>
            ctx.addToast(message, "default", duration),
    };
};
