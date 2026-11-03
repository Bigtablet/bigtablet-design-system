"use client";

import * as React from "react";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import "./style.scss";

interface PaginationBaseProps {
	/** 현재 페이지 번호 (1-based) */
	page: number;
	/** 전체 페이지 수 */
	totalPages: number;
	/** 이전 페이지 버튼 aria-label */
	prevLabel?: string;
	/** 다음 페이지 버튼 aria-label */
	nextLabel?: string;
	/** `<nav>` 랜드마크 이름 (기본값: "페이지 이동"). 스크린리더의 리전 목록에 그대로 뜬다 */
	navLabel?: string;
	/**
	 * 쪽 번호를 적어 Enter 로 바로 가는 입력칸(`이동 [   ] 쪽`)을 붙인다 (기본값: false). 쪽이 수백·수천 개라
	 * 이전·다음과 `…` 로는 원하는 쪽에 닿기 어려운 목록에서 켠다. 범위 밖 값은 1 ~ 마지막 쪽으로 맞추고,
	 * 숫자가 아니면 아무 일도 하지 않는다
	 */
	showPageJump?: boolean;
	/** 쪽 이동 입력칸의 `aria-label` (기본값: "이동할 쪽 번호 (1–{totalPages})") */
	pageJumpLabel?: string;
	/** 입력칸 앞 문구 (기본값: "이동") */
	pageJumpPrefix?: string;
	/** 입력칸 뒤 문구 (기본값: "쪽") */
	pageJumpSuffix?: string;
}

// Pagination 은 controlled 전용 → 페이지 콜백이 필수다.
export type PaginationProps = PaginationBaseProps & {
	/** 페이지를 바꿀 때 호출된다 */
	onPageChange: (page: number) => void;
};

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
 * 쪽 이동 입력값을 쪽 번호로 바꾼다. 천 단위 쉼표·공백은 무시하고 1 ~ totalPages 로 맞춘다.
 * @returns 정수가 아니면 null
 */
const parsePageJump = (raw: string, totalPages: number) => {
	const text = raw.replace(/[\s,]/g, "");
	if (!/^\d+$/.test(text)) return null;
	return Math.min(Math.max(1, Number(text)), Math.max(1, totalPages));
};

/**
 * 페이지네이션을 렌더링한다.
 * 이전/다음 버튼과 페이지 목록을 구성해 전달된 콜백으로 페이지 변경을 전달한다.
 * @param props 페이지네이션 속성
 * @returns 렌더링된 페이지네이션 UI
 */
export const Pagination = ({
	page,
	totalPages,
	onPageChange,
	prevLabel: prevLabelProp,
	nextLabel: nextLabelProp,
	navLabel: navLabelProp,
	showPageJump = false,
	pageJumpLabel: pageJumpLabelProp,
	pageJumpPrefix: pageJumpPrefixProp,
	pageJumpSuffix: pageJumpSuffixProp,
}: PaginationProps) => {
	const t = useLocaleText();
	const [jumpDraft, setJumpDraft] = React.useState("");
	const prevLabel = prevLabelProp ?? t("pagination.prev");
	const nextLabel = nextLabelProp ?? t("pagination.next");
	const navLabel = navLabelProp ?? t("pagination.label");
	const prevDisabled = page <= 1;
	const nextDisabled = page >= totalPages;

	const items = React.useMemo(() => getPaginationItems(page, totalPages), [page, totalPages]);

	const jump = () => {
		const target = parsePageJump(jumpDraft, totalPages);
		if (target === null) return; // 숫자가 아니면 입력을 그대로 두어 고칠 수 있게
		setJumpDraft("");
		if (target !== page) onPageChange(target);
	};

	return (
		<nav className="pagination" aria-label={navLabel}>
			<button
				type="button"
				className="pagination_item"
				onClick={() => onPageChange(page - 1)}
				disabled={prevDisabled}
				aria-label={prevLabel}
			>
				‹
			</button>

			<ul className="pagination_pages">
				{items.map((it, idx) => {
					if (it === "ellipsis") {
						const prev = items[idx - 1];
						const next = items[idx + 1];
						return (
							<li key={`e-${prev}-${next}`} className="pagination_ellipsis" aria-hidden="true">
								…
							</li>
						);
					}

					const isActive = it === page;
					const buttonClassName = cn("pagination_page_button", { pagination_active: isActive });

					return (
						<li key={it}>
							<button
								type="button"
								className={buttonClassName}
								onClick={() => onPageChange(it)}
								aria-current={isActive ? "page" : undefined}
							>
								{it}
							</button>
						</li>
					);
				})}
			</ul>

			<button
				type="button"
				className="pagination_item"
				onClick={() => onPageChange(page + 1)}
				disabled={nextDisabled}
				aria-label={nextLabel}
			>
				›
			</button>

			{showPageJump && (
				// <label> - 앞뒤 문구를 눌러도 입력칸에 포커스. 이름은 범위까지 담은 aria-label 이 맡는다
				<label className="pagination_jump">
					<span aria-hidden="true">{pageJumpPrefixProp ?? t("pagination.jumpPrefix")}</span>
					<input
						type="text"
						inputMode="numeric"
						className="pagination_jump_input"
						value={jumpDraft}
						aria-label={pageJumpLabelProp ?? t("pagination.jumpLabel", { total: totalPages })}
						onChange={(e) => setJumpDraft(e.target.value)}
						onKeyDown={(e) => {
							// 조합 중 Enter 는 IME 확정용. preventDefault - 바깥 <form> 이 제출되지 않게
							if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
							e.preventDefault();
							jump();
						}}
					/>
					<span aria-hidden="true">{pageJumpSuffixProp ?? t("pagination.jumpSuffix")}</span>
				</label>
			)}
		</nav>
	);
};
