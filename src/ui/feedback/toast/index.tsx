"use client";

import { AlertTriangle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { iconSize } from "../../../styles/icon";
import { renderSentences } from "../../../text";
import { useIsMounted, usePresence } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

export type ToastTone = "success" | "error" | "warning" | "info" | "neutral";

/** 넓은 화면에서 토스트가 뜨는 자리. compact(600px 미만)는 값과 상관없이 아래쪽에 가로로 채운다 */
export type ToastPlacement = "top-right" | "bottom-right";

export interface ToastAction {
	/** 버튼 라벨 - "실행 취소" 등 */
	label: string;
	/** 누르면 실행되고, 이어서 토스트가 닫힌다 */
	onClick: () => void;
}

export interface ToastOptions {
	/**
	 * 같은 id 의 토스트가 떠 있으면 새로 쌓지 않고 그 자리에서 내용을 바꾸고 남은 시간을 다시 센다. 문구는
	 * 화면 낭독기에 다시 알린다 - 저장을 연달아 눌러도 "저장했습니다" 가 하나만 남는다 (#1154).
	 * 반환값도 이 id 라 `dismiss`·`update` 에 그대로 넘길 수 있다
	 */
	id?: string;
	/** 자동 닫힘까지의 ms (기본값: 3000). `Infinity`(또는 0 이하)면 닫기 버튼·`dismiss` 로만 닫힌다 - 진행 토스트용 */
	duration?: number;
	/** 메시지 옆 버튼. 한 번 누를 수 있는 되돌리기 같은 동작에 쓴다 */
	action?: ToastAction;
}

/** `update` 로 바꿀 수 있는 필드. `action: null` 이면 버튼을 뗀다 */
export type ToastPatch = Partial<{
	message: string;
	tone: ToastTone;
	duration: number;
	action: ToastAction | null;
}>;

interface ToastItem {
	/** React key · 제거용 내부 키. 공개 `id` 는 `options.id` 로 겹칠 수 있다(퇴출 중인 것과 새것) */
	uid: number;
	id: string;
	/** `options.id` 로 갱신된 횟수 - 막대를 다시 돌리고 같은 문구도 다시 공지하는 키 */
	version: number;
	message: string;
	tone: ToastTone;
	duration: number;
	action?: ToastAction;
	/** 퇴출 중(maxCount 에 밀렸거나 dismiss 됨). 잘라내지 않고 표시만 해서 수동 닫기와 같은 경로로 사라지게 한다 */
	dismissing?: boolean;
}

interface ToastContextValue {
	addToast: (message: string, tone: ToastTone, options?: ToastOptions) => string;
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
	/**
	 * 넓은 화면에서 뜨는 자리 (기본값: "bottom-right"). 위는 머리 오른쪽 주 동작 버튼을 가려 아래가 기본이다 (#1073).
	 * 하단에 고정 UI(쿠키 배너 등)가 있어 겹치면 "top-right" - 폰 폭은 어느 값이든 하단이다
	 */
	placement?: ToastPlacement;
}

const TONE_ICONS: Record<ToastTone, React.ReactElement> = {
	success: <CheckCircle2 size={iconSize.md} />,
	error: <XCircle size={iconSize.md} />,
	warning: <AlertTriangle size={iconSize.md} />,
	info: <Info size={iconSize.md} />,
	neutral: <Bell size={iconSize.md} />,
};

// ── ToastItemComponent ───────────────────────────────────────────────────────

interface ToastItemComponentProps {
	item: ToastItem;
	onRemove: (uid: number) => void;
	/** 퇴출을 시작했다고 Provider 에 알린다 - 닫히는 중인 것을 같은 id 로 갱신하지 않게 */
	onExitStart: (uid: number) => void;
	closeAriaLabel: string;
}

/**
 * 개별 토스트 아이템을 렌더링한다.
 * 프로그레스 바 애니메이션이 끝나면 자동으로 닫히고, 닫기 버튼으로 수동 닫기도 가능하다.
 * @param props 토스트 아이템 속성
 * @returns 렌더링된 토스트 아이템
 */
const ToastItemComponent = ({
	item,
	onRemove,
	onExitStart,
	closeAriaLabel,
}: ToastItemComponentProps) => {
	const [visible, setVisible] = React.useState(true);
	const closingRef = React.useRef(false);
	const rootRef = React.useRef<HTMLDivElement>(null);

	// 퇴출 transition 이 끝나면 부른다 - 모션은 style.scss 의 token.presence.
	usePresence(visible, [rootRef], () => {
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
				// DOM 다음(최신 쪽) 우선, 없으면 이전 토스트로 - 논리적 인접 이동. 아래 배치에서는 아래쪽,
				// 위 배치(column-reverse)에서는 위쪽 이웃이다 - 보이는 방향이 아니라 읽는 순서를 따른다
				const next = closeButtons[currentIndex + 1] || closeButtons[currentIndex - 1];
				next?.focus();
			}
		}
		onRemove(item.uid);
	});

	// 묶음이 화면보다 길어 스크롤되면 방금 뜬(또는 같은 id 로 갱신된) 토스트가 보이게 - 끝에 붙어 아래
	// 배치에서는 잘린 쪽이다 (#1000). jsdom 에는 없다
	// biome-ignore lint/correctness/useExhaustiveDependencies: version 이 바뀔 때(갱신)마다 다시 보인다
	React.useEffect(() => {
		rootRef.current?.scrollIntoView?.({ block: "nearest" });
	}, [item.version]);

	/**
	 * 슬라이드 아웃 모션 후 토스트를 제거한다 (usePresence 콜백이 onRemove 호출).
	 * @returns void
	 */
	const close = React.useCallback(() => {
		if (closingRef.current) return;
		closingRef.current = true;
		// 닫히면서 높이도 접는다 - auto 에서는 transition 이 안 돌아 지금 높이를 먼저 박고, 그 값을 스타일에
		// 반영(offsetHeight 읽기)한 뒤 닫는다. 자리를 한 번에 비우면 남은 토스트가 한 칸씩 순간 이동했다
		// (#1154, CSS 는 style.scss 의 [data-state="closed"]). 인라인 height 는 CSS 의 0 을 이겨서 변수로 넘긴다
		const el = rootRef.current;
		if (el) {
			el.style.setProperty("--toast-height", `${el.offsetHeight}px`);
			void el.offsetHeight;
		}
		setVisible(false);
		// 닫기 버튼 · 막대로 닫힐 때도 Provider 가 알아야 한다 - 모르면 그사이 같은 id 로 다시 띄운 것이 닫히는
		// 토스트를 갱신하고, 퇴출이 끝나면 새 알림까지 함께 사라졌다 (maxCount · dismiss 경로는 이미 표시돼 있다)
		onExitStart(item.uid);
	}, [onExitStart, item.uid]);

	// maxCount 에 밀린 토스트도 닫기 버튼과 같은 경로로 나간다 - 퇴출 모션이 끝나면
	// 퇴출 콜백이 포커스를 인접 토스트로 넘기고 onRemove 를 부른다. 상태에서 바로
	// 잘라내면 한 프레임에 사라지고, 그 안에 있던 포커스는 body 로 떨어진다(WCAG 2.4.3).
	React.useEffect(() => {
		if (item.dismissing) close();
	}, [item.dismissing, close]);

	// Infinity 는 CSS 시간으로 쓸 수 없고, 진행 바가 없어야 "저절로 안 닫힌다" 가 눈에도 보인다.
	// 0 이하도 같다 - 0ms 진행 바는 animationend 로 뜨자마자 닫혀 토스트가 보이지도 않았다 (#1071)
	const autoDismisses = Number.isFinite(item.duration) && item.duration > 0;

	return (
		<div ref={rootRef} className="toast_item" data-state={visible ? "open" : "closed"}>
			{/* 메시지는 토스트 안에 남긴다 - 리전을 훑을 때 버튼이 어느 메시지에 붙었는지 알 수 있게. 공지는
			    Provider 의 ToastAnnouncer 가 따로 하고, 그 문구는 읽힌 뒤 비워 두 번 나오지 않는다 */}
			<div className="toast_live">
				<span className={`toast_icon toast_icon_${item.tone}`} aria-hidden="true">
					{TONE_ICONS[item.tone]}
				</span>
				<span className="toast_message">{renderSentences(item.message)}</span>
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
					// duration 이 update 로 바뀌거나 같은 id 로 다시 띄우면 key 가 바뀌어 애니메이션이 처음부터 다시 돈다.
					key={`${item.duration}:${item.version}`}
					className={`toast_progress toast_progress_${item.tone}`}
					style={{ "--toast-duration": `${item.duration}ms` } as React.CSSProperties}
					onAnimationEnd={close}
					aria-hidden="true"
				/>
			)}
		</div>
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

