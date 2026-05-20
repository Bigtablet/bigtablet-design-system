"use client";

import { X } from "lucide-react";
import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export type TagVariant = "neutral" | "accent" | "info" | "success" | "warning" | "error";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
	/** 색상 variant (기본값: "neutral") */
	variant?: TagVariant;
	/** 삭제 가능 — X 버튼 표시 */
	onRemove?: () => void;
	/** 왼쪽 아이콘 */
	icon?: React.ReactNode;
}

/**
 * 카테고리/속성 라벨. Chip과 다름 — **인터랙티브하지 않은 정적 라벨**.
 * 검색 결과의 태그, 필터 적용 상태, 콘텐츠 분류에 사용.
 *
 * @example
 * ```tsx
 * <Tag>Frontend</Tag>
 * <Tag variant="accent" onRemove={() => removeFilter()}>Active</Tag>
 * ```
 */
export const Tag = ({
	variant = "neutral",
	onRemove,
	icon,
	className,
	children,
	...props
}: TagProps) => {
	return (
		<span className={cn("tag", `tag_variant_${variant}`, className)} {...props}>
			{icon && (
				<span className="tag_icon" aria-hidden="true">
					{icon}
				</span>
			)}
			<span className="tag_label">{children}</span>
			{onRemove && (
				<button
					type="button"
					className="tag_remove"
					onClick={onRemove}
					aria-label="Remove"
				>
					<X size={12} aria-hidden="true" />
				</button>
			)}
		</span>
	);
};
