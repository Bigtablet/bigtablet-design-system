"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type ChipType = "basic" | "input" | "filter" | "static";
export type ChipSize = "sm" | "md";
export type ChipTone = "default" | "accent" | "info" | "success" | "warning" | "error";

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
	/** 칩 유형 (기본값: "basic"). `static`은 비인터랙티브 라벨 (구 Tag 대체) */
	type?: ChipType;
	/** 칩 크기 (미지정 시 기본 32px). "sm"=24px, "md"=28px */
	size?: ChipSize;
	/** 색조 (type=`static`에서만 적용). 카테고리/상태 라벨 색 구분 */
	tone?: ChipTone;
	/** 라벨 텍스트 */
	label: string;
	/** 선택 상태 */
	selected?: boolean;
	/** 삭제 가능 여부 (input / static 타입에서 사용) */
	removable?: boolean;
	/** 비활성화 상태 */
	disabled?: boolean;
	/** 팝업 열림 상태 (filter 타입에서 aria-expanded로 사용) */
	open?: boolean;
	/** 왼쪽 아이콘 (static 타입에서 사용) */
	leadingIcon?: React.ReactNode;
	/** 칩 클릭 시 콜백 */
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	/** 삭제 버튼 클릭 시 콜백 */
	onRemove?: () => void;
}

const CheckIcon = () => (
	<svg
		viewBox="0 0 20 20"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<polyline points="4 10 8 14 16 6" />
	</svg>
);

const CloseIcon = () => (
	<svg
		viewBox="0 0 20 20"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<line x1="6" y1="6" x2="14" y2="14" />
		<line x1="14" y1="6" x2="6" y2="14" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg
		viewBox="0 0 20 20"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<polyline points="5 8 10 13 15 8" />
	</svg>
);

export const Chip = ({
	type = "basic",
	size,
	tone = "default",
	label,
	selected,
	removable,
	disabled,
	open,
	leadingIcon,
	onClick,
	onRemove,
	className,
	...props
}: ChipProps) => {
	const [iconHovered, setIconHovered] = useState(false);

	const isStatic = type === "static";
	const hasLeading = !isStatic && selected;
	const hasStaticLeading = isStatic && !!leadingIcon;
	const hasTrailingButton = (type === "input" || isStatic) && removable;
	const hasTrailingIcon = hasTrailingButton || type === "filter";

	const enterIcon = () => setIconHovered(true);
	const leaveIcon = () => setIconHovered(false);

	const chipClassName = cn(
		"chip",
		`chip_type_${type}`,
		size && `chip_size_${size}`,
		isStatic && `chip_tone_${tone}`,
		selected && "chip_selected",
		(hasLeading || hasStaticLeading) && "chip_has_leading",
		hasTrailingIcon && "chip_has_trailing",
		disabled && "chip_disabled",
		iconHovered && "chip_icon_hovered",
		className,
	);

	// ─── Static: non-interactive label (no inner button) ────────────────────
	if (isStatic) {
		return (
			<span className={chipClassName} {...props}>
				<span className="chip_content">
					{hasStaticLeading && (
						<span className="chip_icon" aria-hidden="true">
							{leadingIcon}
						</span>
					)}
					<span className="chip_label">{label}</span>
				</span>
				{hasTrailingButton && (
					<button
						type="button"
						className="chip_trailing"
						disabled={disabled}
						onClick={onRemove}
						aria-label="Remove"
					>
						<span className="chip_icon" aria-hidden="true">
							<CloseIcon />
						</span>
					</button>
				)}
			</span>
		);
	}

	return (
		<div className={chipClassName} {...props}>
			<button
				type="button"
				className="chip_content"
				disabled={disabled}
				onClick={onClick}
				{...(type === "filter"
					? { "aria-haspopup": "listbox" as const, "aria-expanded": !!open }
					: {})}
			>
				{hasLeading && (
					<span
						className="chip_icon"
						aria-hidden="true"
						onPointerEnter={enterIcon}
						onPointerLeave={leaveIcon}
					>
						<CheckIcon />
					</span>
				)}
				<span className="chip_label">{label}</span>
				{type === "filter" && (
					<span
						className="chip_icon"
						aria-hidden="true"
						onPointerEnter={enterIcon}
						onPointerLeave={leaveIcon}
					>
						<ChevronDownIcon />
					</span>
				)}
			</button>
			{hasTrailingButton && (
				<button
					type="button"
					className="chip_trailing"
					disabled={disabled}
					onClick={onRemove}
					aria-label="Remove"
				>
					<span
						className="chip_icon"
						aria-hidden="true"
						onPointerEnter={enterIcon}
						onPointerLeave={leaveIcon}
					>
						<CloseIcon />
					</span>
				</button>
			)}
		</div>
	);
};
