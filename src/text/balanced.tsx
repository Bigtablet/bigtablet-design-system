import * as React from "react";
import type { SafeHTMLProps } from "../utils/safe-html";
import { useSafeLayoutEffect } from "../utils/use-safe-layout-effect";
import { gapPenalty } from "./core";
import {
	type Breaks,
	chooseWordBreaks,
	layoutBest,
	layoutNative,
	scoreBreaks,
	toWords,
	type Word,
} from "./layout";
import { type CanvasMeasurer, createCanvasMeasurer, fontOf } from "./measure";
import "./text.scss";

export interface BalancedTextProps
	extends Omit<SafeHTMLProps<React.HTMLAttributes<HTMLElement>>, "children"> {
	/**
	 * 줄을 나눌 글. 글자와 인라인 요소(`<code>` · `<strong>` · 링크)를 섞어도 된다 - 요소 하나는 쪼개지 않는 한 조각이고,
	 * 공백 없이 붙은 글자("`useToast` 가" 의 "가" 는 띄었으니 따로, "`x`에서" 는 한 어절)와 한 어절이 된다
	 */
	children: React.ReactNode;
	/** 그릴 요소 (기본값: "span"). 폭을 재므로 블록으로 놓이는 요소(h1 · p 또는 display: block)여야 한다 */
	as?: React.ElementType;
}

/** 줄을 바꿀 수 있는 조각 하나 - 엔진의 어절(`Word`)에 화면에 그릴 노드와 앞 공백 원문을 붙였다 */
interface Token extends Word {
	nodes: React.ReactNode[];
	/** 앞 어절과의 사이 원문(공백이면 그 공백, 괄호 앞뒤처럼 붙어 있으면 "") */
	gap: string;
}

/** 요소 안 글자 - 줄바꿈 규칙(조사 · 서술어)을 볼 때만 쓴다 */
const textOf = (node: React.ReactNode): string => {
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (React.isValidElement<{ children?: React.ReactNode }>(node))
		return React.Children.toArray(node.props.children).map(textOf).join("");
	return "";
};

/** Fragment 를 편다 - `{ok && <>여러 어절</>}` 이 쪼갤 수 없는 한 조각이 되지 않게 */
const flatten = (children: React.ReactNode): React.ReactNode[] =>
	React.Children.toArray(children).flatMap((child) =>
		React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment
			? flatten(child.props.children)
			: [child],
	);

/** 요소의 모양 - 글자가 같아도 요소가 바뀌면(글 → `<code>`) 폭이 달라 다시 재야 한다 */
const shapeOf = (node: React.ReactNode) => {
	if (!React.isValidElement(node)) return String(node);
	const { type } = node;
	const name =
		typeof type === "string"
			? type
			: ((type as { displayName?: string; name?: string }).displayName ??
				(type as { name?: string }).name ??
				"?");
	return `<${name}>${textOf(node)}`;
};

/**
 * children 을 어절로 나눈다. 글자는 공백과 Chromium 이 끊는 괄호 자리(`toWords`)에서, 요소는 통째로 한 조각.
 * 앞뒤 공백은 `lead` · `tail` 로 원문 그대로 둔다
 */
