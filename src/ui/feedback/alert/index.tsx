"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import {
	cn,
	lockBodyScroll,
	unlockBodyScroll,
	useFocusTrap,
	useOverlayEscape,
	usePresence,
} from "../../../utils";
import { Button, type ButtonVariant } from "../../general/button";
import { useLocaleText } from "../../system/locale-provider";
import { Spinner } from "../spinner";
import "./style.scss";

export type AlertTone = "info" | "success" | "warning" | "error";
/** @deprecated `AlertTone` 을 쓰세요. 의미 색은 `tone` 으로 통일했습니다. */
export type AlertVariant = AlertTone;
export type AlertActionsAlign = "left" | "center" | "right";

const ICONS: Record<AlertTone, React.ReactNode> = {
	info: <Info size={iconSize.lg} aria-hidden="true" />,
	success: <CheckCircle2 size={iconSize.lg} aria-hidden="true" />,
	warning: <AlertTriangle size={iconSize.lg} aria-hidden="true" />,
	error: <XCircle size={iconSize.lg} aria-hidden="true" />,
};

export interface AlertOptions {
	/** 의미 색 (기본값: "info") */
	tone?: AlertTone;
	/** @deprecated `tone` 을 쓰세요. 둘 다 주면 `tone` 이 이깁니다. */
	variant?: AlertTone;
	/** 알림 제목 */
	title?: React.ReactNode;
	/** 알림 본문 메시지 */
	message?: React.ReactNode;
	/** 확인 버튼 텍스트 */
	confirmText?: string;
	/** 취소 버튼 텍스트 */
	cancelText?: string;
	/** 취소 버튼 표시 여부 (기본값: false) */
	showCancel?: boolean;
	/**
	 * Destructive 액션 여부. true 시 확인 버튼이 빨간 강조(danger)로 표시되고
	 * 취소 버튼은 outline으로 유지. 위험성을 시각적으로 표현해 사용자가 인지 가능.
	 * (Material/shadcn/Radix 표준 패턴)
	 * @default false
	 */
	destructive?: boolean;
	/** 액션 버튼 정렬 */
	actionsAlign?: AlertActionsAlign;
	/** 변형 아이콘 표시 여부 (기본값: false). 원하면 명시적으로 켜기 */
	showIcon?: boolean;
	/**
	 * 확인 버튼 클릭 시 호출되는 콜백. Promise 를 돌려주면 끝날 때까지 알림이 열린 채 확인 버튼에
	 * 스피너가 돌고 중복 클릭 · 취소 · Escape 가 막힌다. 실패(reject)하면 열린 채 다시 시도할 수 있다.
	 */
	onConfirm?: () => unknown;
	/** 취소 버튼 클릭 시 호출되는 콜백 */
	onCancel?: () => void;
	/**
	 * 오버레이 클릭으로 닫기 허용 여부 (기본값: true).
	 * destructive 확인처럼 실수 닫힘을 막아야 하면 false 로.
	 */
	closeOnOverlay?: boolean;
}

/** `useConfirm()` 옵션 - 취소 버튼은 항상 있고 결과는 Promise 로 받는다 */
export interface ConfirmOptions
	extends Omit<AlertOptions, "onConfirm" | "onCancel" | "showCancel"> {
	/** 확인 직후 실행할 작업. Promise 면 끝날 때까지 pending - 성공해야 `true` 로 끝난다 */
	onConfirm?: () => unknown;
}

interface AlertContextValue {
	showAlert: (options: AlertOptions) => void;
	confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextValue | null>(null);

/**
 * Promise 로 받는 확인 대화상자. 확인하면 `true`, 취소 · Escape · 오버레이로 닫으면 `false` -
 * 어느 경로든 정확히 한 번 resolve 된다. 열려 있는 동안 다시 부르면 앞의 것은 `false` 로 끝나고
 * 새 것으로 바뀐다(교체). `AlertProvider` 를 그대로 쓰므로 애니메이션 · 포커스 트랩이 같다.
 *
 * @example
 * ```tsx
 * const confirm = useConfirm();
 * if (await confirm({ tone: "warning", title: "변경사항을 버릴까요?", confirmText: "버리기", destructive: true })) {
 *   discard();
 * }
 * ```
 */
export const useConfirm = () => useAlert().confirm;

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error(
			"[Bigtablet DS] useAlert는 <AlertProvider> 안에서만 사용 가능합니다.\n\n" +
				"앱 최상단에 <AlertProvider>로 감싸주세요:\n" +
				"  <AlertProvider>\n" +
				"    <YourApp />\n" +
				"  </AlertProvider>",
		);
	}
	return context;
};

interface AlertState extends AlertOptions {
	isOpen: boolean;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [alertState, setAlertState] = useState<AlertState>({ isOpen: false });
	const [pending, setPending] = useState(false);
	// 열려 있는 confirm 의 resolve. 한 번 부르면 비운다 - 어느 경로로 닫혀도 정확히 한 번
	const resolveRef = React.useRef<((ok: boolean) => void) | null>(null);
	// 알림마다 새 번호 - 교체된 뒤 끝난 이전 비동기 작업이 새 알림을 닫지 않게
	const tokenRef = React.useRef(0);

