"use client";

import type { LucideIcon, LucideProps } from "lucide-react";

export type { LucideIcon, LucideProps } from "lucide-react";

export interface IconProps extends Omit<LucideProps, "ref"> {
	/** lucide-react 아이콘 컴포넌트 */
	icon: LucideIcon;
}

/**
 * lucide-react 아이콘 wrapper.
 * aria-label이 없으면 aria-hidden을 자동 적용해 스크린리더 노이즈를 방지한다.
 *
 * @example
 * ```tsx
 * import { Icon } from "@bigtablet/design-system";
 * import { Search, X } from "lucide-react";
 *
 * <Icon icon={Search} size={20} />
 * <Icon icon={X} size={16} strokeWidth={2.5} aria-label="닫기" />
 * ```
 *
 * lucide-react 아이콘 전체 카탈로그: https://lucide.dev/icons/
 */
export const Icon = ({ icon: IconComponent, ...props }: IconProps) => {
	const hasLabel = !!props["aria-label"];
	return (
		<IconComponent
			aria-hidden={hasLabel ? undefined : true}
			focusable={hasLabel ? undefined : false}
			{...props}
		/>
	);
};

Icon.displayName = "Icon";
