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
	textarea.select();

	let ok = false;
	try {
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
}

export interface UseClipboardResult {
	/** 복사 - 성공하면 true. 실패해도 throw 하지 않는다 (`status`·`error` 로 본다) */
	copy: (text: string) => Promise<boolean>;
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
export function useClipboard({ resetAfter = 2000 }: UseClipboardOptions = {}): UseClipboardResult {
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
		clearTimeout(timer.current);
		setStatus("idle");
		setError(null);
	}, []);

	const copy = React.useCallback(
		async (text: string) => {
			const id = ++seq.current;
			clearTimeout(timer.current);
			setStatus("copying");
			setError(null);

			let ok = true;
			let failure: unknown = null;
			try {
				await copyText(text);
			} catch (e) {
				ok = false;
				failure = e;
			}
			// 언마운트됐거나 그 사이 더 새 복사가 시작됐으면 상태를 건드리지 않는다
			if (!alive.current || id !== seq.current) return ok;

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
