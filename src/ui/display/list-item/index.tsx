"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
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
	/** 요소 정렬. 미지정 시 자동: OneLine(label 만) → middle, multi-line → top */
	alignment?: "top" | "middle";
	/** 비활성화 상태 */
	disabled?: boolean;
	/** 선택 상태 - accent.subtle 배경 + accent.default 좌측 인디케이터 */
	selected?: boolean;
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
	alignment,
	disabled,
	selected,
	onClick,
	className,
	...props
}: ListItemProps) => {
	// OneLine (label 만) 은 시각 중앙 정렬이 자연스러움. 명시 alignment 가 있으면 그것 우선.
	const isOneLine = !overline && !supportingText && !metadata;
	const effectiveAlignment = alignment ?? (isOneLine ? "middle" : "top");

	const rootClassName = cn(
		"list_item",
		`list_item_align_${effectiveAlignment}`,
		disabled && "list_item_disabled",
		selected && "list_item_selected",
		onClick && "list_item_interactive",
		className,
	);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: optional interactive list item - role=button + tabIndex set conditionally based on onClick
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
			aria-selected={selected || undefined}
			{...props}
		>
			<div className="list_item_state_layer">
				{leadingElement && <div className="list_item_leading">{leadingElement}</div>}
				<div className="list_item_content">
					{overline && <span className="list_item_overline">{overline}</span>}
					<span className="list_item_label">{label}</span>
					{supportingText && <span className="list_item_supporting">{supportingText}</span>}
					{metadata && <span className="list_item_metadata">{metadata}</span>}
				</div>
				{trailingElement && <div className="list_item_trailing">{trailingElement}</div>}
			</div>
		</div>
	);
};