/** 공지 문구를 남겨 두는 시간 - 읽힌 뒤 비워 리전을 훑을 때 토스트 안 메시지와 겹치지 않게 (Radix Toast 와 같은 방식) */
const ANNOUNCE_MS = 1000;

/**
 * 토스트 문구를 읽어 주는 숨은 공지 영역 - 컨테이너와 함께 처음부터 붙어 있다. 라이브 리전은 내용보다 먼저
 * DOM 에 있어야 삽입이 공지된다 - 토스트마다 role 노드를 새로 꽂으면 그것을 놓치는 보조기술이 있다.
 * 문구만 담아 닫기 · 액션 버튼 이름이 섞이지 않는다.
 * 새로 뜨거나 update 로 문구 · 긴급도가 바뀐 토스트만 넣고 잠시 뒤 뺀다. error 는 alert 쪽이라 assertive 로
 * 읽힌다 - 보조기술은 긴급도를 노드 삽입 시점에 정한다. 퇴출 중인 항목은 넣지 않는다.
 */
const ToastAnnouncer = ({ toasts }: { toasts: ToastItem[] }) => {
	type Line = { key: string; text: string; urgent: boolean };
	const [lines, setLines] = React.useState<Line[]>([]);
	const seenRef = React.useRef(new Set<string>());
	const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
	React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
	React.useEffect(() => {
		const fresh = toasts
			.filter((toast) => !toast.dismissing)
			.map((toast) => {
				const urgent = toast.tone === "error";
				return {
					key: `${toast.uid}:${toast.version}:${urgent}:${toast.message}`,
					text: toast.message,
					urgent,
				};
			})
			.filter((line) => !seenRef.current.has(line.key));
		if (fresh.length === 0) return;
		for (const line of fresh) seenRef.current.add(line.key);
		setLines((prev) => [...prev, ...fresh]);
		timersRef.current.push(
			setTimeout(
				() => setLines((prev) => prev.filter((line) => !fresh.includes(line))),
				ANNOUNCE_MS,
			),
		);
	}, [toasts]);
	const render = (urgent: boolean) =>
		lines.filter((line) => line.urgent === urgent).map((line) => <p key={line.key}>{line.text}</p>);
	return (
		<>
			<div className="toast_announcer" role="status">
				{render(false)}
			</div>
			<div className="toast_announcer" role="alert">
				{render(true)}
			</div>
		</>
	);
};

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
	placement = "bottom-right",
}: ToastProviderProps) => {
	const t = useLocaleText();
	const closeAriaLabel = closeAriaLabelProp ?? t("toast.close");
	const regionLabel = regionLabelProp ?? t("toast.region");
	const [toasts, setToasts] = React.useState<ToastItem[]>([]);
	// 포털은 클라이언트 마운트 후에만 렌더 (SSR/hydration 안전) - 공유 훅
	const isMounted = useIsMounted();

	/**
	 * 토스트를 큐 끝에 추가한다. maxCount 를 넘는 가장 오래된 항목은 퇴출 표시만 한다 - 실제 제거는
	 * 그 토스트의 퇴출 모션이 끝난 뒤 `removeToast` 가 한다. `options.id` 가 떠 있으면 그것을 갱신한다.
	 * @param message 표시할 메시지
	 * @param tone 의미 색
	 * @param options 자동 닫힘 시간(기본값 3000ms)·액션 버튼
	 * @returns 토스트 id - `dismiss`·`update` 에 넘긴다
	 */
	const addToast = React.useCallback(
		(message: string, tone: ToastTone, options: ToastOptions = {}) => {
			const { duration = 3000, action } = options;
			// 자동 id 모양(`toast_N`)을 직접 넘겼으면 시퀀스를 그 뒤로 민다 - 다음 자동 id 가 같은 값이 되어 열린
			// 두 토스트가 한 id 를 나눠 가지면 dismiss · update 가 둘 다에 걸린다
			const auto = /^toast_(\d+)$/.exec(options.id ?? "");
			if (auto) toastSeq = Math.max(toastSeq, Number(auto[1]));
			const uid = ++toastSeq;
			const id = options.id ?? `toast_${uid}`;
			// 0 이하는 지원 범위 밖이다. 예전 `slice(0, maxCount)` 는 아무것도 넣지 않았는데,
			// 표시만 하는 지금 방식이면 새 토스트가 진입과 동시에 퇴출 모션을 타며 깜빡인다.
			if (maxCount <= 0) return id;
			setToasts((prev) => {
				// 같은 id 가 떠 있으면 그 자리에서 갱신한다 - 같은 문구를 다섯 번 쌓아도 정보가 늘지 않는다 (#1154)
				if (options.id !== undefined && prev.some((t) => t.id === id && !t.dismissing)) {
					return prev.map((t) =>
						t.id === id && !t.dismissing
							? { ...t, message, tone, duration, action, version: t.version + 1 }
							: t,
					);
				}
				// 최신을 끝에 붙인다 - 기본(아래) 배치에서 모서리 쪽이라 읽는 순서와 보이는 순서가 같다. 위 배치는
				// CSS 가 column-reverse 로 뒤집는다. 예전에는 맨 앞에 붙여 아래 배치에서 묶음이 출렁였다 (#1154)
				const next = [...prev, { uid, id, version: 0, message, tone, duration, action }];
				// 앞쪽이 가장 오래된 것들이다. 이미 퇴출 중인 항목은 세지 않고, 새로 밀려난 것만 표시한다.
				let excess = next.filter((t) => !t.dismissing).length - maxCount;
				return next.map((t) => {
					if (excess <= 0 || t.dismissing) return t;
					excess--;
					return { ...t, dismissing: true };
				});
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
	 * 퇴출 모션이 끝난 토스트를 큐에서 제거한다.
	 * @param uid 제거할 토스트의 내부 키
	 * @returns void
	 */
	const removeToast = React.useCallback((uid: number) => {
		setToasts((prev) => prev.filter((t) => t.uid !== uid));
	}, []);

	/** 닫기 버튼 · 막대로 퇴출이 시작된 토스트를 표시한다 - 같은 id 갱신이 그것을 건너뛰게 */
	const markExiting = React.useCallback((uid: number) => {
		setToasts((prev) =>
			prev.map((t) => (t.uid === uid && !t.dismissing ? { ...t, dismissing: true } : t)),
		);
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
					// 컨테이너는 라이브 리전이 아니다 - 예전에는 aria-live 로 항목 전체(닫기 · 액션 버튼 포함)를 감싸고
					// 안쪽 메시지가 다시 status · alert 라 라이브 리전이 겹쳤다 (#994). 공지는 아래 숨은 영역 둘이 맡는다.
					// 랜드마크는 토스트가 있을 때만 - 비어 있으면 스크린리더 랜드마크 목록에 빈 "알림" 이 늘 떴다 (#1059).
					// 공지 영역은 첫 알림이 읽히도록 처음부터 둔다
					// <section> 이 아니라 div + role - 포탈 안에서 섹션 중첩을 만들지 않는다
					<div
						className="toast_container"
						data-placement={placement}
						{...(toasts.length > 0 && { role: "region", "aria-label": regionLabel })}
					>
						<ToastAnnouncer toasts={toasts} />
						{toasts.map((item) => (
							<ToastItemComponent
								key={item.uid}
								item={item}
								onRemove={removeToast}
								onExitStart={markExiting}
								closeAriaLabel={closeAriaLabel}
							/>
						))}
					</div>,
					document.body,
				)}
		</ToastContext.Provider>
	);
};
