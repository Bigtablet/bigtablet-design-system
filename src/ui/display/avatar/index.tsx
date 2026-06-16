"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
	/** 이미지 URL */
	src?: string;
	/** alt 텍스트 (이미지일 때) 또는 initials 추출용 이름 */
	name?: string;
	/** 크기 (기본값: "md"). xs=24 / sm=32 / md=40 / lg=48 / xl=64 */
	size?: AvatarSize;
	/** 모양 (기본값: "circle") */
	shape?: AvatarShape;
	/** 색상 (기본값: accent-default — 검정/흰색 테마 자동) */
	bgColor?: string;
}

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return "";
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * 사용자 프로필 아바타. 이미지 없으면 이름의 initials로 fallback.
 *
 * @example
 * ```tsx
 * <Avatar src="/me.jpg" name="박상민" />
 * <Avatar name="박상민" /> // initials "박"
 * <Avatar name="Sangmin Park" size="lg" /> // initials "SP"
 * ```
 */
export const Avatar = ({
	src,
	name = "",
	size = "md",
	shape = "circle",
	bgColor,
	className,
	style,
	...props
}: AvatarProps) => {
	const [imgFailed, setImgFailed] = React.useState(false);
	const showImage = src && !imgFailed;
	const initials = getInitials(name);

	return (
		<span
			className={cn("avatar", `avatar_size_${size}`, `avatar_shape_${shape}`, className)}
			style={{ background: !showImage ? bgColor : undefined, ...style }}
			// initials-only: span IS the img. with src: <img> provides the role
			role={showImage ? undefined : "img"}
			aria-label={showImage ? undefined : name || undefined}
			{...props}
		>
			{showImage ? (
				// biome-ignore lint/performance/noImgElement: DS is framework-agnostic - consumers wrap with next/image
				<img
					src={src}
					alt={name}
					onError={() => setImgFailed(true)}
					className="avatar_image"
				/>
			) : (
				<span className="avatar_initials" aria-hidden="true">
					{initials}
				</span>
			)}
		</span>
	);
};
