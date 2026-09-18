"use client";

import { useContext } from "react";
import { ToastContext, type ToastOptions } from ".";

/**
 * 두 번째 인자는 예전처럼 ms 숫자여도 되고 옵션 객체여도 된다 - 기존 호출을 깨지 않는다.
 */
const toOptions = (durationOrOptions?: number | ToastOptions): ToastOptions | undefined =>
	typeof durationOrOptions === "number" ? { duration: durationOrOptions } : durationOrOptions;

/**
 * 토스트 메시지를 표시하는 훅.
 * ToastProvider 내부에서만 사용할 수 있다.
 * @returns 토스트 표시·닫기·갱신 함수 객체. 표시 함수는 토스트 id 를 반환한다
 */
export const useToast = () => {
	const ctx = useContext(ToastContext);

	if (!ctx) {
		throw new Error(
			"[Bigtablet DS] useToast는 <ToastProvider> 안에서만 사용 가능합니다.\n\n" +
				"앱 최상단에 <ToastProvider>로 감싸주세요:\n" +
				"  <ToastProvider>\n" +
				"    <YourApp />\n" +
				"  </ToastProvider>",
		);
	}

	return {
		/** 성공 메시지를 표시한다. 두 번째 인자는 ms 또는 `{ duration, action }` */
		success: (message: string, options?: number | ToastOptions) =>
			ctx.addToast(message, "success", toOptions(options)),
		/** 오류 메시지를 표시한다 */
		error: (message: string, options?: number | ToastOptions) =>
			ctx.addToast(message, "error", toOptions(options)),
		/** 경고 메시지를 표시한다 */
		warning: (message: string, options?: number | ToastOptions) =>
			ctx.addToast(message, "warning", toOptions(options)),
		/** 정보 메시지를 표시한다 */
		info: (message: string, options?: number | ToastOptions) =>
			ctx.addToast(message, "info", toOptions(options)),
		/** 기본 메시지를 표시한다 */
		message: (message: string, options?: number | ToastOptions) =>
			ctx.addToast(message, "default", toOptions(options)),
		/** id 의 토스트를 닫는다 - 닫기 버튼과 같은 퇴출 모션 */
		dismiss: ctx.dismissToast,
		/** id 의 토스트 내용을 바꾼다 - "업로드 중…" 을 "완료" 로 */
		update: ctx.updateToast,
	};
};
