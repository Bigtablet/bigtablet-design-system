"use client";

import { animated } from "@react-spring/web";
import { AlertTriangle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import { useIsMounted, useSpringPresence } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

export interface ToastAction {
	/** 버튼 라벨 - "실행 취소" 등 */
	label: string;
	/** 누르면 실행되고, 이어서 토스트가 닫힌다 */
	onClick: () => void;
}

export interface ToastOptions {
	/** 자동 닫힘까지의 ms (기본값: 3000). `Infinity` 면 닫기 버튼·`dismiss` 로만 닫힌다 - 진행 토스트용 */
	duration?: number;
	/** 메시지 옆 버튼. 한 번 누를 수 있는 되돌리기 같은 동작에 쓴다 */
	action?: ToastAction;
}

/** `update` 로 바꿀 수 있는 필드. `action: null` 이면 버튼을 뗀다 */
export type ToastPatch = Partial<{
	message: string;
	variant: ToastVariant;
	duration: number;
	action: ToastAction | null;
}>;

interface ToastItem {
	id: string;
	message: string;
	variant: ToastVariant;
	duration: number;
	action?: ToastAction;
	/** 퇴출 중(maxCount 에 밀렸거나 dismiss 됨). 잘라내지 않고 표시만 해서 수동 닫기와 같은 경로로 사라지게 한다 */
	dismissing?: boolean;
}

interface ToastContextValue {
	addToast: (message: string, variant: ToastVariant, options?: ToastOptions) => string;
	dismissToast: (id: string) => void;
	updateToast: (id: string, patch: ToastPatch) => void;
}

export const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
	/** 앱 루트에서 감싸는 자식 요소 */
	children: React.ReactNode;
	/** 최대 동시 표시 토스트 수 (기본값: 5) */
	maxCount?: number;
	/** 토스트 닫기 버튼의 aria-label */
	closeAriaLabel?: string;
	/** 토스트 리전(`role="region"`)의 접근성 이름 (기본값: "알림"). 스크린리더의 리전 목록에 뜬다 */
	regionLabel?: string;
}

const VARIANT_ICONS: Record<ToastVariant, React.ReactElement> = {
	success: <CheckCircle2 size={iconSize.md} />,
	error: <XCircle size={iconSize.md} />,
	warning: <AlertTriangle size={iconSize.md} />,
	info: <Info size={iconSize.md} />,
	default: <Bell size={iconSize.md} />,
};

// ── ToastItemComponent ───────────────────────────────────────────────────────

interface ToastItemComponentProps {
	item: ToastItem;
	onRemove: (id: string) => void;
	closeAriaLabel: string;
}

/**
 * 개별 토스트 아이템을 렌더링한다.
 * 프로그레스 바 애니메이션이 끝나면 자동으로 닫히고, 닫기 버튼으로 수동 닫기도 가능하다.
 * @param props 토스트 아이템 속성
 * @returns 렌더링된 토스트 아이템
 */
