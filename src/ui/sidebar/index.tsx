import * as React from "react";
import "./style.scss";

export interface SidebarItem {
    key: string;
    label: React.ReactNode;
    icon?: React.ComponentType<{ size?: number }>; // ← 변경: 요소가 아니라 컴포넌트 타입
}

export interface SidebarProps {
    items?: SidebarItem[];            // ← optional
    activeKey?: string;
    onItemSelect?: (key: string) => void;
    width?: number;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const Sidebar = ({
                            items = [],
                            activeKey,
                            onItemSelect,
                            width = 240,
                            collapsible = true,
                            defaultCollapsed,
                            className,
                            style,
                        }: SidebarProps) => {
    const [collapsed, setCollapsed] = React.useState(!!defaultCollapsed);
    const list = Array.isArray(items) ? items : [];

    return (
        <aside
            className={["sidebar", collapsed && "is-collapsed", className].filter(Boolean).join(" ")}
            style={{width: collapsed ? 64 : width, ...style}}
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
                    {list.map((it) => (
                        <button
                            key={it.key}
                            type="button"
                            className={["sidebar__item", activeKey === it.key && "is-active"].filter(Boolean).join(" ")}
                            onClick={() => onItemSelect?.(it.key)}
                            title={typeof it.label === "string" ? it.label : undefined}
                        >
                            {it.icon && (<span className="sidebar__icon">{React.createElement(it.icon, {size: 16})}</span>)}
                            {!collapsed && <span className="sidebar__label">{it.label}</span>}
                        </button>
                    ))}
                </nav>
        </aside>
    );
};