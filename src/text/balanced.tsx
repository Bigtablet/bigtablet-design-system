"use client";

import * as React from "react";
import { BREAK_SPACE } from "./core";
import {
	chooseDomBreaks,
	contentWidth,
	fontPending,
	ID_ATTR,
	releasePrehydrate,
	WORD_CLASS,
	wordSpans,
} from "./dom";
import { type Breaks, toWords, type Word } from "./layout";
import { type CanvasMeasurer, createCanvasMeasurer, fontOf } from "./measure";
import { balancedTextScript } from "./prehydrate-script";
import "./text.scss";

// src/text 는 바깥(src/utils · src/ui)을 쓰지 않는다 - 따로 떼어 낼 수 있게 (#1095, biome noRestrictedImports).
// 그래서 src/utils/use-safe-layout-effect.ts 와 같은 한 줄을 여기 둔다. props 의 dangerouslySetInnerHTML 제외도
// src/utils/safe-html.ts(SafeHTMLProps)와 같은 규칙이다 - 그쪽이 막는 속성을 늘리면 여기도 함께 고친다
const useSafeLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface BalancedTextProps
	extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "dangerouslySetInnerHTML"> {
	/**
	 * 줄을 나눌 글. 글자와 인라인 요소(`<code>` · `<strong>` · 링크)를 섞어도 된다 - 요소 하나는 쪼개지 않는 한 조각이고,
	 * 공백 없이 붙은 글자("`useToast` 가" 의 "가" 는 띄었으니 따로, "`x`에서" 는 한 어절)와 한 어절이 된다
	 */
	children: React.ReactNode;
	/**
	 * 그릴 요소 (기본값: "span"). 폭을 재므로 블록으로 놓여야 한다 - 기본 span 은 `.text_balanced` 가 블록으로 둔다.
	 * 다른 요소는 제 display 를 그대로 쓴다(li · td 등) - 인라인 요소(a · strong 등)를 고르면 `display: block` 을 준다
	 */
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
		for (const chunk of String(child).split(new RegExp(`(${BREAK_SPACE.source})`))) {
			if (!chunk) continue;
			if (BREAK_SPACE.test(chunk)) {
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

/** 같은 글꼴은 측정기 하나를 함께 쓴다 - 문단마다 canvas 를 새로 만들지 않게 */
const measurers = new Map<string, CanvasMeasurer | null>();
const measurerFor = (font: string, letterSpacing: number) => {
	const key = `${font}|${letterSpacing}`;
	if (!measurers.has(key)) measurers.set(key, createCanvasMeasurer(font, letterSpacing));
	return measurers.get(key) ?? null;
};

/** 폭이 바뀐 뒤 이만큼 멈추면 다시 계산한다 - 드래그로 창을 늘리는 동안 매 프레임 계산하지 않게 (semantic-wrap "settled") */
const SETTLE_MS = 100;
/** 1초 안에 줄을 이보다 많이 다시 그리면 브라우저 줄바꿈으로 멈춘다 - 폭이 줄을 따라 오가는 상자 */
const MAX_CHURN = 6;

/**
 * @description
 * 실제 폭을 재서 가장 자연스러운 자리에서 줄을 바꾸는 글 (#1083) - 제목 · 히어로 · 짧은 소개 문구용.
 * 첫 렌더(SSR 포함)는 원문 그대로(`text-wrap: pretty`)이고, 마운트 · 폰트 로드 · 폭 변화(멈춘 뒤) 때 브라우저가 그린 줄과
 * 어절 폭을 화면에서 읽어 같은 줄 수 안에서 가장 나은 줄바꿈을 고른다. 화면에서 재므로 코드 · 굵게가 섞여도 맞는다.
 * SSR 앱은 `BalancedTextScript` 를 함께 두면 하이드레이션 전 서버 HTML 에서도 같은 줄을 고른다.
 * 폭이 바뀌는 동안은 브라우저 줄바꿈으로 돌아갔다가 멈추면 다시 고른다.
 * 고른 줄은 `<br>` 이 아니라 nowrap 묶음으로 그린다 - 공백이 그대로라 복사한 글 · `textContent` · 페이지 검색(Ctrl+F)이
 * 원문과 같다. inline-block 이면 Chrome 이 그 경계를 건너 검색하지 못한다.
 *
 * @example
 * <BalancedText as="p" className="lede">
 *   마크업 없이 <code>useConfirm</code> 훅으로 띄웁니다.
 * </BalancedText>
 */
export const BalancedText = ({
	children,
	as: Tag = "span",
	className,
	...props
}: BalancedTextProps) => {
	const ref = React.useRef<HTMLElement>(null);
	// 하이드레이션 전 스크립트가 이 루트에만 규칙을 걸 때 쓰는 id - 서버 · 클라이언트가 같은 값을 낸다
	const id = React.useId();
	const { tokens, lead, tail } = tokenize(children);
	// 글이 같으면 다시 계산하지 않는다 - children 은 렌더마다 새 객체다. className 은 굵기 · 크기를 바꿔도 상자 폭이 그대로라
	// RO 가 안 불린다 - 그래서 함께 본다
	const key = `${className ?? ""}\u0002${tokens.map((t) => t.nodes.map(shapeOf).join("")).join("\u0001")}`;
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
	/** 지금 그린 줄을 고른 폭 */
	const drawnFor = React.useRef(0);
	/** 폭이 내용으로 정해지는 상자인가 - 한 번 알면 다시 고를 때도 inline-block 줄로 그린다 */
	const contentSized = React.useRef(false);
	latest.current = tokens;

	// 그리기 전에 잰다 - useEffect 면 브라우저 줄바꿈으로 한 프레임 칠한 뒤 바뀌어 첫 진입 때 줄이 튄다
	useSafeLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		// 다른 글(key)로 고른 줄은 버린다 - A → 숨긴 B → 폭이 바뀐 뒤 A 로 돌아오면 A 의 옛 줄이 그대로 그려지고, 줄이 이미 있어
		// 아래 compute 가 다시 재지 않는다 (#1113 리뷰). 원문으로 돌아간 다음 렌더에서 지금 폭으로 다시 잰다
		setChosen((c) => (c && c.key !== key ? null : c));
		let timer: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;
		let width = contentWidth(el);
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
			drawnFor.current = width;
			setChosen({ key, breaks, boxed: contentSized.current });
		};
		/** 브라우저 줄바꿈 그대로 그려진 상태에서만 돈다 - 그 줄을 화면에서 읽어 기준으로 삼는다(dom.ts) */
		const compute = (fontWaited = false) => {
			if (gaveUp) return;
			// 이 글꼴을 아직 받는 중이면(첫 방문 · 숨어 있다 보이며 처음 쓰는 굵기) 받은 뒤 잰다 - 폭은 그대로라 RO 가 안 불린다.
			// 한 번만 기다린다 - 받은 뒤에도 check 가 false 인 글꼴(unicode-range 밖 글자 · 실패한 face)은 다시 물으면 끝없이 돈다 (#1113)
			const pending = fontWaited ? null : fontPending(el);
			if (pending) {
				pending.then(
					() => {
						if (cancelled) return;
						for (const m of measurers.values()) m?.clear();
						compute(true);
					},
					() => {},
				);
				return;
			}
			if (el.querySelector(":scope > .text_balanced_line")) return;
			// 하이드레이션 전 스크립트가 건 줄(CSS)을 걷고 브라우저 줄바꿈으로 돌려 잰다 - 같은 함수라 같은 줄이 나와, 칠하기 전에
			// 진짜 줄로 바꿔도 화면은 그대로다
			releasePrehydrate(el);
			if (wordSpans(el).length !== latest.current.length) return;
			width = contentWidth(el);
			const { font, letterSpacing } = fontOf(el);
			const measure = measurerFor(font, letterSpacing);
			const breaks = measure && chooseDomBreaks(el, measure);
			if (breaks) apply(breaks);
		};
		/** 고른 줄을 내리고 브라우저 줄바꿈으로 돌아간 뒤(다음 렌더) 다시 잰다 */
		const recompute = () => {
			setChosen(null);
			clearTimeout(timer);
			timer = setTimeout(() => {
				if (!cancelled) compute();
			}, SETTLE_MS);
		};
		// 웹폰트가 아직이면 compute 가 받은 뒤로 미룬다 - 대체 글꼴 폭으로 고른 줄은 폰트가 오면 틀려 두 번 바뀐다.
		// 그동안은 브라우저 줄바꿈 그대로고, 폰트가 오면(글꼴이 바뀌며 어차피 줄이 움직이는 때) 한 번만 고른다
		compute();
		// jsdom 같은 환경에는 없다 - 소비 앱 테스트가 이 컴포넌트를 그려도 깨지지 않게
		const observer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => {
						// 줄을 바꾸면 높이도 바뀌어 다시 불린다 - 폭이 그대로면 넘긴다
						// 우리 줄이 넓힌 상자는 그리자마자(아래 layout effect) inline-block 으로 되돌려 이 시점엔 폭이 그대로다
						const next = contentWidth(el);
						if (next === width) return;
						width = next;
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

	// 줄을 그린 직후, 칠하기 전에 본다 (#1083)
	// - 상자가 넓어졌다: 폭이 내용으로 정해지는 상자(auto 표의 칸 · 폭 없는 flex 항목)다. nowrap 줄이 최소 폭을 줄 길이로 키운
	//   것이다 - 같은 작업 안이라 바깥 리사이즈일 수 없다. 이 상자는 이제부터 inline-block 줄(최소 폭 = 가장 긴 어절)로 그려
	//   폭을 원래대로 둔다. 그 상자 안에서만 페이지 검색이 줄 경계를 건너지 못한다
	// - 줄이 상자 밖으로 나갔다(측정이 어긋남): inline-block 줄로 바꿔 그 안에서 줄이 바뀌게 한다
	useSafeLayoutEffect(() => {
		const el = ref.current;
		if (!el || !breaks || boxed) return;
		const style = getComputedStyle(el);
		const inner =
			el.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
		// 넓어졌으면 줄을 잠깐 inline-block 으로 바꿔 다시 잰다 - 좁아지면 우리 줄 탓이고, 그대로면 바깥에서 넓어진 것(RO 가 다시 고른다)
		let grew = false;
		if (inner > drawnFor.current + 0.5) {
			const before = el.clientWidth;
			el.classList.add("text_balanced_probe");
			grew = el.clientWidth < before - 0.5;
			el.classList.remove("text_balanced_probe");
		}
		const right = el.getBoundingClientRect().right - Number.parseFloat(style.paddingRight);
		const lines = el.querySelectorAll(":scope > .text_balanced_line");
		const overflow = [...lines].some((line) => line.getBoundingClientRect().right > right + 0.5);
		if (grew) contentSized.current = true;
		if (grew || overflow) setChosen((c) => (c ? { ...c, boxed: true } : c));
	}, [chosen]);

	const word = (i: number) => {
		const t = tokens[i] as Token;
		return (
			<span key={i} className={WORD_CLASS}>
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
		// 계산 전(SSR · canvas 없음) - 원문 그대로. 어절 span 은 루트 바로 아래에 둔다 - 하이드레이션 전 스크립트가
		// `:nth-child(n of .text_balanced_word)` 로 어절을 센다
		body.push(run(0, tokens.length - 1));
	}
	return (
		// props 를 먼저 펼친다 - 하이드레이션 전 스크립트와 맞추는 식별자(data-balanced)는 소비자 값에 덮이지 않아야 한다
		<Tag
			ref={ref}
			{...props}
			className={className ? `text_balanced ${className}` : "text_balanced"}
			{...{ [ID_ATTR]: id }}
		>
			{lead}
			{body}
			{tail}
		</Tag>
	);
};

export interface BalancedTextScriptProps {
	/** CSP `script-src 'nonce-…'` 를 쓰면 같은 값 */
	nonce?: string;
}

/**
 * @description
 * SSR 앱에서 하이드레이션 전에 서버 HTML 의 `BalancedText` 줄을 고르는 인라인 스크립트 (#1085). 없으면 JS 가 뜨기 전 첫 화면은
 * 브라우저 줄바꿈이고 하이드레이션 때 한 번 바뀐다. React 가 그린 DOM 은 건드리지 않고 `<style>` 규칙만 넣어 하이드레이션이
 * 어긋나지 않는다. `<body>` 끝(BalancedText 들 뒤)에 한 번 둔다. 클라이언트에서만 그리는 앱(CSR)에는 필요 없다.
 *
 * @example
 * // app/layout.tsx
 * <body>
 *   {children}
 *   <BalancedTextScript />
 * </body>
 */
export const BalancedTextScript = ({ nonce }: BalancedTextScriptProps) => (
	// biome-ignore lint/security/noDangerouslySetInnerHtml: 패키지가 빌드 때 만든 고정 문자열(scripts/build-prehydrate.mjs) - 사용자 입력이 섞이지 않는다
	<script nonce={nonce} dangerouslySetInnerHTML={{ __html: balancedTextScript }} />
);
