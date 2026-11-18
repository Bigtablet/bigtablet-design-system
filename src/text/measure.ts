// 글자 폭 측정 - canvas `measureText` 로 어절 폭을 한 번 재서 캐시한다 (#1083, pretext 의 "prepare 한 번").
// 폭이 바뀌어도 다시 재지 않고 덧셈만 한다. DOM 을 읽지 않아 레이아웃을 다시 계산시키지 않는다.
import type { MeasureText } from "./layout";

export interface CanvasMeasurer extends MeasureText {
	/** 캐시를 비운다 - 웹폰트가 늦게 로드되면 그 전 폭은 대체 글꼴 것이다 */
	clear: () => void;
}

/**
 * `font` 는 canvas 글꼴 단축 표기(`"500 16px Pretendard"`), `letterSpacing` 은 px.
 * canvas 를 못 만드는 환경(SSR)에서는 null - 그때는 브라우저 줄바꿈 그대로 둔다
 */
export const createCanvasMeasurer = (font: string, letterSpacing = 0): CanvasMeasurer | null => {
	if (typeof document === "undefined") return null;
	const context = document.createElement("canvas").getContext("2d");
	if (!context) return null;
	context.font = font;
	const cache = new Map<string, number>();
	const measure = ((text: string) => {
		const hit = cache.get(text);
		if (hit !== undefined) return hit;
		// letter-spacing 은 글자마다 뒤에 붙는다 - 공백도 한 글자다
		const width = context.measureText(text).width + letterSpacing * [...text].length;
		cache.set(text, width);
		return width;
	}) as CanvasMeasurer;
	measure.clear = () => cache.clear();
	return measure;
};

/** 요소의 계산된 글꼴을 canvas 단축 표기와 letter-spacing(px) 으로 - 측정기를 CSS 와 맞춘다 */
export const fontOf = (element: Element): { font: string; letterSpacing: number } => {
	const style = getComputedStyle(element);
	const letterSpacing = Number.parseFloat(style.letterSpacing);
	return {
		font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
		letterSpacing: Number.isFinite(letterSpacing) ? letterSpacing : 0,
	};
};