const tokenize = (children: React.ReactNode) => {
	const tokens: Token[] = [];
	let gap = "";
	let lead = "";
	let joined = false; // 마지막 조각 뒤에 공백이 없었다 - 다음 조각은 같은 어절에 붙는다
	let pos = 0;
	const add = (text: string, node: React.ReactNode, spaceBefore: boolean) => {
		const last = tokens.at(-1);
		if (joined && last && !spaceBefore) {
			last.text += text;
			last.end += text.length;
			last.nodes.push(node);
		} else {
			if (tokens.length === 0) lead = gap;
			tokens.push({
				text,
				start: pos,
				end: pos + text.length,
				spaceBefore: tokens.length > 0 && spaceBefore,
				nodes: [node],
				gap: tokens.length > 0 ? gap : "",
			});
		}
		pos += text.length;
		gap = "";
		joined = true;
	};
	for (const child of flatten(children)) {
		if (typeof child !== "string" && typeof child !== "number") {
			add(textOf(child), child, gap !== "");
			continue;
		}
		for (const chunk of String(child).split(/(\s+)/)) {
			if (!chunk) continue;
			if (/^\s/.test(chunk)) {
				gap += chunk;
				joined = false;
				continue;
			}
			// 공백 없는 덩어리 안의 괄호 자리 - 앞 조각과 붙어 있지만 Chromium 은 거기서도 끊는다
			toWords(chunk).forEach((word, index) => {
				if (index > 0) joined = false;
				add(word.text, word.text, index === 0 && gap !== "");
			});
		}
	}
	return { tokens, lead, tail: gap };
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

/** 같은 글꼴은 측정기 하나를 함께 쓴다 - 문단마다 canvas 를 새로 만들지 않게 */
const measurers = new Map<string, CanvasMeasurer | null>();
const measurerFor = (font: string, letterSpacing: number) => {
	const key = `${font}|${letterSpacing}`;
	if (!measurers.has(key)) measurers.set(key, createCanvasMeasurer(font, letterSpacing));
	return measurers.get(key) ?? null;
};

/** 웹폰트를 받는 중인가 - 그동안 잰 폭은 대체 글꼴 것이다 */
const fontsPending = () => typeof document !== "undefined" && document.fonts?.status === "loading";

/** 폭이 바뀐 뒤 이만큼 멈추면 다시 계산한다 - 드래그로 창을 늘리는 동안 매 프레임 계산하지 않게 (semantic-wrap "settled") */
const SETTLE_MS = 100;
/** 1초 안에 줄을 이보다 많이 다시 그리면 브라우저 줄바꿈으로 멈춘다 - 폭이 줄을 따라 오가는 상자 */
const MAX_CHURN = 6;
/** 첫 렌더에서 함께 묶는 최대 어절 수 - `phraseRanges` 와 같다 */
const MAX_PHRASE = 3;

/**
 * @description
 * 실제 폭을 재서 가장 자연스러운 자리에서 줄을 바꾸는 글 (#1083) - 제목 · 히어로 · 짧은 소개 문구용.
 * 첫 렌더(SSR 포함)는 붙여 둘 어절만 묶은 원문이고, 마운트 · 폰트 로드 · 폭 변화(멈춘 뒤) 때 브라우저가 그린 줄과
 * 어절 폭을 화면에서 읽어 같은 줄 수 안에서 더 나은 줄바꿈이 있을 때만 바꾼다. 화면에서 재므로 코드 · 굵게가 섞여도 맞는다.
 * 폭이 바뀌는 동안은 브라우저 줄바꿈으로 돌아갔다가 멈추면 다시 고른다.
 * 고른 줄은 `<br>` 이 아니라 nowrap 묶음으로 그린다 - 공백이 그대로라 복사한 글 · `textContent` · 페이지 검색(Ctrl+F)이
 * 원문과 같다. inline-block 이면 Chrome 이 그 경계를 건너 검색하지 못한다.
 *
 * @example
 * <BalancedText as="p" className="lede">
 *   마크업 없이 <code>useConfirm</code> 훅으로 띄웁니다.
 * </BalancedText>
 */
export const BalancedText = ({ children, as: Tag = "span", ...props }: BalancedTextProps) => {
	const ref = React.useRef<HTMLElement>(null);
	const { tokens, lead, tail } = tokenize(children);
	// 글이 같으면 다시 계산하지 않는다 - children 은 렌더마다 새 객체다
	const key = tokens.map((t) => t.nodes.map(shapeOf).join("")).join("\u0001");
	const [chosen, setChosen] = React.useState<{
		key: string;
		breaks: Breaks;
		/** 상자 폭이 내용으로 정해진다 - 줄을 inline-block 으로 그린다(아래 apply) */
		boxed: boolean;
	} | null>(null);
	// 글이 바뀐 뒤 새로 재기 전까지는 앞 글의 줄바꿈을 쓰지 않는다 - 어절 번호가 다르다
	const breaks = chosen?.key === key ? chosen.breaks : null;
	const boxed = chosen?.boxed ?? false;
	const latest = React.useRef(tokens);
	latest.current = tokens;

	// 그리기 전에 잰다 - useEffect 면 브라우저 줄바꿈으로 한 프레임 칠한 뒤 바뀌어 첫 진입 때 줄이 튄다
	useSafeLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;
		const contentWidth = () => {
			const style = getComputedStyle(el);
			return (
				el.clientWidth -
				Number.parseFloat(style.paddingLeft) -
				Number.parseFloat(style.paddingRight)
			);
		};
		let width = contentWidth();
		/**
		 * 고른 줄을 그린다. 내용에 맞춰 폭이 정해지는 상자(auto 표의 칸 · 폭 없는 flex 항목)는 nowrap 줄이 최소 폭을 키워
		 * 상자가 넓어진다 - 그 변화에 다시 계산하면 브라우저 줄바꿈으로 돌아가 다시 좁아지고, 또 계산해 끝없이 오간다.
		 * 그래서 그린 직후 상자가 넓어진 건 넘긴다(줄은 원래 폭에 맞췄으니 넓어진 상자에도 들어간다)
		 */
		let selfResize = false;
		let contentSized = false;
		let churn = 0;
		let churnReset: ReturnType<typeof setTimeout> | undefined;
		let gaveUp = false;
		const apply = (breaks: Breaks) => {
			// 그래도 짧은 사이에 계속 다시 그리면(여러 BalancedText 가 한 열의 폭을 서로 흔들 때) 브라우저 줄바꿈으로 멈춘다.
			// 창을 끄는 동안은 멈춘 뒤에만 그려(SETTLE_MS) 여기에 걸리지 않는다
			if (++churn > MAX_CHURN) {
				gaveUp = true;
				setChosen(null);
				return;
			}
			clearTimeout(churnReset);
			churnReset = setTimeout(() => {
				churn = 0;
			}, 1000);
			selfResize = true;
			setChosen({ key, breaks, boxed: contentSized });
			// ResizeObserver 는 그 프레임의 레이아웃 뒤에 불린다 - 두 프레임 뒤에는 우리 몫이 끝났다
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					selfResize = false;
				}),
			);
		};
		/** 브라우저 줄바꿈 그대로 그려진 상태에서만 돈다 - 그 줄을 화면에서 읽어 기준으로 삼는다 */
		const compute = () => {
			if (gaveUp) return;
			width = contentWidth();
			const words = latest.current;
			// children 안에 다른 BalancedText 가 있으면 그 어절은 바깥 어절 span 안에 있다 - 빼고 센다
			const spans = [...el.querySelectorAll<HTMLElement>(".text_balanced_word")].filter(
				(span) => !el.contains(span.parentElement?.closest(".text_balanced_word") ?? null),
			);
			if (width <= 0 || spans.length !== words.length) return;
			// 숨어 있다 보이며 처음 쓰는 굵기 · 코드 폰트를 받는 중일 수 있다 - 받은 뒤 다시 잰다(폭은 그대로라 RO 가 안 불린다)
			if (fontsPending()) {
				document.fonts.ready.then(() => {
					if (!cancelled) compute();
				});
				return;
			}
			if (el.querySelector(":scope > .text_balanced_line")) return;
			const { font, letterSpacing } = fontOf(el);
			// 어절 사이 공백만 canvas 로 잰다 - 줄 끝 공백은 화면에서 폭이 0 으로 접혀 DOM 으로는 못 잰다
			const measure = measurerFor(font, letterSpacing);
			if (!measure) return;
			const measured = words.map((w, i) => ({ ...w, width: widthOf(spans[i] as HTMLElement) }));
			// 고른 줄은 nowrap 이라 넘치면 그대로 삐져나온다 - 공백 폭(canvas)과 화면의 소수점 차이만큼 1px 여유를 둔다
			const fit = width - 1;
			// 줄보다 긴 어절은 브라우저가 그 안에서 끊는다 - 손대지 않는다
			if (measured.some((w) => w.width > fit)) return;
			// 브라우저가 실제로 그린 줄 - 예측(layoutNative)은 코드 뒤 조사 · <wbr> 같은 끊을 자리를 다 알지 못한다
			// 글자도 폭도 없는 어절(빈 요소)은 상자가 없다 - 앞 어절의 줄로 본다
			let lastTop = 0;
			const tops = spans.map((span) => {
				const t = [...span.getClientRects()].map((r) => Math.round(r.top));
				if (t.length === 0) return [lastTop];
				lastTop = t.at(-1) ?? lastTop;
				return t;
			});
			const drawn = new Set(tops.flat()).size;
			// 어절 안에서 끊겼거나("variant=\"preview\" / 면") 첫 렌더의 어절 묶음(inline-block)이 줄을 늘렸으면
			// 그 줄바꿈은 기준으로 쓸 수 없다 - 묶음 없이 들어가는 줄 수(예측은 줄 수를 많게 잡을 뿐 적게 잡지 않는다)로
			// 가장 나은 배치를 고르되, 꼭 붙여 둘 자리(벌점 100)를 끊어야만 들어가면 브라우저 결과를 둔다
			const split = tops.some((t) => new Set(t).size > 1);
			const plain = layoutNative(measured, measure, fit).length + 1;
			const acceptable = (lines: number) => {
				const best = layoutBest(measured, measure, fit, lines);
				return best && scoreBreaks(measured, measure, fit, best).penalty < 100 ? best : null;
			};
			if (split || plain < drawn) {
				const best = acceptable(Math.min(plain, drawn));
				if (best) return apply(best);
				// 줄 수를 줄일 수 없으면 그려진 줄 수 안에서라도 고른다
				if (split) {
					const same = acceptable(drawn);
					if (same) apply(same);
					return;
				}
			}
			const native = tops.flatMap((t, i) => (i > 0 && t[0] !== tops[i - 1]?.[0] ? [i - 1] : []));
			// 브라우저 결과가 그대로 낫더라도 줄로 그린다 - 첫 렌더의 어절 묶음(inline-block)이 사라져야 페이지 검색이
			// 묶음 경계를 건너 이어진다(Chrome 은 inline-block 경계에서 찾기를 끊는다)
			apply(chooseWordBreaks(measured, measure, fit, native).breaks);
		};
		/** 고른 줄을 내리고 브라우저 줄바꿈으로 돌아간 뒤(다음 렌더) 다시 잰다 */
		const recompute = () => {
			setChosen(null);
			clearTimeout(timer);
			timer = setTimeout(() => {
				if (!cancelled) compute();
			}, SETTLE_MS);
		};
		// 웹폰트가 아직이면 재지 않고 기다린다 - 대체 글꼴 폭으로 고른 줄은 폰트가 오면 틀려 두 번 바뀐다.
		// 그동안은 브라우저 줄바꿈 그대로고, 폰트가 오면(글꼴이 바뀌며 어차피 줄이 움직이는 때) 한 번만 고른다
		if (fontsPending()) {
			document.fonts.ready.then(() => {
				if (cancelled) return;
				for (const m of measurers.values()) m?.clear();
				width = contentWidth();
				compute();
			});
		} else compute();
		// jsdom 같은 환경에는 없다 - 소비 앱 테스트가 이 컴포넌트를 그려도 깨지지 않게
		const observer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => {
						// 줄을 바꾸면 높이도 바뀌어 다시 불린다 - 폭이 그대로면 넘긴다
						const next = contentWidth();
						if (next === width) return;
						// 우리 줄이 상자를 넓힌 것 - 줄은 원래 폭에 맞췄으니 그대로 들어간다. 좁아진 건 늘 다시 고른다(넘치면 안 된다)
						const grownBySelf = selfResize && next > width;
						width = next;
						// 우리 줄이 상자를 넓혔다 = 폭이 내용으로 정해지는 상자다. 이제부터 줄을 inline-block 으로 그려 최소 폭을
						// 가장 긴 어절로 되돌린다(상자가 원래 폭으로 돌아오고, 그 변화로 다시 고른다). 그 상자 안에서만 페이지 검색이
						// 줄 경계를 건너지 못한다
						if (grownBySelf) {
							if (!contentSized) {
								contentSized = true;
								setChosen((c) => (c ? { ...c, boxed: true } : c));
							}
							return;
						}
						recompute();
					});
		observer?.observe(el);
		return () => {
			cancelled = true;
			clearTimeout(timer);
			clearTimeout(churnReset);
			observer?.disconnect();
		};
	}, [key]);

	// 그린 줄이 상자 밖으로 나가면(측정이 어긋난 경우) inline-block 줄로 바꾼다 - 그 안에서 줄이 바뀌어 넘치지 않는다
	useSafeLayoutEffect(() => {
		const el = ref.current;
		if (!el || !breaks || boxed) return;
		const right =
			el.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(el).paddingRight);
		const lines = el.querySelectorAll(":scope > .text_balanced_line");
		if ([...lines].some((line) => line.getBoundingClientRect().right > right + 0.5))
			setChosen((c) => (c ? { ...c, boxed: true } : c));
	}, [chosen]);

	const word = (i: number) => {
		const t = tokens[i] as Token;
		return (
			<span key={i} className="text_balanced_word">
				{t.nodes.map((node, j) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: 어절 안 조각 순서는 바뀌지 않는다
					<React.Fragment key={j}>{node}</React.Fragment>
				))}
			</span>
		);
	};
	/** from ~ to 어절을 원문 공백과 함께 */
	const run = (from: number, to: number) => {
		const out: React.ReactNode[] = [];
		for (let i = from; i <= to; i++) {
			if (i > from) out.push(tokens[i]?.gap);
			out.push(word(i));
		}
		return out;
	};

	const body: React.ReactNode[] = [];
	if (breaks) {
		let from = 0;
		for (const end of [...breaks, tokens.length - 1]) {
			// 앞 줄과의 사이는 원문 그대로 - 줄은 그 자리에서만 바뀐다. 공백 없이 붙은 자리(괄호 앞뒤)는 nowrap 끼리 맞닿아
			// 끊을 수 없으니 <wbr> 로 자리를 연다 - 글자가 아니라 복사한 글에 섞이지 않는다
			if (from > 0) body.push(tokens[from]?.gap || <wbr key={`wbr${from}`} />);
			body.push(
				<span
					key={`line${from}`}
					className={boxed ? "text_balanced_line text_balanced_line_boxed" : "text_balanced_line"}
				>
					{run(from, end)}
				</span>,
			);
			from = end + 1;
		}
	} else {
		// 계산 전(SSR · canvas 없음) - 붙여 둘 어절(`gapPenalty` 100)만 inline-block 으로 묶는다 (`renderPhrases` 와 같은 규칙).
		// 공백 없이 붙은 자리("(…)는")도 묶는다 - Chromium 은 닫는 괄호 뒤 한글 앞에서도 끊는다
		for (let i = 0; i < tokens.length; ) {
			let j = i;
			while (
				j < tokens.length - 1 &&
				j - i + 1 < MAX_PHRASE &&
				gapPenalty(tokens[j]?.text ?? "", tokens[j + 1]?.text ?? "") >= 100
			)
				j++;
			if (i > 0) body.push(tokens[i]?.gap);
			body.push(
				j > i ? (
					<span key={`phrase${i}`} className="sentences_phrase">
						{run(i, j)}
					</span>
				) : (
					word(i)
				),
			);
			i = j + 1;
		}
	}
	return (
		<Tag ref={ref} {...props}>
			{lead}
			{body}
			{tail}
		</Tag>
	);
};