const ToastItemComponent = ({ item, onRemove, closeAriaLabel }: ToastItemComponentProps) => {
	const [visible, setVisible] = React.useState(true);
	const closingRef = React.useRef(false);
	const rootRef = React.useRef<HTMLDivElement>(null);

	const style = useSpringPresence({
		visible,
		from: "translateX(20px)", // 우측에서 슬라이드 인
		onExitComplete: () => {
			// 포커스가 이 토스트 안에 있었으면(닫기 버튼 Enter 등) unmount 로 포커스가
			// body 로 유실되지 않게 인접 토스트의 닫기 버튼으로 넘긴다 (WCAG 2.4.3).
			// onRemove(=state 갱신) 전에 포커스를 옮겨 배치 flush 타이밍에 의존하지 않는다.
			const hadFocus = rootRef.current?.contains(document.activeElement) ?? false;
			if (hadFocus) {
				const closeButtons = Array.from(
					document.querySelectorAll<HTMLElement>(".toast_item .toast_close"),
				);
				const currentIndex = closeButtons.findIndex((el) => rootRef.current?.contains(el));
				if (currentIndex !== -1) {
					// 다음(아래) 우선, 없으면 이전(위) 토스트로 - 논리적 인접 이동
					const next = closeButtons[currentIndex + 1] || closeButtons[currentIndex - 1];
					next?.focus();
				}
			}
			onRemove(item.id);
		},
	});

	/**
	 * 슬라이드 아웃 모션 후 토스트를 제거한다 (onExitComplete 가 onRemove 호출).
	 * @returns void
	 */
	const close = React.useCallback(() => {
		if (closingRef.current) return;
		closingRef.current = true;
		setVisible(false);
	}, []);

	// maxCount 에 밀린 토스트도 닫기 버튼과 같은 경로로 나간다 - 퇴출 모션이 끝나면
	// onExitComplete 가 포커스를 인접 토스트로 넘기고 onRemove 를 부른다. 상태에서 바로
	// 잘라내면 한 프레임에 사라지고, 그 안에 있던 포커스는 body 로 떨어진다(WCAG 2.4.3).
	React.useEffect(() => {
		if (item.dismissing) close();
	}, [item.dismissing, close]);

	// Infinity 는 CSS 시간으로 쓸 수 없고, 진행 바가 없어야 "저절로 안 닫힌다" 가 눈에도 보인다.
	const autoDismisses = Number.isFinite(item.duration);
	const liveRole = item.variant === "error" ? "alert" : "status";

	return (
		<animated.div ref={rootRef} className="toast_item" style={style}>
			{/* 라이브 리전은 메시지만 감싼다 - 버튼까지 읽히면 소음이다. role 을 key 로 두어
			    update 로 status↔alert 가 바뀌면 이 노드만 다시 삽입된다. 보조기술은 라이브 리전의
			    긴급도를 노드 삽입 시점에 정하므로, 속성만 바꾸면 "진행 중 → 실패" 가 assertive 로
			    재공지되지 않는다. 바깥 animated.div 는 그대로라 진입 모션이 다시 돌지 않고 닫기·액션
			    버튼의 포커스도 유지된다. */}
			<div key={liveRole} className="toast_live" role={liveRole}>
				<span className={`toast_icon toast_icon_${item.variant}`} aria-hidden="true">
					{VARIANT_ICONS[item.variant]}
				</span>
				<span className="toast_message">{item.message}</span>
			</div>

			{item.action && (
				<button
					type="button"
					className="toast_action"
					onClick={() => {
						// 퇴출 모션 동안(수백 ms) 버튼이 DOM 에 남아 있다. 가드가 없으면 더블클릭·연속
						// Enter 로 소비자의 되돌리기가 두 번 실행된다.
						if (closingRef.current) return;
						item.action?.onClick();
						close();
					}}
				>
					{item.action.label}
				</button>
			)}

			<button type="button" className="toast_close" onClick={close} aria-label={closeAriaLabel}>
				<X size={iconSize.xs} />
			</button>

			{autoDismisses && (
				<div
					// duration 이 update 로 바뀌면 key 가 바뀌어 애니메이션이 새 값으로 다시 시작한다.
					key={item.duration}
					className={`toast_progress toast_progress_${item.variant}`}
					style={{ "--toast-duration": `${item.duration}ms` } as React.CSSProperties}
					onAnimationEnd={close}
					aria-hidden="true"
				/>
			)}
		</animated.div>
	);
};

/**
 * 토스트 id 시퀀스. `crypto.randomUUID()` 를 쓰면 **보안 컨텍스트에서만** 정의되는 API 에
 * 묶인다 - `http://192.168.x.x:3000` 같은 사내망·기기 테스트 주소에서 첫 토스트가
 * `TypeError: crypto.randomUUID is not a function` 으로 죽는다. id 는 React key 와 제거에만
 * 쓰이므로 페이지 안에서 겹치지 않기만 하면 된다.
 */
let toastSeq = 0;

// ── ToastProvider ────────────────────────────────────────────────────────────

/**
 * 토스트 컨텍스트를 제공하는 Provider를 렌더링한다.
 * 앱 최상단에서 children을 감싸야 useToast 훅을 사용할 수 있다.
 * @param props Provider 속성
 * @returns 렌더링된 Provider와 토스트 컨테이너
 */
