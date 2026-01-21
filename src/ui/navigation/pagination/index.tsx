"use client";

import * as React from "react";
import styles from "./style.module.scss";

export interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

const range = (start: number, end: number) => {
    const out: number[] = [];
    for (let i = start; i <= end; i += 1) out.push(i);
    return out;
};

const getPaginationItems = (page: number, totalPages: number) => {
    if (totalPages <= 7) return range(1, totalPages);

    const items: Array<number | "ellipsis"> = [];
    const last = totalPages;

    const start = Math.max(2, page - 1);
    const end = Math.min(last - 1, page + 1);

    items.push(1);

    if (start > 2) items.push("ellipsis");

    for (const p of range(start, end)) items.push(p);

    if (end < last - 1) items.push("ellipsis");

    items.push(last);

    return items;
};

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
    const prevDisabled = page <= 1;
    const nextDisabled = page >= totalPages;

    const items = React.useMemo(
        () => getPaginationItems(page, totalPages),
        [page, totalPages]
    );

    return (
        <nav className={styles.pagination} aria-label="Pagination">
            <button
                className={styles.item}
                onClick={() => onChange(page - 1)}
                disabled={prevDisabled}
                aria-label="Previous page"
            >
                ‹
            </button>

            <div className={styles.pages} role="list">
                {items.map((it, idx) => {
                    if (it === "ellipsis") {
                        return (
                            <span key={`e-${idx}`} className={styles.ellipsis} aria-hidden="true">
                                …
                            </span>
                        );
                    }

                    const isActive = it === page;

                    const buttonClassName = [
                        styles.pageButton,
                        isActive && styles.active,
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <button
                            key={it}
                            type="button"
                            className={buttonClassName}
                            onClick={() => onChange(it)}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {it}
                        </button>
                    );
                })}
            </div>

            <button
                className={styles.item}
                onClick={() => onChange(page + 1)}
                disabled={nextDisabled}
                aria-label="Next page"
            >
                ›
            </button>
        </nav>
    );
};
