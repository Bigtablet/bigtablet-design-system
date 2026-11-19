// 화면(DOM)에서 줄을 고른다 (#1083) - React 없음. BalancedText(하이드레이션 뒤)와 하이드레이션 전 스크립트(prehydrate.ts)가
// 같이 쓴다. 두 쪽이 같은 함수 · 같은 DOM 으로 고르니 서버 HTML 에서 고른 줄과 하이드레이션 뒤 줄이 같아, 넘겨받을 때 화면이 움직이지 않는다.

import {
	type Breaks,
	chooseWordBreaks,
	layoutBest,
	layoutNative,
	type MeasureText,
	scoreBreaks,
	type Word,
} from "./layout";
import { fontOf } from "./measure";

/** 어절 span 클래스 - BalancedText 가 그리고 여기 · 하이드레이션 전 CSS 가 찾는다 */
export const WORD_CLASS = "text_balanced_word";
/** BalancedText 루트의 인스턴스 id(`useId`) - 하이드레이션 전 CSS 규칙을 이 루트에만 건다 */
export const ID_ATTR = "data-balanced";
/** 하이드레이션 전 스크립트가 규칙을 넣는 <style> */
export const PREHYDRATE_STYLE_ID = "bt-balanced-prehydrate";

/** 루트를 가리키는 CSS 선택자 - id 는 `useId` 값이라 따옴표 · 역슬래시만 막으면 된다 */
export const rootSelector = (id: string) => `[${ID_ATTR}="${id.replace(/["\\]/g, "\\$&")}"]`;

/** 안쪽 여백을 뺀 폭 - 줄이 들어갈 폭 */
export const contentWidth = (el: HTMLElement) => {
	const style = getComputedStyle(el);
	return (
		el.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)
	);
};

/** 루트의 어절 span - children 안에 다른 BalancedText 가 있으면 그 어절은 바깥 어절 span 안에 있다 - 빼고 센다 */
export const wordSpans = (el: HTMLElement) =>
	[...el.querySelectorAll<HTMLElement>(`.${WORD_CLASS}`)].filter(
		(span) => !el.contains(span.parentElement?.closest(`.${WORD_CLASS}`) ?? null),
	);

/** 앞 어절과의 사이 글자에 공백이 있는가 - 없으면 괄호 앞뒤처럼 붙은 자리다 */
const spaceBefore = (span: HTMLElement) => {
	let gap = "";
	for (let n = span.previousSibling; n; n = n.previousSibling) {
		if (n instanceof Element && n.classList.contains(WORD_CLASS)) break;
		gap += n.textContent ?? "";
	}
	return /\s/.test(gap);
};

/**
 * 그린 어절의 폭. 줄을 넘어 갈라진 어절(공백이 든 코드 "update({ confirmDisabled: true })")은 조각을 더하면 갈라진
 * 자리의 공백이 빠져 모자란다 - 그때만 잠깐 한 줄로 펴서 잰다
 */
const widthOf = (el: HTMLElement) => {
	const rects = [...el.getClientRects()];
	if (new Set(rects.map((r) => Math.round(r.top))).size < 2)
		return rects.reduce((sum, r) => sum + r.width, 0);
	// nowrap 만으로는 안 된다 - 코드 안 <wbr> 은 nowrap 이어도 끊긴다(text.scss 가 잴 때만 끈다)
	el.classList.add("text_balanced_word_measure");
	const width = el.getBoundingClientRect().width;
	el.classList.remove("text_balanced_word_measure");
	return width;
};

/**
 * 브라우저 줄바꿈 그대로 그려진 루트에서 줄을 고른다 - 그린 줄과 어절 폭을 화면에서 읽어 같은 줄 수 안에서 가장 나은 줄바꿈.
 * 손대지 않는 게 나으면(줄보다 긴 어절, 줄 수를 맞추려면 꼭 붙여 둘 자리를 끊어야 할 때) null.
 * `measure` 는 어절 사이 공백 폭에만 쓴다 - 줄 끝 공백은 화면에서 폭이 0 으로 접혀 DOM 으로는 못 잰다
 */
