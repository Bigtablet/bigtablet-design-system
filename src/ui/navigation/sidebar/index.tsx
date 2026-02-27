"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, CornerDownRight } from "lucide-react";
import "./style.scss";

export type MatchMode = "startsWith" | "exact";

export interface SidebarLinkItem {
    /** 항목 타입 (생략 시 "link"로 간주) */
    type?: "link";
    /** 링크 경로 */
    href: string;
    /** 메뉴 항목에 표시할 라벨 */
    label: React.ReactNode;
    /** 메뉴 항목 앞에 표시할 아이콘 */
    icon?: LucideIcon;
}

export interface SidebarGroupItem {
    /** 항목 타입 ("group"으로 고정) */
    type: "group";
    /** 그룹 고유 식별자 */
    id: string;
    /** 그룹 헤더에 표시할 라벨 */
    label: React.ReactNode;
    /** 그룹 헤더 앞에 표시할 아이콘 */
    icon?: LucideIcon;
    /** 그룹 하위 링크 항목 목록 */
    children: SidebarLinkItem[];
}

export type SidebarItem = SidebarLinkItem | SidebarGroupItem;

export interface SidebarProps {
    /** 사이드바에 표시할 메뉴 항목 목록 */
    items?: SidebarItem[];
    /** 현재 활성 경로 (활성 메뉴 항목 하이라이트에 사용) */
    activePath?: string;
    /** 메뉴 항목 클릭 시 호출되는 콜백 */
    onItemSelect?: (href: string) => void;
    /** 루트 요소에 추가할 className */
    className?: string;
    /** 루트 요소에 적용할 인라인 스타일 */
    style?: React.CSSProperties;
    /** 활성 경로 매칭 방식 (기본값: "startsWith") */
    match?: MatchMode;
    /** 브랜드 로고 클릭 시 이동할 경로 (기본값: "/main") */
    brandHref?: string;
}

/**
 * 사이드바를 렌더링한다.
 * 활성 경로를 기준으로 메뉴 상태를 계산하고 그룹 열림/닫힘을 관리한다.
 * @param props 사이드바 속성
 * @returns 렌더링된 사이드바 UI
 */
export const Sidebar = ({
                            items = [],
                            activePath,
                            onItemSelect,
                            className,
                            style,
                            match = "startsWith",
                            brandHref = "/main",
                        }: SidebarProps) => {
    /**
     * 현재 활성 경로와 항목 경로를 비교해 활성 상태를 반환한다.
     * @param href 대상 경로
     * @returns 활성 여부
     */
    const isActive = (href: string) => {
        if (!activePath) return false;
        return match === "exact"
            ? activePath === href
            : activePath.startsWith(href);
    };

    const [openGroups, setOpenGroups] = React.useState<string[]>([]);
    const [isOpen, setIsOpen] = React.useState(true);

    /**
     * 사이드바 열림 상태를 갱신하고 로컬 스토리지에 저장한다.
     * @param next 다음 열림 상태
     * @returns void
     */
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

    /**
     * 그룹의 열림/닫힘 상태를 토글한다.
     * @param id 그룹 ID
     * @returns void
     */
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
                        </Link>
                        <button
                            type="button"
                            className="sidebar_close_btn"
                            onClick={() => toggleSidebar(false)}
                        >
                            <Image
                                src="/images/sidebar/arrow-close.svg"
                                alt="Close"
                                width={24}
                                height={24}
                            />
                        </button>
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
                                            aria-expanded={open}
                                            onClick={() =>
                                                toggleGroup(item.id)
                                            }
                                        >
                                            <div className="sidebar_item_left">
                                                {item.icon && (
                                                    <span className="sidebar_icon" aria-hidden="true">
                                                        <item.icon size={16} />
                                                    </span>
                                                )}
                                                <span className="sidebar_label">
                                                    {item.label}
                                                </span>
                                            </div>

                                            <span className="sidebar_item_right" aria-hidden="true">
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
                                                        <span className="sidebar_sub_icon" aria-hidden="true">
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
                                            <span className="sidebar_icon" aria-hidden="true">
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
                <button
                    type="button"
                    className="sidebar_open_btn"
                    onClick={() => toggleSidebar(true)}
                >
                    <Image
                        src="/images/sidebar/menu.svg"
                        alt="Open"
                        width={24}
                        height={24}
                    />
                </button>
            )}
        </aside>
    );
};
