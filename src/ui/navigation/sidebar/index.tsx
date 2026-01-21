"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, CornerDownRight } from "lucide-react";
import "./style.scss";

export type MatchMode = "startsWith" | "exact";

export interface SidebarLinkItem {
    type?: "link";
    href: string;
    label: React.ReactNode;
    icon?: LucideIcon;
}

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
    className?: string;
    style?: React.CSSProperties;
    match?: MatchMode;
    brandHref?: string;
}

export const Sidebar = ({
                            items = [],
                            activePath,
                            onItemSelect,
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
    const [isOpen, setIsOpen] = React.useState(true);

    const toggleSidebar = (next: boolean) => {
        setIsOpen(next);
        localStorage.setItem("isOpen", JSON.stringify(next));
    };

    React.useEffect(() => {
        if (!activePath) return;

        const autoOpen = items
            .filter(
                (item): item is SidebarGroupItem =>
                    item.type === "group" &&
                    item.children.some((c) => isActive(c.href))
            )
            .map((g) => g.id);

        setOpenGroups((prev) =>
            Array.from(new Set([...prev, ...autoOpen]))
        );
    }, [activePath, items]);

    const toggleGroup = (id: string) => {
        setOpenGroups((prev) =>
            prev.includes(id)
                ? prev.filter((v) => v !== id)
                : [...prev, id]
        );
    };

    const sidebarClassName = [
        "sidebar",
        isOpen ? "sidebar_is_open" : "sidebar_is_closed",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <aside
            className={sidebarClassName}
            style={style}
        >
            {isOpen ? (
                <>
                    <div className="sidebar_brand">
                        <Link href={brandHref} className="sidebar_brand_link">
                            <div />
                            <Image
                                src="/images/logo/bigtablet.png"
                                alt="Bigtablet"
                                width={96}
                                height={30}
                                priority
                            />
                            <Image
                                src="/images/sidebar/arrow-close.svg"
                                alt="Close"
                                width={24}
                                height={24}
                                onClick={() => toggleSidebar(false)}
                            />
                        </Link>
                    </div>

                    <nav className="sidebar_nav">
                        {items.map((item) => {
                            if (item.type === "group") {
                                const open = openGroups.includes(item.id);

                                const subClassName = [
                                    "sidebar_sub",
                                    open && "sidebar_sub_open",
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                const chevronClassName = [
                                    "sidebar_chevron",
                                    open && "sidebar_chevron_open",
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                return (
                                    <div key={item.id} className="sidebar_group">
                                        <button
                                            type="button"
                                            className="sidebar_item"
                                            onClick={() =>
                                                toggleGroup(item.id)
                                            }
                                        >
                                            <div className="sidebar_item_left">
                                                {item.icon && (
                                                    <span className="sidebar_icon">
                                                        <item.icon size={16} />
                                                    </span>
                                                )}
                                                <span className="sidebar_label">
                                                    {item.label}
                                                </span>
                                            </div>

                                            <span className="sidebar_item_right">
                                                <ChevronDown
                                                    size={16}
                                                    className={chevronClassName}
                                                />
                                            </span>
                                        </button>

                                        <div className={subClassName}>
                                            {item.children.map((child) => {
                                                const active = isActive(
                                                    child.href
                                                );

                                                const subItemClassName = [
                                                    "sidebar_sub_item",
                                                    active && "sidebar_sub_item_active",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ");

                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={subItemClassName}
                                                        onClick={() =>
                                                            onItemSelect?.(
                                                                child.href
                                                            )
                                                        }
                                                    >
                                                        <span className="sidebar_sub_icon">
                                                            <CornerDownRight
                                                                size={14}
                                                            />
                                                        </span>
                                                        <span className="sidebar_sub_label">
                                                            {child.label}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            const active = isActive(item.href);

                            const itemClassName = [
                                "sidebar_item",
                                active && "sidebar_item_active",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={itemClassName}
                                    onClick={() =>
                                        onItemSelect?.(item.href)
                                    }
                                >
                                    <div className="sidebar_item_left">
                                        {item.icon && (
                                            <span className="sidebar_icon">
                                                <item.icon size={16} />
                                            </span>
                                        )}
                                        <span className="sidebar_label">
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </>
            ) : (
                <Image
                    src="/images/sidebar/menu.svg"
                    alt="Open"
                    width={24}
                    height={24}
                    onClick={() => toggleSidebar(true)}
                />
            )}
        </aside>
    );
};
