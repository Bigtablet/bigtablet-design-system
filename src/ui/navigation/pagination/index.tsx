"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface PaginationProps {
    /** 현재 페이지 번호 (1-based) */
    page: number;
    /** 전체 페이지 수 */
    totalPages: number;
    /** 페이지 변경 시 호출되는 콜백 */
    onChange: (page: number) => void;
}

/**
 * 시작-끝 범위의 숫자 배열을 만든다.
 * @param start 시작 값
 * @param end 끝 값
 * @returns 범위 배열
 */
const range = (start: number, end: number) => {
    const out: number[] = [];
    for (let i = start; i <= end; i += 1) out.push(i);
    return out;
};

/**
 * 현재 페이지를 기준으로 페이지네이션 아이템을 만든다.
 * @param page 현재 페이지
 * @param totalPages 전체 페이지 수
 * @returns 페이지 번호와 생략 기호 배열
 */
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

/**
 * 페이지네이션을 렌더링한다.
 * 이전/다음 버튼과 페이지 목록을 구성해 전달된 콜백으로 페이지 변경을 전달한다.
 * @param props 페이지네이션 속성
 * @returns 렌더링된 페이지네이션 UI
 */
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
                    const buttonClassName = cn(
                        "pagination_page_button",
                        { pagination_active: isActive }
                    );

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
