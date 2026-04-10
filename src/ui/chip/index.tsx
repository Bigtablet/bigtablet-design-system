"use client";

import React, { useState } from "react";
import { cn } from "../../utils";
import "./style.scss";

export type ChipType = "basic" | "input" | "filter";

export interface ChipProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
	/** 칩 유형 (기본값: "basic") */
	type?: ChipType;
	/** 라벨 텍스트 */
	label: string;
	/** 선택 상태 */
	selected?: boolean;
	/** 삭제 가능 여부 (input 타입에서만 사용) */
	removable?: boolean;
	/** 비활성화 상태 */
	disabled?: boolean;
	/** 팝업 열림 상태 (filter 타입에서 aria-expanded로 사용) */
	open?: boolean;
	/** 칩 클릭 시 콜백 */
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	/** 삭제 버튼 클릭 시 콜백 */
	onRemove?: () => void;
}

// Internal SVG icons
const CheckIcon = () => (
	<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
		<polyline points="4 10 8 14 16 6" />
	</svg>
);

const CloseIcon = () => (
	<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
		<line x1="6" y1="6" x2="14" y2="14" />
		<line x1="14" y1="6" x2="6" y2="14" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
		<polyline points="5 8 10 13 15 8" />
	</svg>
);

export const Chip = ({
	type = "basic",
	label,
	selected,
	removable,
	disabled,
	open,
	onClick,
	onRemove,
	className,
	...props
}: ChipProps) => {
	// 아이콘에 직접 hover 시 해당 버튼의 전체 state layer를 끄기 위한 상태
	const [contentIconHovered, setContentIconHovered] = useState(false);
	const [trailingIconHovered, setTrailingIconHovered] = useState(false);

	const hasLeading = selected;
	const hasTrailingButton = type === "input" && removable;
	const hasTrailingIcon = hasTrailingButton || type === "filter";

	const chipClassName = cn(
		"chip",
		`chip_type_${type}`,
		selected && "chip_selected",
		hasLeading && "chip_has_leading",
		hasTrailingIcon && "chip_has_trailing",
		disabled && "chip_disabled",
		className,
	);

	const enterContentIcon = () => setContentIconHovered(true);
	const leaveContentIcon = () => setContentIconHovered(false);
	const enterTrailingIcon = () => setTrailingIconHovered(true);
	const leaveTrailingIcon = () => setTrailingIconHovered(false);

	return (
		<div className={chipClassName} {...props}>
			<button
				type="button"
				className={cn("chip_content", contentIconHovered && "chip_icon_hovered")}
				disabled={disabled}
				onClick={onClick}
				{...(type === "filter" ? { "aria-haspopup": "listbox" as const, "aria-expanded": !!open } : {})}
			>
				{hasLeading && (
					<span
						className="chip_icon"
						aria-hidden="true"
						onPointerEnter={enterContentIcon}
						onPointerLeave={leaveContentIcon}
					>
						<CheckIcon />
					</span>
				)}
				<span className="chip_label">{label}</span>
				{type === "filter" && (
					<span
						className="chip_icon"
						aria-hidden="true"
						onPointerEnter={enterContentIcon}
						onPointerLeave={leaveContentIcon}
					>
						<ChevronDownIcon />
					</span>
				)}
			</button>
			{hasTrailingButton && (
				<button
					type="button"
					className={cn("chip_trailing", trailingIconHovered && "chip_icon_hovered")}
					disabled={disabled}
					onClick={onRemove}
					aria-label="Remove"
				>
					<span
						className="chip_icon"
						aria-hidden="true"
						onPointerEnter={enterTrailingIcon}
						onPointerLeave={leaveTrailingIcon}
					>
						<CloseIcon />
					</span>
				</button>
			)}
		</div>
	);
};