	const settle = useCallback((ok: boolean) => {
		const resolve = resolveRef.current;
		resolveRef.current = null;
		resolve?.(ok);
	}, []);

	// Provider 가 사라지면 기다리는 쪽이 영원히 매달리지 않게 false 로 끝낸다
	React.useEffect(() => () => settle(false), [settle]);

	const showAlert = useCallback(
		(options: AlertOptions) => {
			// 열려 있던 confirm 을 교체한다 - 앞의 것은 확인되지 않았으니 false
			settle(false);
			tokenRef.current++;
			setPending(false);
			setAlertState({ ...options, isOpen: true });
		},
		[settle],
	);

	const confirm = useCallback(
		(options: ConfirmOptions) =>
			new Promise<boolean>((resolve) => {
				showAlert({ ...options, showCancel: true });
				resolveRef.current = resolve;
			}),
		[showAlert],
	);

	const handleClose = useCallback(() => {
		setAlertState((prev) => ({ ...prev, isOpen: false }));
	}, []);

	// 퇴출 애니메이션이 끝나면 페이로드를 버린다. `isOpen: false` 만 두면 `title`·`message`·
	// `onConfirm` 클로저(가 붙잡은 행 데이터 등)가 다음 showAlert 까지 살아 있다.
	// 퇴출 도중에는 내용이 보여야 하므로 그 전에 비우면 빈 패널이 페이드아웃한다.
	const handleExited = useCallback(() => {
		setAlertState((prev) => (prev.isOpen ? prev : { isOpen: false }));
	}, []);

	const handleConfirm = useCallback(() => {
		if (pending) return;
		const token = tokenRef.current;
		const result = alertState.onConfirm?.();
		if (result && typeof (result as Promise<unknown>).then === "function") {
			setPending(true);
			(result as Promise<unknown>).then(
				() => {
					if (token !== tokenRef.current) return;
					setPending(false);
					settle(true);
					handleClose();
				},
				() => {
					// 실패 - 열린 채 다시 시도하거나 취소할 수 있게 둔다. 오류 안내는 작업 쪽 몫
					if (token === tokenRef.current) setPending(false);
				},
			);
			return;
		}
		settle(true);
		handleClose();
	}, [alertState.onConfirm, handleClose, pending, settle]);

	const handleCancel = useCallback(() => {
		// 작업 중에는 닫지 않는다 - 이미 시작된 삭제가 끝났는지 모르는 채 취소로 끝나면 안 된다
		if (pending) return;
		alertState.onCancel?.();
		settle(false);
		handleClose();
	}, [alertState.onCancel, handleClose, pending, settle]);

	return (
		<AlertContext.Provider value={{ showAlert, confirm }}>
			{children}
			<AlertModal
				{...alertState}
				pending={pending}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				onClose={handleCancel}
				onExited={handleExited}
			/>
		</AlertContext.Provider>
	);
};

