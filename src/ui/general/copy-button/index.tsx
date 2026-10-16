"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { type SafeHTMLProps, useClipboard } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import { Button, type ButtonVariant } from "../button";
import { IconButton } from "../icon-button";
import "./style.scss";

export interface CopyButtonProps
	extends Omit<
		SafeHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>>,
		// onCopy·onError 는 아래 의미로 쓴다 (DOM 의 copy · error 이벤트가 아니다)
		"children" | "onClick" | "onCopy" | "onError" | "type" | "aria-label"
	> {
	/** 복사할 텍스트. 누를 때 계산하려면 함수로 */
	text: string | (() => string);
	/** 버튼 문구 · 아이콘만일 때는 접근성 이름 (기본값: 로케일 `copyButton.copy`) */
	label?: string;
	/** 복사 직후 문구 (기본값: 로케일 `copyButton.copied`) */
	copiedLabel?: string;
	/** 실패 시 스크린리더에 알릴 문구 (기본값: 로케일 `copyButton.failed`) */
	failedLabel?: string;
	/** 아이콘만 (IconButton) */
	iconOnly?: boolean;
	/** 크기 (기본값: "sm") */
	size?: "sm" | "md";
	/** 문구 버튼의 variant (기본값: "outline") */
	variant?: ButtonVariant;
	/** 복사됨 표시를 유지하는 시간(ms) (기본값: 2000) */
	resetAfter?: number;
	/** 성공 - Toast 를 띄우려면 여기서 */
	onCopy?: (text: string) => void;
	/** 실패 (권한 거부 · API 없음 · 폴백 실패) */
	onError?: (error: unknown) => void;
	ref?: React.Ref<HTMLButtonElement>;
}

/**
 * 텍스트 복사 버튼. 복사되면 2초간 체크 아이콘·"복사됨" 으로 바뀌고, 결과를 스크린리더에도
 * 알린다(숨긴 `role="status"`). 성공·실패 피드백을 Toast 로 더 하려면 `onCopy`·`onError` 에서.
 *
 * @example
 * ```tsx
 * <CopyButton text={inviteUrl} onCopy={() => toast.success("링크를 복사했습니다")} />
 * <CopyButton text={apiKey} iconOnly label="API 키 복사" />
 * ```
 */
export const CopyButton = ({
	text,
	label: labelProp,
	copiedLabel: copiedLabelProp,
	failedLabel: failedLabelProp,
	iconOnly = false,
	size = "sm",
	variant = "outline",
	resetAfter = 2000,
	onCopy,
	onError,
	className,
	...props
}: CopyButtonProps) => {
	const t = useLocaleText();
	const label = labelProp ?? t("copyButton.copy");
	const copiedLabel = copiedLabelProp ?? t("copyButton.copied");
	const failedLabel = failedLabelProp ?? t("copyButton.failed");
	const { copy, status, error } = useClipboard({ resetAfter });
	const copied = status === "copied";

	// onError 는 상태가 error 로 바뀐 직후 한 번
	const onErrorRef = React.useRef(onError);
	onErrorRef.current = onError;
	React.useEffect(() => {
		if (status === "error") onErrorRef.current?.(error);
	}, [status, error]);

	const handleClick = async () => {
		let value = "";
		// 함수 text 는 훅 안에서 계산한다 - throw 하면 실패 알림 · onError 로 간다
		const ok = await copy(() => {
			value = typeof text === "function" ? text() : text;
			return value;
		});
		if (ok) onCopy?.(value);
	};

	const icon = copied ? <Check size={iconSize.sm} /> : <Copy size={iconSize.sm} />;
	const message = copied ? copiedLabel : status === "error" ? failedLabel : "";

	return (
		<>
			{iconOnly ? (
				<IconButton
					{...props}
					size={size}
					icon={icon}
					// 이름은 바꾸지 않는다 - 결과는 아래 status 가 알린다. 이름이 바뀌면 포커스 중
					// 같은 버튼을 두 번 읽는다
					aria-label={label}
					className={className}
					onClick={handleClick}
				/>
			) : (
				<Button
					{...props}
					size={size}
					variant={variant}
					leadingIcon={icon}
					// 문구 버튼도 이름은 고정 - 보이는 문구만 "복사됨" 으로 바꾸고 낭독은 status 한 번
					aria-label={label}
					className={className}
					onClick={handleClick}
				>
					<span aria-hidden="true">{copied ? copiedLabel : label}</span>
				</Button>
			)}
			<span className="copy_button_status" role="status">
				{message}
			</span>
		</>
	);
};

CopyButton.displayName = "CopyButton";
