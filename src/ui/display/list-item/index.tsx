"use client";

import type * as React from "react";
import { cn, keyActivationProps } from "../../../utils";
import "./style.scss";

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
	/** 오버라인 (상단 작은 글씨). 문자열 또는 노드(강조/링크/아이콘) */
	overline?: React.ReactNode;
	/** 라벨 (주요 텍스트). 문자열 또는 노드(강조/링크/Badge 등) */
	label: React.ReactNode;
	/** 보조 텍스트 (라벨 아래). 문자열 또는 노드 */
	supportingText?: React.ReactNode;
	/** 메타데이터 (보조 정보). 문자열 또는 노드 */
	metadata?: React.ReactNode;
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

	const activation = keyActivationProps<HTMLDivElement>({
		onClick,
		role: props.role,
		disabled,
		onKeyDown: props.onKeyDown,
	});

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: optional interactive list item - role=button + tabIndex set conditionally based on onClick
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: role 은 keyActivationProps 가 주므로 정적 분석이 못 본다 - onClick 이 있으면 role=button 이고 aria-pressed 는 그때만 붙는다
		<div
			className={rootClassName}
			onClick={disabled ? undefined : onClick}
			// 키보드 활성화 규칙은 Card·MediaCard 와 같은 곳에서 온다 (`keyActivationProps`).
			role={activation.role}
			tabIndex={activation.tabIndex}
			aria-disabled={disabled || undefined}
			// aria-selected 는 option/tab/row 등 특정 role 전용이라 button/일반 div 에선 무효
			// (axe aria-allowed-attr 위반). 인터랙티브 항목의 선택 상태는 aria-pressed 로 노출한다.
			aria-pressed={onClick && selected !== undefined ? selected : undefined}
			{...props}
			// 소비자 onKeyDown 은 activation 안에서 먼저 실행되므로 스프레드 뒤에 덮어쓴다.
			// 스프레드가 이기면 활성화 핸들러가 통째로 사라진다.
			onKeyDown={activation.onKeyDown}
		>
			<div className="list_item_state_layer">
				{leadingElement && <div className="list_item_leading">{leadingElement}</div>}
				<div className="list_item_content">
					{overline && <div className="list_item_overline">{overline}</div>}
					<div className="list_item_label">{label}</div>
					{supportingText && <div className="list_item_supporting">{supportingText}</div>}
					{metadata && <div className="list_item_metadata">{metadata}</div>}
				</div>
				{trailingElement && <div className="list_item_trailing">{trailingElement}</div>}
			</div>
		</div>
	);
};
