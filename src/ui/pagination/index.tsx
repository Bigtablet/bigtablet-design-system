import * as React from "react";
import "./style.scss";

export interface PaginationProps {
    page: number;
    total: number;
    onChange: (page: number) => void;
    siblingCount?: number;
}

export const Pagination = ({ page, total, onChange, siblingCount = 1 }: PaginationProps) => {
    const clamp = (n: number) => Math.max(1, Math.min(total, n));
    const range = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

    const start = Math.max(2, page - siblingCount);
    const end = Math.min(total - 1, page + siblingCount);
    const mid = range(start, end);
    const pages: (number | "…")[] = [
        1,
        ...(start > 2 ? ["…"] as const : []),
        ...mid,
        ...(end < total - 1 ? ["…"] as const : []),
        total,
    ].filter((x, i, arr) => (typeof x === "number" ? arr.indexOf(x) === i : true));

    return (
        <nav className="pagination" aria-label="Pagination">
            <button className="pagination__item" onClick={() => onChange(clamp(page - 1))} disabled={page <= 1}>
                Prev
            </button>
            {pages.map((p, i) =>
                typeof p === "number" ? (
                    <button
                        key={i}
                        className={["pagination__item", p === page && "is-active"].filter(Boolean).join(" ")}
                        onClick={() => onChange(p)}
                    >
                        {p}
                    </button>
                ) : (
                    <span key={i} className="pagination__ellipsis">…</span>
                )
            )}
            <button className="pagination__item" onClick={() => onChange(clamp(page + 1))} disabled={page >= total}>
                Next
            </button>
        </nav>
    );
};