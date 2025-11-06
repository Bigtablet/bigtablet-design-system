"use client";

import * as React from "react";
import Link from "next/link";
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
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
    style?: React.CSSProperties;
    match?: MatchMode;
}

export const Sidebar = ({
                            items = [],
                            activePath,
                            onItemSelect,
                            width = 240,
                            collapsible = true,
                            defaultCollapsed,
                            className,
                            style,
                            match = "startsWith",
                        }: SidebarProps) => {
    const [collapsed, setCollapsed] = React.useState(!!defaultCollapsed);
    const list = Array.isArray(items) ? items : [];

    const isActive = (href: string) => {
        if (!activePath) return false;
        return match === "exact" ? activePath === href : activePath.startsWith(href);
    };

    return (
        <aside
            className={["sidebar", collapsed && "is-collapsed", className].filter(Boolean).join(" ")}
            style={{ width: collapsed ? 64 : width, ...style }}
        >
            {collapsible && (
                <button
                    type="button"
                    className="sidebar__toggle"
                    onClick={() => setCollapsed((c) => !c)}
                    aria-label="Toggle sidebar"
                />
            )}

            <nav className="sidebar__nav">
                {list.map((it) => {
                    const active = isActive(it.href);
                    return (
                        <Link
                            key={it.href}
                            href={it.href}
                            className={["sidebar__item", active && "is-active"].filter(Boolean).join(" ")}
                            onClick={() => onItemSelect?.(it.href)}
                            title={typeof it.label === "string" ? it.label : undefined}
                        >
                            {it.icon && (
                                <span className="sidebar__icon">
                  {React.createElement(it.icon, { size: 16 })}
                </span>
                            )}
                            {!collapsed && <span className="sidebar__label">{it.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};