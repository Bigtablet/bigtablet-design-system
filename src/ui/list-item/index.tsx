"use client";

import type * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface ListItemProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
	/** 오버라인 텍스트 (상단 작은 글씨) */
	overline?: string;
	/** 라벨 텍스트 (주요 텍스트) */
	label: string;
	/** 보조 텍스트 (라벨 아래) */
	supportingText?: string;
	/** 메타데이터 텍스트 (보조 정보) */
	metadata?: string;
	/** 왼쪽에 표시할 요소 (아이콘, 이미지, 체크박스 등) */
	leadingElement?: React.ReactNode;
	/** 오른쪽에 표시할 요소 (아이콘 버튼, 체크박스 등) */
	trailingElement?: React.ReactNode;
	/** 요소 정렬 (기본값: "top") */
	alignment?: "top" | "middle";
	/** 비활성화 상태 */
	disabled?: boolean;
	/** 클릭 시 콜백 */
	onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * 리스트 아이템 컴포넌트를 렌더링한다.
 * 리딩/트레일링 슬롯과 다양한 텍스트 구조를 지원한다.
 * @param props 리스트 아이템 속성
 * @returns 렌더링된 리스트 아이템 UI
 */
export const ListItem = ({
	overline,
	label,
	supportingText,
	metadata,
	leadingElement,
	trailingElement,
	alignment = "top",
	disabled,
	onClick,
	className,
	...props
}: ListItemProps) => {
	const rootClassName = cn(
		"list_item",
		`list_item_align_${alignment}`,
		disabled && "list_item_disabled",
		onClick && "list_item_interactive",
		className,
	);

	return (
		<div
			className={rootClassName}
			onClick={disabled ? undefined : onClick}
			onKeyDown={(e) => {
				if (disabled || !onClick) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
				}
			}}
			role={onClick ? "button" : undefined}
			tabIndex={onClick && !disabled ? 0 : undefined}
			aria-disabled={disabled || undefined}
			{...props}
		>
			<div className="list_item_state_layer">
				{leadingElement && (
					<div className="list_item_leading">{leadingElement}</div>
				)}
				<div className="list_item_content">
					{overline && <span className="list_item_overline">{overline}</span>}
					<span className="list_item_label">{label}</span>
					{supportingText && (
						<span className="list_item_supporting">{supportingText}</span>
					)}
					{metadata && (
						<span className="list_item_metadata">{metadata}</span>
					)}
				</div>
				{trailingElement && (
					<div className="list_item_trailing">{trailingElement}</div>
				)}
			</div>
		</div>
	);
};
