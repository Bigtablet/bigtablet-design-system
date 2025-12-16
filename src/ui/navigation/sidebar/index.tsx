"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.scss";

export interface SidebarItem {
  href: string;
  label: React.ReactNode;
  icon?: React.ComponentType<{ size?: number }>;
}

type MatchMode = "startsWith" | "exact";

export interface SidebarProps {
  items?: SidebarItem[];
  activePath?: string;
  onItemSelect?: (href: string) => void;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  match?: MatchMode;
  brandHref?: string;
}

export const Sidebar = ({
                          items = [],
                          activePath,
                          onItemSelect,
                          width = 240,
                          className,
                          style,
                          match = "startsWith",
                          brandHref = "/main",
                        }: SidebarProps) => {
  const isActive = (href: string) => {
    if (!activePath) return false;
    return match === "exact"
        ? activePath === href
        : activePath.startsWith(href);
  };

  const rootClassName = ["sidebar", className ?? ""]
      .filter(Boolean)
      .join(" ");

  return (
      <aside
          className={rootClassName}
          style={{ width, ...style }}
          aria-label="사이드 내비게이션"
      >
        <div className="sidebar_brand">
          <Link
              href={brandHref}
              className="sidebar_brand_link"
              aria-label="Bigtablet 홈으로"
          >
            <Image
                src="/images/logo/bigtablet.png"
                alt="Bigtablet"
                width={200}
                height={44}
                priority
                className="sidebar_brand_img"
            />
          </Link>
        </div>

        <nav className="sidebar_nav">
          {items.map((item) => {
            const active = isActive(item.href);

            return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "sidebar_item",
                      active && "is_active",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    onClick={() => onItemSelect?.(item.href)}
                    title={typeof item.label === "string" ? item.label : undefined}
                >
                  {item.icon && (
                      <span className="sidebar_icon">
                  {React.createElement(item.icon, { size: 16 })}
                </span>
                  )}
                  <span className="sidebar_label">{item.label}</span>
                </Link>
            );
          })}
        </nav>
      </aside>
  );
};