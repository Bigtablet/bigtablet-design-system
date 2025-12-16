"use client";

import * as React from "react";
import "./style.scss";

export interface PaginationProps {
    page: number;
    hasNext: boolean;
    onChange: (page: number) => void;
}

export const Pagination = ({ page, hasNext, onChange }: PaginationProps) => {
    const prevDisabled = page <= 1;
    const nextDisabled = !hasNext;

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

            <span className="pagination_page" aria-current="page">
				{page}
			</span>

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