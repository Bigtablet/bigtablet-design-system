"use client";

import * as React from "react";
import "./style.scss";

export interface PaginationProps {
    page: number;
    hasNext: boolean;
    size?: number;
    onChange: (page: number) => void;
}

export const Pagination = ({ page, hasNext, onChange }: PaginationProps) => {
    const prevDisabled = page <= 1;
    const nextDisabled = !hasNext;

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                className="pagination__item"
                onClick={() => !prevDisabled && onChange(page - 1)}
                disabled={prevDisabled}
            >
                Prev
            </button>

            <span className="pagination__page">{page}</span>

            <button
                className="pagination__item"
                onClick={() => !nextDisabled && onChange(page + 1)}
                disabled={nextDisabled}
            >
                Next
            </button>
        </nav>
    );
};