export const ToastProvider = ({
	children,
	maxCount = 5,
	closeAriaLabel: closeAriaLabelProp,
	regionLabel: regionLabelProp,
}: ToastProviderProps) => {
	const t = useLocaleText();
	const closeAriaLabel = closeAriaLabelProp ?? t("toast.close");
	const regionLabel = regionLabelProp ?? t("toast.region");
	const [toasts, setToasts] = React.useState<ToastItem[]>([]);
	// 포털은 클라이언트 마운트 후에만 렌더 (SSR/hydration 안전) - 공유 훅
	const isMounted = useIsMounted();

	/**
	 * 토스트를 큐에 추가한다. maxCount 를 넘는 가장 오래된 항목은 퇴출 표시만 한다 - 실제 제거는
	 * 그 토스트의 퇴출 모션이 끝난 뒤 `removeToast` 가 한다.
	 * @param message 표시할 메시지
	 * @param variant 토스트 변형
	 * @param options 자동 닫힘 시간(기본값 3000ms)·액션 버튼
	 * @returns 토스트 id - `dismiss`·`update` 에 넘긴다
	 */
	const addToast = React.useCallback(
		(message: string, variant: ToastVariant, options: ToastOptions = {}) => {
			const { duration = 3000, action } = options;
			const id = `toast_${++toastSeq}`;
			// 0 이하는 지원 범위 밖이다. 예전 `slice(0, maxCount)` 는 아무것도 넣지 않았는데,
			// 표시만 하는 지금 방식이면 새 토스트가 진입과 동시에 퇴출 모션을 타며 깜빡인다.
			if (maxCount <= 0) return id;
			setToasts((prev) => {
				const next = [{ id, message, variant, duration, action }, ...prev];
				// 최신이 앞이라 maxCount 뒤는 항상 가장 오래된 것들이다. 이미 퇴출 중인 항목은
				// 그대로 두고, 새로 밀려난 것만 표시한다.
				return next.map((toast, index) =>
					index >= maxCount && !toast.dismissing ? { ...toast, dismissing: true } : toast,
				);
			});
			return id;
		},
		[maxCount],
	);

	/**
	 * 토스트를 프로그램으로 닫는다. maxCount 초과·닫기 버튼과 같은 퇴출 경로를 탄다.
	 * @param id `addToast` 가 반환한 id. 없거나 이미 퇴출 중이면 아무 일도 하지 않는다
	 */
	const dismissToast = React.useCallback((id: string) => {
		setToasts((prev) =>
			prev.map((toast) =>
				toast.id === id && !toast.dismissing ? { ...toast, dismissing: true } : toast,
			),
		);
	}, []);

	/**
	 * 떠 있는 토스트의 내용을 바꾼다 - "업로드 중…" 을 "완료" 로. 퇴출 중인 것은 건드리지 않는다.
	 * @param id `addToast` 가 반환한 id
	 * @param patch 바꿀 필드. `action: null` 이면 버튼을 뗀다
	 */
	const updateToast = React.useCallback((id: string, patch: ToastPatch) => {
		setToasts((prev) =>
			prev.map((toast) => {
				if (toast.id !== id || toast.dismissing) return toast;
				const { action, ...rest } = patch;
				return {
					...toast,
					...rest,
					action: action === null ? undefined : (action ?? toast.action),
				};
			}),
		);
	}, []);

	/**
	 * 특정 id의 토스트를 큐에서 제거한다.
	 * @param id 제거할 토스트 id
	 * @returns void
	 */
	const removeToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	// 셋 다 stable(useCallback) — value 객체만 메모이즈해 소비자 불필요 리렌더 방지
	const contextValue = React.useMemo(
		() => ({ addToast, dismissToast, updateToast }),
		[addToast, dismissToast, updateToast],
	);

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			{isMounted &&
				createPortal(
					// biome-ignore lint/a11y/useSemanticElements: <section> would create unwanted nesting in portal; role=region is the WAI-ARIA equivalent for live announcements
					<div
						className="toast_container"
						role="region"
						aria-live="polite"
						aria-atomic="false"
						aria-label={regionLabel}
					>
						{toasts.map((item) => (
							<ToastItemComponent
								key={item.id}
								item={item}
								onRemove={removeToast}
								closeAriaLabel={closeAriaLabel}
							/>
						))}
					</div>,
					document.body,
				)}
		</ToastContext.Provider>
	);
};
