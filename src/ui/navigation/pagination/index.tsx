"use client";

import * as React from "react";
import { cn } from "../../../utils";
import { useLocaleText } from "../../system/locale-provider";
import { paginationItems } from "./items";
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
	 * 현재 쪽 칸을 입력칸으로 바꿔, 번호를 적고 Enter 로 바로 가게 한다 (기본값: false). 쪽이 수백·수천 개라
	 * 이전·다음과 `…` 로는 원하는 쪽에 닿기 어려운 목록에서 켠다. 범위 밖 값은 1 ~ 마지막 쪽으로 맞추고,
	 * 숫자가 아니면 이동하지 않고 오류로 표시한다. Esc 나 포커스를 잃으면 현재 쪽 번호로 돌아간다
	 */
	showPageJump?: boolean;
	/** 현재 쪽 입력칸의 `aria-label` (기본값: "현재 {page}쪽 - 이동할 쪽 번호 (1–{totalPages})") */
	pageJumpLabel?: string;
}

// Pagination 은 controlled 전용 → 페이지 콜백이 필수다.
export type PaginationProps = PaginationBaseProps & {
	/** 페이지를 바꿀 때 호출된다 */
	onPageChange: (page: number) => void;
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
	page: pageProp,
	totalPages,
	onPageChange,
	prevLabel: prevLabelProp,
	nextLabel: nextLabelProp,
	navLabel: navLabelProp,
	showPageJump = false,
	pageJumpLabel: pageJumpLabelProp,
}: PaginationProps) => {
	const t = useLocaleText();
	// 범위 밖 page(목록이 줄어 totalPages 보다 커진 경우)는 가장 가까운 쪽으로 보고 그린다 - 그대로 쓰면 현재 쪽
	// 표시가 없고 이전 버튼이 범위 밖 쪽(onPageChange(4))으로 갔다 (#984)
	const page = Math.min(Math.max(1, pageProp), Math.max(1, totalPages));
	// 입력 중인 값. null 이면 현재 쪽 번호를 보여 준다
	const [jumpDraft, setJumpDraft] = React.useState<string | null>(null);
	const [jumpInvalid, setJumpInvalid] = React.useState(false);
	const jumpInputRef = React.useRef<HTMLInputElement>(null);

	// 적어서 이동한 뒤에도 같은 입력칸에 포커스가 남는다 - 새 번호를 선택해 두어 다음 입력이 덮어쓰게
	// biome-ignore lint/correctness/useExhaustiveDependencies: page 가 바뀔 때 다시 선택하려는 트리거다
	React.useEffect(() => {
		const input = jumpInputRef.current;
		if (input && document.activeElement === input) input.select();
	}, [page]);
	const prevLabel = prevLabelProp ?? t("pagination.prev");
	const nextLabel = nextLabelProp ?? t("pagination.next");
	const navLabel = navLabelProp ?? t("pagination.label");
	const prevDisabled = page <= 1;
	const nextDisabled = page >= totalPages;

	const items = React.useMemo(() => paginationItems(page, totalPages), [page, totalPages]);

	const resetJump = () => {
		setJumpDraft(null);
		setJumpInvalid(false);
	};

	const jump = () => {
		if (jumpDraft === null) return;
		const target = parsePageJump(jumpDraft, totalPages);
		if (target === null) {
			setJumpInvalid(true); // 숫자가 아니면 입력을 그대로 두어 고칠 수 있게
			return;
		}
		resetJump();
		if (target !== page) onPageChange(target);
	};

	const jumpValue = jumpDraft ?? String(page);

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
				{items.map(({ value: it, only }, idx) => {
					// 한 폭에서만 보이는 칸 - 좁은 폭은 1 · … · 현재 · … · 끝 다섯 칸 (#1145)
					const onlyClassName = only && `pagination_${only}`;
					if (it === "ellipsis") {
						return (
							<li
								key={`e-${only ?? "all"}-${items[idx - 1]?.value}`}
								className={cn("pagination_ellipsis", onlyClassName)}
								aria-hidden="true"
							>
								…
							</li>
						);
					}

					const isActive = it === page;

					if (isActive && showPageJump) {
						// 키를 고정해 쪽이 바뀌어도 같은 입력칸이 남는다 - 이동한 뒤에도 포커스가 그대로
						return (
							<li key="current">
								<input
									ref={jumpInputRef}
									type="text"
									inputMode="numeric"
									className={cn("pagination_page_input", {
										pagination_page_input_invalid: jumpInvalid,
									})}
									// 자릿수에 맞춰 폭을 바꾼다 (한 자리 쪽은 CSS min-width 가 번호 버튼 폭으로 받친다)
									size={Math.max(1, jumpValue.length)}
									value={jumpValue}
									aria-current="page"
									aria-invalid={jumpInvalid || undefined}
									aria-label={
										pageJumpLabelProp ?? t("pagination.jumpLabel", { page, total: totalPages })
									}
									onFocus={(e) => e.currentTarget.select()}
									onChange={(e) => {
										setJumpDraft(e.target.value);
										setJumpInvalid(false);
									}}
									onKeyDown={(e) => {
										if (e.key === "Escape") {
											// 적다 만 값을 되돌렸으면 "처리했다" 고 알린다 - 바깥 Modal 이 같은 Escape 로 닫히지 않게 (#976)
											if (e.currentTarget.value !== String(page)) e.preventDefault();
											resetJump();
											return;
										}
										// 조합 중 Enter 는 IME 확정용. preventDefault - 바깥 <form> 이 제출되지 않게
										if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
										e.preventDefault();
										jump();
									}}
									onBlur={resetJump}
								/>
							</li>
						);
					}

					const buttonClassName = cn("pagination_page_button", { pagination_active: isActive });

					return (
						<li key={it} className={onlyClassName || undefined}>
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
		</nav>
	);
};
