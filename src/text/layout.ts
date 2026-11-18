// 줄바꿈 엔진 - 실제 폭으로 줄을 계산해 가장 자연스러운 줄바꿈을 고른다 (#1083). React · DOM 없음.
// pretext 의 "한 번 재고 산술로 줄 계산" 과 semantic-wrap 의 "끊을 자리 벌점 · 최적 조합 · 브라우저보다 나을 때만
// 교체" 를 외부 의존성 없이 옮겼다. 폭은 `measure` 로 받는다 - 브라우저는 createCanvasMeasurer, 테스트는 가짜 폭.
import { gapPenalty } from "./core";

/** 글자 폭을 재는 함수 - 같은 글자에는 늘 같은 값을 돌려줘야 한다 */
export type MeasureText = (text: string) => number;

export interface Word {
	text: string;
	start: number;
	end: number;
	/** 앞 조각과 공백으로 떨어져 있는가 - 아니면 같은 어절 안의 끊을 자리(한글 뒤 여는 괄호)다 */
	spaceBefore: boolean;
}

/**
 * 줄을 바꿀 수 있는 조각과 원문 위치. `keep-all` 이라 한글도 어절 안에서는 끊지 않지만, Chromium 은 괄호와 한글이
 * 맞닿은 자리에서도 끊는다 - 한글 뒤 여는 괄호 앞("원본" / "(페이지"), 닫는 괄호 뒤 한글 앞("타입)" / "에서").
 * 실제 화면과 비교해 맞춘 규칙이다(layout.browser.test.ts).
 * 정규식 lookbehind 는 쓰지 않는다 - Safari 16.4 미만에서 번들 전체가 깨진다 (core.ts SENTENCE_END 참고)
 */
export const toWords = (text: string): Word[] => {
	const words: Word[] = [];
	for (const m of text.matchAll(/\S+/g)) {
		const start = m.index ?? 0;
		let from = 0;
		for (let i = 1; i < m[0].length; i++) {
			const prev = m[0][i - 1] ?? "";
			const cur = m[0][i] ?? "";
			if ((cur === "(" && /[가-힣]/.test(prev)) || (prev === ")" && /[가-힣]/.test(cur))) {
				words.push({
					text: m[0].slice(from, i),
					start: start + from,
					end: start + i,
					spaceBefore: from === 0,
				});
				from = i;
			}
		}
		words.push({
			text: m[0].slice(from),
			start: start + from,
			end: start + m[0].length,
			spaceBefore: from === 0,
		});
	}
	if (words[0]) words[0].spaceBefore = false;
	return words;
};

/** 줄바꿈 자리 = 그 줄의 마지막 어절 번호. 마지막 줄은 넣지 않는다 - `[2, 5]` 면 0~2 · 3~5 · 6~끝 세 줄 */
export type Breaks = number[];

const lineWidth = (words: Word[], widths: number[], space: number, from: number, to: number) => {
	let width = 0;
	for (let i = from; i <= to; i++)
		width += (widths[i] ?? 0) + (i > from && words[i]?.spaceBefore ? space : 0);
	return width;
};

/**
 * 브라우저가 `word-break: keep-all` 로 그릴 줄바꿈 - 어절을 앞에서부터 채우다 넘치면 다음 줄.
 * 한 어절이 줄보다 길면 그 어절은 혼자 한 줄이다 (브라우저는 그 안을 다시 끊지만 여기서는 다루지 않는다)
 */
export const layoutNative = (words: Word[], measure: MeasureText, maxWidth: number): Breaks => {
	const widths = words.map((w) => measure(w.text));
	const space = measure(" ");
	const breaks: Breaks = [];
	let width = 0;
	for (let i = 0; i < words.length; i++) {
		const w = widths[i] ?? 0;
		const gap = words[i]?.spaceBefore ? space : 0;
		if (i > 0 && width + gap + w > maxWidth && width > 0) {
			breaks.push(i - 1);
			width = w;
		} else width = i === 0 || width === 0 ? w : width + gap + w;
	}
	return breaks;
};

export interface LayoutScore {
	/** 줄바꿈 자리 벌점의 합 */
	penalty: number;
	/** 마지막 줄을 뺀 줄들의 남는 폭 비율 제곱합 - 줄 길이가 들쭉날쭉할수록 크다 */
	ragged: number;
}

/** 줄바꿈의 점수 - 벌점이 먼저, 같으면 줄 길이 고르기 */
export const scoreBreaks = (
	words: Word[],
	measure: MeasureText,
	maxWidth: number,
	breaks: Breaks,
): LayoutScore => {
	const widths = words.map((w) => measure(w.text));
	const space = measure(" ");
	const costs = breakCosts(words);
	let penalty = 0;
	let ragged = 0;
	let from = 0;
	for (const end of breaks) {
		penalty += costs[end] ?? 0;
		const slack = (maxWidth - lineWidth(words, widths, space, from, end)) / maxWidth;
		ragged += slack * slack;
		from = end + 1;
	}
	return { penalty, ragged };
};

/**
 * 어절마다 그 뒤에서 끊는 벌점. 공백 없이 맞닿은 자리(괄호 앞뒤)는 끊을 수는 있어도 보기 싫어 높게 둔다 -
 * 브라우저 예측에는 넣되 엔진이 고르지는 않게. 괄호 안("(h · p · ul ·" / "a …)")은 그보다 높다 - 괄호를 통째로 넘기는 쪽이 낫다
 */
