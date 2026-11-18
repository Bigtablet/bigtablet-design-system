import * as React from "react";
import type { SafeHTMLProps } from "../utils/safe-html";
import { type Breaks, chooseBreaks, toWords } from "./layout";
import { type CanvasMeasurer, createCanvasMeasurer, fontOf } from "./measure";
import { renderPhrases } from "./react";
import "./text.scss";

export interface BalancedTextProps
	extends Omit<SafeHTMLProps<React.HTMLAttributes<HTMLElement>>, "children"> {
	/** 줄을 나눌 글 - 글자만 받는다(코드 · 링크가 섞인 문단은 `Sentences` · `renderSentences`) */
	text: string;
	/** 그릴 요소 (기본값: "span"). 폭을 재므로 블록으로 놓이는 요소(h1 · p 또는 display: block)여야 한다 */
	as?: React.ElementType;
}

/** 같은 글꼴은 측정기 하나를 함께 쓴다 - 어절 폭 캐시를 나눠 갖는다 */
const measurers = new Map<string, CanvasMeasurer | null>();
const measurerFor = (font: string, letterSpacing: number) => {
	const key = `${font}|${letterSpacing}`;
	if (!measurers.has(key)) measurers.set(key, createCanvasMeasurer(font, letterSpacing));
	return measurers.get(key) ?? null;
};

/** 폭이 바뀐 뒤 이만큼 멈추면 다시 계산한다 - 드래그로 창을 늘리는 동안 매 프레임 계산하지 않게 (semantic-wrap "settled") */
const SETTLE_MS = 100;

/**
 * @description
 * 실제 폭을 재서 가장 자연스러운 자리에서 줄을 바꾸는 글 (#1083) - 제목 · 히어로 · 짧은 소개 문구용.
 * 첫 렌더(SSR 포함)는 글자 규칙(`renderPhrases`)만 건 원문이고, 마운트 · 폰트 로드 · 폭 변화(멈춘 뒤) 때 줄을 계산해
 * 브라우저 줄바꿈보다 나을 때만 바꾼다. 고른 줄은 `<br>` 이 아니라 inline-block 묶음으로 그린다 - 공백이 그대로라
 * 복사한 글 · `textContent` 가 원문과 같고, 측정이 1px 어긋나도 묶음 안에서 줄이 바뀌어 넘치지 않는다.
 *
 * @example
 * <BalancedText as="h1" className="hero_title" text="고객의 신뢰를 먼저 얻은 다음에 더 많은 데이터를 요청하세요" />
 */
export const BalancedText = ({ text, as: Tag = "span", ...props }: BalancedTextProps) => {
	const ref = React.useRef<HTMLElement>(null);
	const [breaks, setBreaks] = React.useState<Breaks | null>(null);

	React.useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let width = -1;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;
		const compute = () => {
			const style = getComputedStyle(el);
			const next =
				el.clientWidth -
				Number.parseFloat(style.paddingLeft) -
				Number.parseFloat(style.paddingRight);
			if (next <= 0 || next === width) return;
			width = next;
			const { font, letterSpacing } = fontOf(el);
			const measure = measurerFor(font, letterSpacing);
			if (!measure) return;
			const choice = chooseBreaks(text, measure, width);
			setBreaks(choice.changed ? choice.breaks : null);
		};
		compute();
		// 웹폰트가 늦게 오면 그 전 폭은 대체 글꼴 것이다 - 캐시를 비우고 다시 잰다
		document.fonts?.ready.then(() => {
			if (cancelled) return;
			for (const m of measurers.values()) m?.clear();
			width = -1;
			compute();
		});
		// jsdom 같은 환경에는 없다 - 소비 앱 테스트가 이 컴포넌트를 그려도 깨지지 않게
		const observer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => {
						clearTimeout(timer);
						timer = setTimeout(compute, SETTLE_MS);
					});
		observer?.observe(el);
		return () => {
			cancelled = true;
			clearTimeout(timer);
			observer?.disconnect();
		};
	}, [text]);

	if (!breaks) {
		return (
			<Tag ref={ref} {...props}>
				{renderPhrases(text)}
			</Tag>
		);
	}
	const words = toWords(text);
	const lines: React.ReactNode[] = [];
	let from = 0;
	for (const end of [...breaks, words.length - 1]) {
		const first = words[from];
		const last = words[end];
		if (!first || !last) break;
		// 앞 줄과의 사이는 원문 그대로(공백이면 공백, 괄호 앞뒤면 없음) - 줄은 그 자리에서만 바뀐다
		if (from > 0) lines.push(text.slice(words[from - 1]?.end ?? first.start, first.start));
		lines.push(
			<span key={first.start} className="text_balanced_line">
				{text.slice(first.start, last.end)}
			</span>,
		);
		from = end + 1;
	}
	return (
		<Tag ref={ref} {...props}>
			{lines}
		</Tag>
	);
};
