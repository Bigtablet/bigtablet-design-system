"use client";

import * as React from "react";
import { ICON_DATA, type IconName, type IconWeight } from "./icon-data";

export type { IconName, IconWeight };

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "fill"> {
  /** 아이콘 이름 */
  name: IconName;
  /** 아이콘 크기 (px, 기본값: 24) */
  size?: 20 | 24;
  /** 선의 굵기 (기본값: 400) */
  weight?: IconWeight;
  /** 채움 스타일 여부 (기본값: false) */
  fill?: boolean;
}

/**
 * Material Symbols 기반 인라인 SVG 아이콘 컴포넌트.
 * weight(300/400) × fill(true/false) × size(20/24) 조합을 지원한다.
 */
export const Icon = ({
  name,
  size = 24,
  weight = 400,
  fill = false,
  style,
  ...props
}: IconProps) => {
  const entry = ICON_DATA[name];

  if (!entry) {
    console.warn(`[Icon] Unknown icon name: "${name}"`);
    return null;
  }

  const pathData = fill ? entry[weight].fill : entry[weight].noFill;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", flexShrink: 0, ...style }}
      {...props}
    >
      <path d={pathData} />
    </svg>
  );
};

Icon.displayName = "Icon";
