"use client";

import { Check, Copy, XCircle } from "lucide-react";
import type * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn, type SafeHTMLProps, useClipboard } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import { Button, type ButtonVariant } from "../button";
import { IconButton } from "../icon-button";
import "./style.scss";

export interface CopyButtonProps
	extends Omit<
		SafeHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>>,
		// onCopy·onError 는 아래 의미로 쓴다 (DOM 의 copy · error 이벤트가 아니다)
		"children" | "onClick" | "onCopy" | "onError" | "type"
	> {
	/** 복사할 텍스트. 누를 때 계산하려면 함수로 */
	text: string | (() => string);
	/** 버튼 문구 · 아이콘만일 때는 접근성 이름 (기본값: 로케일 `copyButton.copy`) */
	label?: string;
	/**
	 * 접근성 이름을 보이는 문구와 따로 줄 때 (#966). 표처럼 복사 버튼이 여럿이면 보이는 글자는 "복사" 로
	 * 두고 이름은 `"192.168.10.1 주소 복사"` 처럼 무엇을 복사하는지 담는다. 보이는 문구를 이름 안에 넣는다
	 * (WCAG 2.5.3 - 음성 입력이 보이는 글자로 버튼을 찾는다). 없으면 `label`
	 */
	"aria-label"?: string;
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
	"aria-label": ariaLabel,
	...props
}: CopyButtonProps) => {
	const t = useLocaleText();
	const label = labelProp ?? t("copyButton.copy");
	const name = ariaLabel ?? label;
	const copiedLabel = copiedLabelProp ?? t("copyButton.copied");
	const failedLabel = failedLabelProp ?? t("copyButton.failed");
	// onCopy · onError 는 훅이 시도마다 직접 부른다 - 같은 오류가 연달아 나도 매번
	const { copy, status } = useClipboard({ resetAfter, onCopy, onError });
	const copied = status === "copied";

	// 함수 text 는 훅 안에서 계산한다 - throw 하면 실패 알림 · onError 로 간다
	const handleClick = () => {
		void copy(text);
	};

	const failed = status === "error";
	// 글자만 바뀌면 눌렸는지 놓치기 쉽다 - 아이콘 · 색으로도 보인다 (#1158). 색만으로 전하지 않게 아이콘도 바꾼다
	const icon = copied ? (
		<Check size={iconSize.sm} />
	) : failed ? (
		<XCircle size={iconSize.sm} />
	) : (
		<Copy size={iconSize.sm} />
	);
	const message = copied ? copiedLabel : failed ? failedLabel : "";
	const stateClassName = cn(
		"copy_button",
		copied && "copy_button_copied",
		failed && "copy_button_failed",
		className,
	);

	return (
		<>
			{iconOnly ? (
				<IconButton
					{...props}
					size={size}
					icon={icon}
					// 이름은 바꾸지 않는다 - 결과는 아래 status 가 알린다. 이름이 바뀌면 포커스 중
					// 같은 버튼을 두 번 읽는다
					aria-label={name}
					className={stateClassName}
					onClick={handleClick}
				/>
			) : (
				<Button
					{...props}
					size={size}
					variant={variant}
					leadingIcon={icon}
					// 문구 버튼도 이름은 고정 - 보이는 문구만 "복사됨" 으로 바꾸고 낭독은 status 한 번
					aria-label={name}
					className={stateClassName}
					onClick={handleClick}
				>
					{/* 두 문구 중 긴 쪽 폭을 미리 잡는다(::before · ::after) - "복사" ↔ "복사됨" 에 단추가 흔들리지 않게 */}
					<span
						aria-hidden="true"
						className="copy_button_label"
						data-label={label}
						data-copied={copiedLabel}
					>
						<span>{copied ? copiedLabel : label}</span>
					</span>
				</Button>
			)}
			<span className="copy_button_status" role="status">
				{message}
			</span>
		</>
	);
};
