"use client";

import type * as React from "react";
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
	onClick,
	onRemove,
	className,
	...props
}: ChipProps) => {
	const hasLeading = selected;
	const hasTrailing = (type === "input" && removable) || type === "filter";

	const chipClassName = cn(
		"chip",
		`chip_type_${type}`,
		selected && "chip_selected",
		hasLeading && "chip_has_leading",
		hasTrailing && "chip_has_trailing",
		disabled && "chip_disabled",
		className,
	);

	return (
		<div className={chipClassName} {...props}>
			<button
				type="button"
				className="chip_content"
				disabled={disabled}
				onClick={onClick}
			>
				{hasLeading && (
					<span className="chip_icon" aria-hidden="true">
						<CheckIcon />
					</span>
				)}
				<span className="chip_label">{label}</span>
			</button>
			{hasTrailing && (
				<button
					type="button"
					className="chip_trailing"
					disabled={disabled}
					onClick={type === "input" && removable ? onRemove : onClick}
					aria-label={type === "input" && removable ? "Remove" : "Toggle dropdown"}
				>
					<span className="chip_icon" aria-hidden="true">
						{type === "input" && removable ? <CloseIcon /> : <ChevronDownIcon />}
					</span>
				</button>
			)}
		</div>
	);
};
