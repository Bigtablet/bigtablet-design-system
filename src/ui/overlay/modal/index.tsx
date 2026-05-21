"use client";

import { X } from "lucide-react";
import * as React from "react";
import { cn, useFocusTrap } from "../../../utils";
import "./style.scss";

export type ModalFooterAlign = "end" | "between" | "start";

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** 모달 열림 여부 */
	open: boolean;
	/** 모달 닫기 콜백 */
	onClose?: () => void;
	/** 오버레이 클릭 시 닫기 여부 (기본값: true) */
	closeOnOverlay?: boolean;
	/** 모달 패널 너비 (기본값: 480) */
	width?: number | string;
	/** 모달 제목 (h2, heading_large_bold) */
	title?: React.ReactNode;
	/** 제목 아래 본문 설명 — paragraph로 자동 wrap */
	description?: React.ReactNode;
	/** 하단 액션 영역 (Button들). 미지정 시 footer 영역 자체가 안 보임 */
	footer?: React.ReactNode;
	/** Footer 정렬 (기본값: "end"). between은 좌우 분리 패턴 (destructive 액션 등) */
	footerAlign?: ModalFooterAlign;
	/** 우상단 X 닫기 아이콘 표시 여부 (기본값: true) */
	showCloseIcon?: boolean;
	/** X 닫기 버튼 접근성 레이블 (기본값: "닫기") */
	closeLabel?: string;
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
	width = 480,
	title,
	description,
	footer,
	footerAlign = "end",
	showCloseIcon = true,
	closeLabel = "닫기",
	children,
	className,
	ariaLabel,
	...props
}: ModalProps) => {
	const panelRef = React.useRef<HTMLDivElement>(null);
	const titleId = React.useId();
	const [shouldRender, setShouldRender] = React.useState(open);
	const [isExiting, setIsExiting] = React.useState(false);
	const wasOpenRef = React.useRef(open);

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
		if (open) {
			setShouldRender(true);
			setIsExiting(false);
		} else if (wasOpenRef.current) {
			setIsExiting(true);
		}
		wasOpenRef.current = open;
	}, [open]);

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

	if (!shouldRender) return null;

	const panelClassName = cn("modal_panel", className);
	const hasTitle = !!title;
	const rootClassName = cn("modal", isExiting && "modal_exiting");

	return (
		<div
			className={rootClassName}
			role="dialog"
			aria-modal="true"
			aria-labelledby={hasTitle && !ariaLabel ? titleId : undefined}
			aria-label={!hasTitle ? (ariaLabel ?? "Dialog") : ariaLabel}
			onClick={() => closeOnOverlay && onClose?.()}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose?.();
			}}
		>
			<div
				ref={panelRef}
				className={panelClassName}
				style={{ width }}
				role="document"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					if (e.key !== "Escape") e.stopPropagation();
				}}
				onAnimationEnd={(e) => {
					if (isExiting && e.target === e.currentTarget) {
						setShouldRender(false);
						setIsExiting(false);
					}
				}}
				{...props}
			>
				{showCloseIcon && onClose && (
					<button
						type="button"
						className="modal_close"
						onClick={onClose}
						aria-label={closeLabel}
					>
						<X size={18} aria-hidden="true" />
					</button>
				)}
				{title && (
					<h2 id={titleId} className="modal_title">
						{title}
					</h2>
				)}
				{description && <div className="modal_description">{description}</div>}
				{children && <div className="modal_body">{children}</div>}
				{footer && (
					<div className={cn("modal_footer", `modal_footer_${footerAlign}`)}>{footer}</div>
				)}
			</div>
		</div>
	);
};
