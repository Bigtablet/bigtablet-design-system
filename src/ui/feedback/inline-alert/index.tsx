"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn, type SafeHTMLProps } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

export type InlineAlertTone = "neutral" | "info" | "success" | "warning" | "error";

export interface InlineAlertProps
	extends Omit<SafeHTMLProps<React.HTMLAttributes<HTMLDivElement>>, "title"> {
	/** 톤 (기본값: "info") */
	tone?: InlineAlertTone;
	/** 굵은 한 줄 제목 */
	title?: React.ReactNode;
	/** 본문 설명 */
	children?: React.ReactNode;
	/** 앞 아이콘. 미지정 시 톤 기본 아이콘, `null` 이면 숨긴다 */
	icon?: React.ReactNode;
	/** 본문 아래 액션 (버튼·링크) */
	action?: React.ReactNode;
	/** 주면 닫기 버튼이 생긴다. 실제로 지우는 건 부모다 (보통 상태를 false 로) */
	onDismiss?: () => void;
	/** 닫기 버튼의 접근성 이름 (기본값: 로케일 `inlineAlert.dismiss`) */
	dismissLabel?: string;
}

const TONE_ICON: Record<InlineAlertTone, React.ComponentType<{ size?: number }>> = {
	neutral: Info,
	info: Info,
	success: CheckCircle2,
	warning: AlertTriangle,
	error: XCircle,
};

/**
 * 페이지 안에 **계속 남는** 안내·경고 블록. 사라지는 알림은 `Toast`, 확인을 받아야 하면
 * `AlertProvider`, 화면·위젯 전체가 비었거나 실패했으면 `EmptyState`/`ErrorState`.
 *
 * 라이브 리전을 강제하지 않는다 - 처음부터 있는 안내를 스크린리더가 끼어들어 읽으면 소음이다.
 * 나중에 나타나는 알림은 `role="status"`(정보·성공), 즉시 알아야 하는 오류만 `role="alert"` 를 준다.
 *
 * @example
 * ```tsx
 * <InlineAlert tone="warning" title="구독이 7일 뒤 만료됩니다" action={<Button size="sm">갱신</Button>}>
 *   만료되면 팀원 초대가 막힙니다.
 * </InlineAlert>
 * ```
 */
export const InlineAlert = ({
	tone = "info",
	title,
	children,
	icon,
	action,
	onDismiss,
	dismissLabel: dismissLabelProp,
	className,
	...props
}: InlineAlertProps) => {
	const t = useLocaleText();
	const dismissLabel = dismissLabelProp ?? t("inlineAlert.dismiss");
	const ToneIcon = TONE_ICON[tone];
	const leading = icon === undefined ? <ToneIcon size={iconSize.md} /> : icon;

	return (
		<div className={cn("inline_alert", `inline_alert_tone_${tone}`, className)} {...props}>
			{leading != null && (
				<span className="inline_alert_icon" aria-hidden="true">
					{leading}
				</span>
			)}
			<div className="inline_alert_content">
				{title != null && <div className="inline_alert_title">{title}</div>}
				{children != null && <div className="inline_alert_description">{children}</div>}
				{action != null && <div className="inline_alert_action">{action}</div>}
			</div>
			{onDismiss && (
				<button
					type="button"
					className="inline_alert_dismiss"
					aria-label={dismissLabel}
					onClick={onDismiss}
				>
					<X size={iconSize.sm} aria-hidden="true" />
				</button>
			)}
		</div>
	);
};

InlineAlert.displayName = "InlineAlert";
