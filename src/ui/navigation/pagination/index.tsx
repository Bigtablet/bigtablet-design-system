"use client";

import * as React from "react";
import "./style.scss";

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
    const sibling = 2;

    // 시작 부분 (1~5페이지 근처)
    if (page <= sibling + 2) {
        for (const p of range(1, sibling + 3)) items.push(p);
        items.push("ellipsis");
        items.push(last);
        return items;
    }

    // 끝 부분 (마지막 5페이지 근처)
    if (page >= last - sibling - 1) {
        items.push(1);
        items.push("ellipsis");
        for (const p of range(last - sibling - 2, last)) items.push(p);
        return items;
    }

    // 중간 부분
    items.push(1);
    items.push("ellipsis");
    for (const p of range(page - sibling, page + sibling)) items.push(p);
    items.push("ellipsis");
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
        <nav className="pagination" aria-label="Pagination">
            <button
                className="pagination_item"
                onClick={() => onChange(page - 1)}
                disabled={prevDisabled}
                aria-label="Previous page"
            >
                ‹
            </button>

            <div className="pagination_pages" role="list">
                {items.map((it, idx) => {
                    if (it === "ellipsis") {
                        return (
                            <span key={`e-${idx}`} className="pagination_ellipsis" aria-hidden="true">
                                …
                            </span>
                        );
                    }

                    const isActive = it === page;

                    const buttonClassName = [
                        "pagination_page_button",
                        isActive && "pagination_active",
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
                className="pagination_item"
                onClick={() => onChange(page + 1)}
                disabled={nextDisabled}
                aria-label="Next page"
            >
                ›
            </button>
        </nav>
    );
};
