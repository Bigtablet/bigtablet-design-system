"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import "./style.scss";

export type MatchMode = "startsWith" | "exact";

/** 단일 링크 메뉴 */
export interface SidebarLinkItem {
    type?: "link";
    href: string;
    label: React.ReactNode;
    icon?: LucideIcon;
}

/** 서브 메뉴 그룹 */
export interface SidebarGroupItem {
    type: "group";
    id: string;
    label: React.ReactNode;
    icon?: LucideIcon;
    children: SidebarLinkItem[];
}

export type SidebarItem = SidebarLinkItem | SidebarGroupItem;

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

    const [openGroups, setOpenGroups] = React.useState<string[]>([]);

    /** activePath 기준으로 그룹 자동 열림 */
    React.useEffect(() => {
        if (!activePath) return;

        const autoOpenIds = items
            .filter(
                (item): item is SidebarGroupItem =>
                    item.type === "group" &&
                    item.children.some((child) => isActive(child.href))
            )
            .map((group) => group.id);

        setOpenGroups((prev) =>
            Array.from(new Set([...prev, ...autoOpenIds]))
        );
    }, [activePath, items]);

    const toggleGroup = (id: string) => {
        setOpenGroups((prev) =>
            prev.includes(id)
                ? prev.filter((v) => v !== id)
                : [...prev, id]
        );
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
                    /** 그룹 메뉴 */
                    if (item.type === "group") {
                        const isOpen = openGroups.includes(item.id);

                        return (
                            <div key={item.id} className="sidebar_group">
                                <button
                                    type="button"
                                    className={[
                                        "sidebar_item",
                                        isOpen && "is_open",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    onClick={() => toggleGroup(item.id)}
                                >
                                    {item.icon && (
                                        <span className="sidebar_icon">
                      <item.icon size={16} />
                    </span>
                                    )}

                                    <span className="sidebar_label">{item.label}</span>

                                    <span
                                        className={[
                                            "sidebar_chevron",
                                            isOpen && "is_open",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                    <ChevronDown size={16} />
                  </span>
                                </button>

                                {isOpen && (
                                    <div className="sidebar_sub">
                                        {item.children.map((child) => {
                                            const active = isActive(child.href);

                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={[
                                                        "sidebar_sub_item",
                                                        active && "is_active",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                    onClick={() => onItemSelect?.(child.href)}
                                                >
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    /** 단일 링크 메뉴 */
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
                        >
                            {item.icon && (
                                <span className="sidebar_icon">
                  <item.icon size={16} />
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