export const chooseDomBreaks = (el: HTMLElement, measure: MeasureText): Breaks | null => {
	const width = contentWidth(el);
	const spans = wordSpans(el);
	if (width <= 0 || spans.length === 0) return null;
	// 고른 줄은 nowrap 이라 넘치면 그대로 삐져나온다 - 공백 폭(canvas)과 화면의 소수점 차이만큼 1px 여유를 둔다
	const fit = width - 1;
	const words: Word[] = spans.map((span, i) => ({
		text: span.textContent ?? "",
		start: 0,
		end: 0,
		spaceBefore: i > 0 && spaceBefore(span),
		width: widthOf(span),
	}));
	// 줄보다 긴 어절은 브라우저가 그 안에서 끊는다 - 손대지 않는다
	if (words.some((w) => (w.width ?? 0) > fit)) return null;
	// 브라우저가 실제로 그린 줄 - 예측(layoutNative)은 코드 뒤 조사 · <wbr> 같은 끊을 자리를 다 알지 못한다.
	// 글자도 폭도 없는 어절(빈 요소)은 상자가 없다 - 앞 어절의 줄로 본다
	let lastTop = 0;
	const tops = spans.map((span) => {
		const t = [...span.getClientRects()].map((r) => Math.round(r.top));
		if (t.length === 0) return [lastTop];
		lastTop = t.at(-1) ?? lastTop;
		return t;
	});
	const drawn = new Set(tops.flat()).size;
	// 어절 안에서 끊겼거나("variant=\"preview\" / 면") 브라우저(text-wrap: pretty)가 줄을 늘렸으면 그 줄바꿈은 기준으로 쓸 수
	// 없다 - 앞에서부터 채운 줄 수(예측은 줄 수를 많게 잡을 뿐 적게 잡지 않는다)로 가장 나은 배치를 고르되, 꼭 붙여 둘
	// 자리(벌점 100)를 끊어야만 들어가면 브라우저 결과를 둔다
	const split = tops.some((t) => new Set(t).size > 1);
	const plain = layoutNative(words, measure, fit).length + 1;
	const acceptable = (lines: number) => {
		const best = layoutBest(words, measure, fit, lines);
		return best && scoreBreaks(words, measure, fit, best).penalty < 100 ? best : null;
	};
	if (split || plain < drawn) {
		const best = acceptable(Math.min(plain, drawn));
		if (best) return best;
		// 줄 수를 줄일 수 없으면 그려진 줄 수 안에서, 그래도 꼭 붙여 둘 자리를 끊어야 하면 한 줄을 더 써서 고른다
		if (split) return acceptable(drawn) ?? acceptable(drawn + 1);
	}
	const native = tops.flatMap((t, i) => (i > 0 && t[0] !== tops[i - 1]?.[0] ? [i - 1] : []));
	const chosen = chooseWordBreaks(words, measure, fit, native).breaks;
	// 그 줄 수로는 꼭 붙여 둘 자리("표의 / 점에", "`query.data` / 에는")를 끊을 수밖에 없으면 한 줄을 더 쓴다
	if (scoreBreaks(words, measure, fit, chosen).penalty >= 100)
		return acceptable(native.length + 2) ?? chosen;
	return chosen;
};

/**
 * 이 루트의 글꼴을 다 받았는가 - 아니면 받는 동안 기다릴 Promise. 문서 전체 상태(`document.fonts.status`)는 아직 받기 시작하지
 * 않은 글꼴을 "loaded" 로 보여 대체 글꼴 폭으로 재게 된다 - 이 글꼴 · 이 글자로 직접 묻고, 모자라면 받기를 시작시킨다
 */
export const fontPending = (el: HTMLElement): Promise<unknown> | null => {
	const fonts = typeof document === "undefined" ? undefined : document.fonts;
	if (!fonts?.check) return null;
	const { font } = fontOf(el);
	const sample = (el.textContent ?? "").slice(0, 64);
	try {
		return fonts.check(font, sample) ? null : fonts.load(font, sample);
	} catch {
		// 글꼴 단축 표기를 못 읽는 값(시스템 글꼴 키워드 등) - 기다리지 않는다
		return null;
	}
};

/** 하이드레이션 전 스크립트가 이 루트에 건 규칙을 지운다 - BalancedText 가 넘겨받아 직접 줄을 그리기 전에 */
export const releasePrehydrate = (el: HTMLElement) => {
	const id = el.getAttribute(ID_ATTR);
	const sheet = (document.getElementById(PREHYDRATE_STYLE_ID) as HTMLStyleElement | null)?.sheet;
	if (!id || !sheet) return;
	const selector = rootSelector(id);
	for (let i = sheet.cssRules.length - 1; i >= 0; i--)
		if ((sheet.cssRules[i] as CSSStyleRule).selectorText?.startsWith(selector)) sheet.deleteRule(i);
};