const breakCosts = (words: Word[]) => {
	let depth = 0;
	return words.map((word, i) => {
		for (const ch of word.text) depth = Math.max(0, depth + (ch === "(" ? 1 : ch === ")" ? -1 : 0));
		const next = words[i + 1];
		let penalty = gapPenalty(word.text, next?.text ?? "");
		// 나열 항목 안("Esc 닫기 · …")은 항목 사이(8)보다 어색하다
		if (penalty === 6 && (words[i - 1]?.text === "·" || words[i + 2]?.text === "·")) penalty = 10;
		if (depth > 0) return Math.max(60, penalty);
		return next?.spaceBefore === false ? Math.max(50, penalty) : penalty;
	});
};

/** 남는 폭 1 비율(빈 줄)이 벌점 몇 점과 맞먹는가 - 줄 길이보다 끊는 자리를 훨씬 무겁게 본다 */
const RAGGED_WEIGHT = 2;

/**
 * 줄 수를 `lines` 로 고정하고 (벌점 + 줄 길이 고르기)가 가장 작은 줄바꿈을 고른다 - 끊을 수 있는 자리만 놓고 푸는 DP.
 * 어느 줄도 `maxWidth` 를 넘지 않는 배치가 없으면 null.
 * ponytail: O(n² · lines). 제목 · 짧은 문단(수십 어절)용이다 - 긴 본문은 브라우저 줄바꿈 + 글자 규칙에 맡긴다
 */
export const layoutBest = (
	words: Word[],
	measure: MeasureText,
	maxWidth: number,
	lines: number,
): Breaks | null => {
	const n = words.length;
	if (n === 0 || lines < 1 || lines > n) return null;
	const widths = words.map((w) => measure(w.text));
	const space = measure(" ");
	const costs = breakCosts(words);
	// cost[k][j] = 어절 0~j 를 k+1 줄에 담는 최소 비용, from[k][j] = 그 마지막 줄의 시작 어절
	const cost = Array.from({ length: lines }, () =>
		new Array<number>(n).fill(Number.POSITIVE_INFINITY),
	);
	const from = Array.from({ length: lines }, () => new Array<number>(n).fill(-1));
	const fits = (a: number, b: number) => lineWidth(words, widths, space, a, b) <= maxWidth;
	const slack = (a: number, b: number) => {
		const s = (maxWidth - lineWidth(words, widths, space, a, b)) / maxWidth;
		return s * s * RAGGED_WEIGHT;
	};
	for (let j = 0; j < n; j++) if (fits(0, j)) (cost[0] as number[])[j] = 0;
	for (let k = 1; k < lines; k++) {
		const prev = cost[k - 1] as number[];
		const cur = cost[k] as number[];
		const at = from[k] as number[];
		for (let j = k; j < n; j++) {
			for (let i = k; i <= j; i++) {
				if (!fits(i, j)) continue;
				const before = prev[i - 1] ?? Number.POSITIVE_INFINITY;
				if (before === Number.POSITIVE_INFINITY) continue;
				// 앞 줄(…i-1)을 끝낸 자리의 벌점 + 앞 줄 길이 고르기. 마지막 줄의 남는 폭은 세지 않는다
				const startOfPrev = k - 1 === 0 ? 0 : ((from[k - 1] as number[])[i - 1] ?? 0);
				const c = before + (costs[i - 1] ?? 0) + slack(startOfPrev, i - 1);
				if (c < (cur[j] ?? Number.POSITIVE_INFINITY)) {
					cur[j] = c;
					at[j] = i;
				}
			}
		}
	}
	if ((cost[lines - 1] as number[])[n - 1] === Number.POSITIVE_INFINITY) return null;
	const breaks: Breaks = [];
	let j = n - 1;
	for (let k = lines - 1; k > 0; k--) {
		const i = (from[k] as number[])[j] ?? 0;
		breaks.unshift(i - 1);
		j = i - 1;
	}
	return breaks;
};

export interface BreakChoice {
	/** 고른 줄바꿈 */
	breaks: Breaks;
	/** 브라우저가 그릴 줄바꿈 */
	native: Breaks;
	/** 브라우저 결과를 바꿨는가 */
	changed: boolean;
}

/**
 * 브라우저 줄바꿈과 같은 줄 수 안에서 더 나은 줄바꿈이 있으면 그것을, 아니면 브라우저 결과를 고른다.
 * 벌점이 낮아질 때만 바꾼다 - 줄 길이만 조금 고르게 하려고 브라우저 결과를 흔들지 않는다 (semantic-wrap `balance()`).
 * 줄보다 긴 어절이 있으면 손대지 않는다 - 그 어절은 브라우저가 글자 사이에서 끊어 예측이 맞지 않는다
 */
export const chooseBreaks = (text: string, measure: MeasureText, maxWidth: number): BreakChoice => {
	const words = toWords(text);
	const native = layoutNative(words, measure, maxWidth);
	const keep = { breaks: native, native, changed: false };
	if (native.length === 0 || words.some((w) => measure(w.text) > maxWidth)) return keep;
	const best = layoutBest(words, measure, maxWidth, native.length + 1);
	if (!best) return keep;
	const a = scoreBreaks(words, measure, maxWidth, native);
	const b = scoreBreaks(words, measure, maxWidth, best);
	return b.penalty < a.penalty ? { breaks: best, native, changed: true } : keep;
};
