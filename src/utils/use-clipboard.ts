"use client";

import * as React from "react";

/**
 * 텍스트를 클립보드에 쓴다. 실패하면 reject.
 *
 * 1. `navigator.clipboard.writeText` - 보안 컨텍스트(HTTPS · localhost)에서만 있다.
 * 2. 폴백 `document.execCommand("copy")` - 인앱 브라우저 · HTTP 사내망처럼 Clipboard API 가 없거나
 *    거부될 때. deprecated 지만 아직 이 경로밖에 없는 환경이 있다. 임시 textarea 를 쓰고 원래
 *    선택 영역과 포커스를 되돌린다 - 안 그러면 사용자가 잡아 둔 선택이 사라진다.
 */
export async function copyText(text: string): Promise<void> {
	let apiError: unknown;
	if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return;
		} catch (error) {
			// 권한 거부 등 - 폴백을 시도하고, 그것도 실패하면 원래 오류를 던진다
			apiError = error;
		}
	}
	if (typeof document === "undefined") {
		throw apiError ?? new Error("Clipboard is not available");
	}
	if (!execCopy(text)) {
		throw apiError ?? new Error("Copy command was rejected");
	}
}

function execCopy(text: string): boolean {
	const active = document.activeElement as HTMLElement | null;
	const selection = document.getSelection();
	const ranges = selection
		? // 복제해 둔다 - 스펙상 getRangeAt 은 선택에 묶인 라이브 Range 라 엔진에 따라 select() 때 같이 바뀐다
			Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
		: [];

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	// 화면 밖 고정 - 스크롤을 움직이지 않고, iOS 가 확대하지 않게 글자 크기를 둔다
	textarea.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;font-size:12pt";
	document.body.appendChild(textarea);

	let ok = false;
	try {
		textarea.select();
		// iOS Safari·인앱 웹뷰는 select() 만으로 실제 선택 범위가 잡히지 않는 경우가 있다.
		// readonly textarea 에 범위를 한 번 더 명시해야 execCommand 가 값을 복사한다.
		try {
			textarea.setSelectionRange(0, text.length);
		} catch {
			// 보정 API 가 없는 기존 환경에서는 select() 결과로 계속 시도한다.
		}
		ok = document.execCommand("copy");
	} catch {
		ok = false;
	} finally {
		textarea.remove();
		// 포커스 먼저 - focus() 가 문서 선택을 지우므로 선택 영역은 그 뒤에 되돌린다
		active?.focus?.({ preventScroll: true });
		if (selection) {
			selection.removeAllRanges();
			for (const range of ranges) selection.addRange(range);
		}
	}
	return ok;
}

export type ClipboardStatus = "idle" | "copying" | "copied" | "error";

export interface UseClipboardOptions {
	/** `copied`·`error` 를 `idle` 로 되돌리기까지(ms). 0 이면 되돌리지 않는다 (기본값: 2000) */
	resetAfter?: number;
	/** 성공할 때마다 - 복사한 텍스트를 받는다 */
	onCopy?: (text: string) => void;
	/**
	 * 실패할 때마다 (권한 거부 · API 없음 · 폴백 실패 · 함수 text 의 throw). 같은 오류가 연달아
	 * 나도 매번 불린다 - 상태(`error`)를 effect 로 지켜보면 값이 같아 두 번째를 놓친다.
	 */
	onError?: (error: unknown) => void;
}

export interface UseClipboardResult {
	/**
	 * 복사 - 성공하면 true. 실패해도 throw 하지 않는다 (`status`·`error` 로 본다).
	 * 함수를 주면 그 자리에서 계산하고, 그 함수가 throw 해도 실패(`error`)로 처리한다.
	 */
	copy: (text: string | (() => string)) => Promise<boolean>;
	status: ClipboardStatus;
	/** 마지막 실패의 원인 (`NotAllowedError` 등) */
	error: unknown;
	/** 즉시 `idle` 로 */
	reset: () => void;
}

/**
 * 복사 + 상태(`idle → copying → copied | error → idle`). Toast 등 피드백 방식에는 의존하지 않는다.
 *
 * 연속 클릭하면 마지막 복사만 상태에 반영하고, 되돌림 타이머는 새로 시작한다. 언마운트하면
 * 타이머를 지우고 이후 결과를 무시한다.
 */
export function useClipboard({
	resetAfter = 2000,
	onCopy,
	onError,
}: UseClipboardOptions = {}): UseClipboardResult {
	// 최신 콜백 - copy 의 정체성을 콜백마다 바꾸지 않는다
	const callbacks = React.useRef({ onCopy, onError });
	callbacks.current = { onCopy, onError };
	const [status, setStatus] = React.useState<ClipboardStatus>("idle");
	const [error, setError] = React.useState<unknown>(null);
	const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const seq = React.useRef(0);
	const alive = React.useRef(true);

	React.useEffect(() => {
		alive.current = true;
		return () => {
			alive.current = false;
			clearTimeout(timer.current);
		};
	}, []);

	const reset = React.useCallback(() => {
		// 진행 중인 복사도 무효화 - 안 그러면 끝나는 순간 copied 로 돌아가고 타이머가 다시 돈다
		seq.current++;
		clearTimeout(timer.current);
		setStatus("idle");
		setError(null);
	}, []);

	const copy = React.useCallback(
		async (text: string | (() => string)) => {
			const id = ++seq.current;
			clearTimeout(timer.current);
			setStatus("copying");
			setError(null);

			let ok = true;
			let failure: unknown = null;
			let value = "";
			try {
				value = typeof text === "function" ? text() : text;
				await copyText(value);
			} catch (e) {
				ok = false;
				failure = e;
			}
			// 언마운트됐거나 그 사이 더 새 복사가 시작됐으면 상태를 건드리지 않는다
			if (!alive.current || id !== seq.current) return ok;

			if (ok) callbacks.current.onCopy?.(value);
			else callbacks.current.onError?.(failure);

			setStatus(ok ? "copied" : "error");
			setError(failure);
			if (resetAfter > 0) {
				timer.current = setTimeout(() => {
					setStatus("idle");
					setError(null);
				}, resetAfter);
			}
			return ok;
		},
		[resetAfter],
	);

	return { copy, status, error, reset };
}
