import * as React from "react";
import type { SafeHTMLProps } from "../utils/safe-html";
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
	for (const child of React.Children.toArray(children)) {
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

/** 그린 어절의 폭 - 어절 span 이 줄을 넘어 갈라졌어도(긴 코드) 조각들의 합 */
const widthOf = (el: Element) => [...el.getClientRects()].reduce((sum, r) => sum + r.width, 0);

/** 같은 글꼴은 측정기 하나를 함께 쓴다 - 문단마다 canvas 를 새로 만들지 않게 */
const measurers = new Map<string, CanvasMeasurer | null>();
const measurerFor = (font: string, letterSpacing: number) => {
	const key = `${font}|${letterSpacing}`;
	if (!measurers.has(key)) measurers.set(key, createCanvasMeasurer(font, letterSpacing));
	return measurers.get(key) ?? null;
};

/** 폭이 바뀐 뒤 이만큼 멈추면 다시 계산한다 - 드래그로 창을 늘리는 동안 매 프레임 계산하지 않게 (semantic-wrap "settled") */
const SETTLE_MS = 100;
/** 첫 렌더에서 함께 묶는 최대 어절 수 - `phraseRanges` 와 같다 */
const MAX_PHRASE = 3;

/**
 * @description
 * 실제 폭을 재서 가장 자연스러운 자리에서 줄을 바꾸는 글 (#1083) - 제목 · 히어로 · 짧은 소개 문구용.
 * 첫 렌더(SSR 포함)는 붙여 둘 어절만 묶은 원문이고, 마운트 · 폰트 로드 · 폭 변화(멈춘 뒤) 때 브라우저가 그린 줄과
 * 어절 폭을 화면에서 읽어 같은 줄 수 안에서 더 나은 줄바꿈이 있을 때만 바꾼다. 화면에서 재므로 코드 · 굵게가 섞여도 맞는다.
 * 폭이 바뀌는 동안은 브라우저 줄바꿈으로 돌아갔다가 멈추면 다시 고른다.
 * 고른 줄은 `<br>` 이 아니라 inline-block 묶음으로 그린다 - 공백이 그대로라 복사한 글 · `textContent` 가 원문과 같고,
 * 측정이 1px 어긋나도 묶음 안에서 줄이 바뀌어 넘치지 않는다.
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
	const key = tokens.map((t) => t.text).join("\u0001");
	const [chosen, setChosen] = React.useState<{ key: string; breaks: Breaks } | null>(null);
	// 글이 바뀐 뒤 새로 재기 전까지는 앞 글의 줄바꿈을 쓰지 않는다 - 어절 번호가 다르다
	const breaks = chosen?.key === key ? chosen.breaks : null;
	const latest = React.useRef(tokens);
	latest.current = tokens;

	React.useEffect(() => {
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
		/** 브라우저 줄바꿈 그대로 그려진 상태에서만 돈다 - 그 줄을 화면에서 읽어 기준으로 삼는다 */
		const compute = () => {
			const words = latest.current;
			const spans = [...el.querySelectorAll(".text_balanced_word")];
			if (width <= 0 || spans.length !== words.length) return;
			if (el.querySelector(".text_balanced_line")) return;
			const { font, letterSpacing } = fontOf(el);
			// 어절 사이 공백만 canvas 로 잰다 - 줄 끝 공백은 화면에서 폭이 0 으로 접혀 DOM 으로는 못 잰다
			const measure = measurerFor(font, letterSpacing);
			if (!measure) return;
			const measured = words.map((w, i) => ({ ...w, width: widthOf(spans[i] as Element) }));
			// 줄보다 긴 어절은 브라우저가 그 안에서 끊는다 - 손대지 않는다
			if (measured.some((w) => w.width > width)) return;
			// 브라우저가 실제로 그린 줄 - 예측(layoutNative)은 코드 뒤 조사 · <wbr> 같은 끊을 자리를 다 알지 못한다
			const tops = spans.map((span) => [...span.getClientRects()].map((r) => Math.round(r.top)));
			const drawn = new Set(tops.flat()).size;
			// 어절 안에서 끊겼거나("variant=\"preview\" / 면") 첫 렌더의 어절 묶음(inline-block)이 줄을 늘렸으면
			// 그 줄바꿈은 기준으로 쓸 수 없다 - 묶음 없이 들어가는 줄 수(예측은 줄 수를 많게 잡을 뿐 적게 잡지 않는다)로
			// 가장 나은 배치를 고르되, 꼭 붙여 둘 자리(벌점 100)를 끊어야만 들어가면 브라우저 결과를 둔다
			const split = tops.some((t) => new Set(t).size > 1);
			const plain = layoutNative(measured, measure, width).length + 1;
			const acceptable = (lines: number) => {
				const best = layoutBest(measured, measure, width, lines);
				return best && scoreBreaks(measured, measure, width, best).penalty < 100 ? best : null;
			};
			if (split || plain < drawn) {
				const best = acceptable(Math.min(plain, drawn));
				if (best) return setChosen({ key, breaks: best });
				// 줄 수를 줄일 수 없으면 그려진 줄 수 안에서라도 고른다
				if (split) {
					const same = acceptable(drawn);
					if (same) setChosen({ key, breaks: same });
					return;
				}
			}
			const native = tops.flatMap((t, i) => (i > 0 && t[0] !== tops[i - 1]?.[0] ? [i - 1] : []));
			const choice = chooseWordBreaks(measured, measure, width, native);
			if (choice.changed) setChosen({ key, breaks: choice.breaks });
		};
		/** 고른 줄을 내리고 브라우저 줄바꿈으로 돌아간 뒤(다음 렌더) 다시 잰다 */
		const recompute = () => {
			setChosen(null);
			clearTimeout(timer);
			timer = setTimeout(() => {
				if (!cancelled) compute();
			}, SETTLE_MS);
		};
		compute();
		// 웹폰트가 늦게 오면 그 전 폭은 대체 글꼴 것이다 - 이미 다 받았으면(새로고침 · 다른 페이지로 이동) 다시 재지 않는다.
		// 다시 재면 브라우저 줄바꿈으로 한 번 돌아갔다 오면서 줄이 깜빡인다
		if (document.fonts && document.fonts.status !== "loaded")
			document.fonts.ready.then(() => {
				if (cancelled) return;
				for (const m of measurers.values()) m?.clear();
				recompute();
			});
		// jsdom 같은 환경에는 없다 - 소비 앱 테스트가 이 컴포넌트를 그려도 깨지지 않게
		const observer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => {
						// 줄을 바꾸면 높이도 바뀌어 다시 불린다 - 폭이 그대로면 넘긴다
						const next = contentWidth();
						if (next === width) return;
						width = next;
						recompute();
					});
		observer?.observe(el);
		return () => {
			cancelled = true;
			clearTimeout(timer);
			observer?.disconnect();
		};
	}, [key]);

	const word = (i: number) => {
		const t = tokens[i] as Token;
		return (
			<span key={t.start} className="text_balanced_word">
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
			// 앞 줄과의 사이는 원문 그대로 - 줄은 그 자리에서만 바뀐다
			if (from > 0) body.push(tokens[from]?.gap);
			body.push(
				<span key={`line${from}`} className="text_balanced_line">
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