interface AlertModalProps extends AlertOptions {
	isOpen: boolean;
	/** 확인 작업이 진행 중 - 버튼은 포커스를 유지한 채(aria-disabled) 막힌다 */
	pending?: boolean;
	onClose: () => void;
	/** 퇴출 애니메이션이 끝나 패널이 언마운트된 뒤 - Provider 가 페이로드를 비우는 시점 */
	onExited?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
	isOpen,
	tone: toneProp,
	variant,
	title,
	message,
	confirmText: confirmTextProp,
	cancelText: cancelTextProp,
	showCancel = false,
	destructive = false,
	actionsAlign = "right",
	showIcon = false,
	closeOnOverlay = true,
	pending = false,
	onConfirm,
	onCancel,
	onClose,
	onExited,
}) => {
	const tone = toneProp ?? variant ?? "info";
	const t = useLocaleText();
	const confirmText = confirmTextProp ?? t("alert.confirm");
	const cancelText = cancelTextProp ?? t("alert.cancel");
	// Escape/overlay 닫힘은 취소 동작과 동등해야 한다 (APG alertdialog) - onCancel 경로로
	// 보내 소비자의 취소 정리 로직(롤백 등)이 우회되지 않게 한다.
	const dismiss = onCancel ?? onClose;
	const panelRef = React.useRef<HTMLDivElement>(null);
	// 오버레이에서 누르기 시작했는지 - 패널에서 시작한 드래그를 오버레이에서 놓으면 `click` 이
	// 공통 조상(오버레이)에 디스패치되므로 target 검사만으로는 구분되지 않는다(Modal 과 동일).
	const pressedOverlayRef = React.useRef(false);
	const titleId = React.useId();
	const messageId = React.useId();

	// 퇴출 transition 이 끝날 때까지 마운트를 붙잡는다 (Modal 과 동일). isOpen 이 true 가 되는 렌더에서
	// 바로 마운트해야 useFocusTrap effect 시점에 panelRef 가 붙어 있다 - AlertProvider 는 항상
	// isOpen=false 로 마운트해 두고 showAlert() 로 여는 구조라 모든 useAlert() 경로가 이 성질에 기댄다.
	const overlayRef = React.useRef<HTMLDivElement>(null);
	const shouldRender = usePresence(isOpen, [overlayRef, panelRef], onExited);
	const state = isOpen ? "open" : "closed";

	useFocusTrap(panelRef, isOpen);

	// Escape 닫기 - 공유 오버레이 스택에 등록해 최상단일 때만 닫는다 (overlay-stack.ts 참고).
	// dismiss = onCancel ?? onClose 로 라우팅해 취소 정리 로직이 우회되지 않게 한다 (APG alertdialog).
	// Modal 위에 confirm Alert 를 띄우는 조합에서도 Alert(최상단)만 닫히고 Modal 은 유지된다.
	useOverlayEscape(isOpen, () => dismiss());

	// 바디 스크롤 잠금 - Modal/Drawer 와 동일한 data-open-modals 카운터 공유
	// (Modal 위에서 confirm Alert 를 띄우는 패턴에서도 카운터가 맞게 유지된다).
	// isOpen 대신 shouldRender 에 묶어 퇴출 애니메이션이 끝나 완전히 unmount 될 때까지
	// 잠금을 유지한다 (isOpen 기준이면 닫힘 시작 즉시 풀려 페이드 중 배경이 스크롤됨).
	React.useEffect(() => {
		if (!shouldRender) return;

		lockBodyScroll();
		return () => {
			unlockBodyScroll();
		};
	}, [shouldRender]);

	// isOpen 이 true 로 바뀌는 렌더에서 패널을 즉시 마운트해야 useFocusTrap effect 실행 시점에
	// panelRef.current 가 붙어 있다. shouldRender 는 퇴출 애니메이션 동안 마운트 유지용.
	if (!isOpen && !shouldRender) return null;

	// destructive: confirm을 빨간 filled(danger)로 강조 - 위험성을 시각적으로 표현
	// (Material/shadcn/Radix 표준 - 빨간 버튼 = 위험한 액션)
	const confirmVariant: ButtonVariant = "filled";
	const cancelVariant: ButtonVariant = "outline";

	// 클래스명은 그대로 둔다 - 앱이 `.alert_variant_*` 로 덮어쓰고 있다 (notiiv brand.css)
	const modalClassName = cn("alert_modal", `alert_variant_${tone}`);

	return createPortal(
		// biome-ignore lint/a11y/noStaticElementInteractions: 오버레이 클릭 닫기 - 키보드는 Escape(useOverlayEscape)가 맡는다
		<div
			ref={overlayRef}
			className="alert_overlay"
			data-state={state}
			role="presentation"
			onPointerDown={(e) => {
				pressedOverlayRef.current = e.target === e.currentTarget;
			}}
			onClick={(e) => {
				// 누른 곳과 놓은 곳이 모두 오버레이여야 취소다 - 메시지를 드래그로 선택하다
				// 오버레이에서 놓았다고 확인 대화상자가 취소되면 안 된다.
				if (!closeOnOverlay) return;
				if (e.target !== e.currentTarget) return;
				if (!pressedOverlayRef.current) return;
				dismiss();
			}}
		>
			<div
				ref={panelRef}
				className={modalClassName}
				data-state={state}
				onClick={(e) => e.stopPropagation()}
				// Escape 는 공유 스택(useOverlayEscape)이 처리하고, 여기서는 그 외 키가 알림 밖으로
				// 새어 상위 오버레이/소비자 단축키를 건드리지 않게 막는다.
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
				role="alertdialog"
				aria-modal="true"
				aria-busy={pending || undefined}
				aria-labelledby={title ? titleId : undefined}
				aria-describedby={message ? messageId : undefined}
			>
				{(showIcon || title) && (
					<div className="alert_header">
						{showIcon && (
							<span className={cn("alert_icon", `alert_icon_${tone}`)} aria-hidden="true">
								{ICONS[tone]}
							</span>
						)}
						{title && (
							<div className="alert_title" id={titleId}>
								{title}
							</div>
						)}
					</div>
				)}

				{message && (
					<div className="alert_message" id={messageId}>
						{message}
					</div>
				)}

				<div className={cn("alert_actions", `alert_actions_${actionsAlign}`)}>
					{/* pending 중에는 disabled 대신 aria-disabled - 누른 버튼이 막히면 포커스가 트랩 밖으로 빠진다 */}
					{showCancel && (
						<Button
							variant={cancelVariant}
							size="md"
							radius="md"
							aria-disabled={pending || undefined}
							onClick={onCancel}
						>
							{cancelText}
						</Button>
					)}
					<Button
						variant={confirmVariant}
						danger={destructive}
						size="md"
						radius="md"
						aria-disabled={pending || undefined}
						leadingIcon={
							pending ? (
								<span aria-hidden="true">
									<Spinner size={16} />
								</span>
							) : undefined
						}
						onClick={onConfirm}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>,
		document.body,
	);
};
