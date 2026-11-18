// 하이드레이션 전에 서버 HTML 에서 줄을 고른다 (#1085) - SSR 앱에서 JS 가 뜨기 전 첫 화면도 BalancedText 줄바꿈으로.
// React 가 그린 DOM 은 건드리지 않는다(하이드레이션이 어긋난다) - <style> 규칙만 넣는다: 루트를 nowrap 으로 두고 고른 어절
// 뒤에 줄바꿈("\A")을 단다. 하이드레이션 뒤 BalancedText 가 같은 함수(dom.ts)로 같은 줄을 고르고, 이 규칙을 지운 뒤 진짜 줄을
// 그려 화면이 움직이지 않는다. 빌드 때 이 파일을 인라인 스크립트 문자열로 묶는다(scripts/build-prehydrate.mjs).
//
// 칠하기 전에만 고른다. 이미 칠한 어절을 다른 줄로 옮기면 레이아웃 이동(CLS)으로 잡힌다 - 하이드레이션 때 React 가 줄을 새 노드로
// 바꾸는 건 잡히지 않는다. 그래서 스크립트 앞에 이미 읽힌 글을, 글꼴이 이미 있을 때(재방문 · preload)만 고르고 나머지(글꼴을
// 받는 중, 스크립트 뒤에 오는 스트리밍 글)는 하이드레이션에 맡긴다.
import {
	chooseDomBreaks,
	fontPending,
	ID_ATTR,
	PREHYDRATE_STYLE_ID,
	releasePrehydrate,
	rootSelector,
	WORD_CLASS,
} from "./dom";
import { createCanvasMeasurer, fontOf } from "./measure";

export const prehydrate = () => {
	const doc = document;
	let style = doc.getElementById(PREHYDRATE_STYLE_ID) as HTMLStyleElement | null;
	if (!style) {
		style = doc.createElement("style");
		style.id = PREHYDRATE_STYLE_ID;
		doc.head.appendChild(style);
	}
	const sheet = style.sheet;
	if (!sheet) return;

	const balance = (el: HTMLElement) => {
		const id = el.getAttribute(ID_ATTR);
		// 이미 하이드레이션돼 BalancedText 가 줄을 그렸다
		if (!id || el.querySelector(":scope > .text_balanced_line")) return;
		// 이 글꼴을 아직 받는 중 - 대체 글꼴 폭으로 고른 nowrap 줄은 글꼴이 오면 틀리거나 넘친다(받기는 이 확인이 시작시킨다)
		const pending = fontPending(el);
		if (pending) {
			// 받기가 실패해도(네트워크 · CSP) 하이드레이션 전 스크립트가 unhandledrejection 을 내지 않게
			pending.catch(() => {});
			return;
		}
		const { font, letterSpacing } = fontOf(el);
		const measure = createCanvasMeasurer(font, letterSpacing);
		const breaks = measure && chooseDomBreaks(el, measure);
		if (!breaks?.length) return;
		const root = rootSelector(id);
		const before = el.clientWidth;
		try {
			sheet.insertRule(`${root}{white-space:nowrap}`, sheet.cssRules.length);
			// 코드 안 <wbr> 은 nowrap 이어도 끊긴다
			sheet.insertRule(`${root} wbr{display:none}`, sheet.cssRules.length);
			for (const end of breaks)
				sheet.insertRule(
					`${root}>.${WORD_CLASS}:nth-child(${end + 1} of .${WORD_CLASS})::after{content:"\\A";white-space:pre}`,
					sheet.cssRules.length,
				);
		} catch {
			// `:nth-child(n of S)` 를 모르는 브라우저(Chrome 111 · Firefox 113 미만) - 브라우저 줄바꿈 그대로
			releasePrehydrate(el);
			return;
		}
		// 넘치거나(측정 어긋남) 상자가 넓어지면(폭이 내용으로 정해지는 상자) 되돌린다 - 하이드레이션 뒤 BalancedText 가 다룬다
		const right =
			el.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(el).paddingRight);
		const words = el.querySelectorAll(`:scope > .${WORD_CLASS}`);
		if (
			el.clientWidth > before + 0.5 ||
			[...words].some((w) => w.getBoundingClientRect().right > right + 0.5)
		)
			releasePrehydrate(el);
	};
	for (const el of doc.querySelectorAll<HTMLElement>(`[${ID_ATTR}]`)) balance(el);
	// 하이드레이션 전에 창 폭이 바뀌면 고른 줄이 틀린다 - 규칙을 걷어 브라우저 줄바꿈으로 둔다(하이드레이션 뒤 다시 고른다)
	addEventListener("resize", () => style?.remove(), { once: true });
};
