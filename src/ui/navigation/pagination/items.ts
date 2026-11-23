// 쪽 번호 칸 계산 - React Pagination 과 Vanilla 번들(src/vanilla/js/pagination.js)이 함께 쓴다 (#1145)

/** 좁은 폭(600px 미만)의 현재 쪽 양옆 번호 수 - 1 · … · 현재 · … · 끝 다섯 칸이라 375px 화면에 들어간다 */
const NARROW_SIBLING = 0;

/** 한 칸 - 번호나 `…`. `only` 가 있으면 그 폭에서만 보인다 (나머지 폭에서는 CSS 가 숨긴다) */
export interface PaginationItem {
	value: number | "ellipsis";
	only?: "wide" | "narrow";
}

const range = (start: number, end: number) => {
	const out: number[] = [];
	for (let i = start; i <= end; i += 1) out.push(i);
	return out;
};

/**
 * 한 폭의 칸 목록. 쪽이 많으면 어느 쪽에서든 칸 수가 `2 * sibling + 5` 로 같다 - 앞·뒤쪽은 `…` 대신 번호를 더 채운다
 * (MUI boundaryCount 1 · siblingCount 와 같은 규칙). 칸 수가 바뀌면 가운데 정렬한 ‹ › 가 좌우로 움직인다 (#935).
 */
const itemsFor = (page: number, totalPages: number, sibling: number) => {
	if (totalPages <= 2 * sibling + 5) return range(1, totalPages);
	const last = totalPages;
	if (page <= sibling + 3) return [...range(1, 2 * sibling + 3), "ellipsis" as const, last];
	if (page >= last - sibling - 2)
		return [1, "ellipsis" as const, ...range(last - 2 * sibling - 2, last)];
	return [
		1,
		"ellipsis" as const,
		...range(page - sibling, page + sibling),
		"ellipsis" as const,
		last,
	];
};

/**
 * 넓은 폭(`sibling`)과 좁은 폭(`NARROW_SIBLING`) 칸 목록을 하나로 합친다. 폭에 따라 JS 로 다시 그리지 않고
 * CSS 가 한쪽 칸만 숨긴다 - 서버 렌더 · 첫 그림부터 폭에 맞고, 창 크기를 바꿔도 깜빡이지 않는다.
 * 두 목록의 번호는 오름차순으로 합치고, `…` 는 각 목록에서 바로 앞 번호 뒤에 둔다.
 */
export const paginationItems = (
	page: number,
	totalPages: number,
	sibling = 2,
): PaginationItem[] => {
	const wide = itemsFor(page, totalPages, sibling);
	const narrow = itemsFor(page, totalPages, Math.min(sibling, NARROW_SIBLING));
	const pagesOf = (list: (number | "ellipsis")[]) =>
		new Set(list.filter((it): it is number => it !== "ellipsis"));
	// `…` 바로 앞 번호 - 그 번호 뒤에 `…` 를 둔다
	const gapsOf = (list: (number | "ellipsis")[]) =>
		new Set(list.flatMap((it, i) => (it === "ellipsis" ? [list[i - 1] as number] : [])));
	const widePages = pagesOf(wide);
	const narrowPages = pagesOf(narrow);
	const wideGaps = gapsOf(wide);
	const narrowGaps = gapsOf(narrow);
	const onlyOf = (inWide: boolean, inNarrow: boolean) =>
		inWide && inNarrow ? undefined : inWide ? ("wide" as const) : ("narrow" as const);

	const out: PaginationItem[] = [];
	for (const value of [...new Set([...widePages, ...narrowPages])].sort((a, b) => a - b)) {
		const only = onlyOf(widePages.has(value), narrowPages.has(value));
		out.push(only ? { value, only } : { value });
		if (!wideGaps.has(value) && !narrowGaps.has(value)) continue;
		const gapOnly = onlyOf(wideGaps.has(value), narrowGaps.has(value));
		out.push(gapOnly ? { value: "ellipsis", only: gapOnly } : { value: "ellipsis" });
	}
	return out;
};
