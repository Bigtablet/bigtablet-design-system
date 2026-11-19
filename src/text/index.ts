// `@bigtablet/design-system/text` - 문장 · 어절 줄바꿈 규칙 (#1079).
// DS 컴포넌트(Toast · Alert · supportingText …)가 쓰는 것과 같은 규칙이라 앱 화면과 줄바꿈이 갈리지 않는다.

export {
	BalancedText,
	type BalancedTextProps,
	BalancedTextScript,
	type BalancedTextScriptProps,
} from "./balanced";
export { phraseRanges, splitSentences } from "./core";
// 엔진은 결과를 내는 함수만 낸다 - 벌점 값 · 내부 단계(어절 나누기 · DP · 점수)는 튜닝 대상이라 공개하면 바꾸는 게 곧 breaking 이다
export { type BreakChoice, type Breaks, chooseBreaks, type MeasureText } from "./layout";
export { type CanvasMeasurer, createCanvasMeasurer } from "./measure";
// React 없이 서버 HTML 에 직접 넣을 때(Next `<Script>` · 템플릿 엔진) - BalancedTextScript 가 넣는 것과 같은 문자열
export { balancedTextScript } from "./prehydrate-script";
export {
	renderPhrases,
	renderSentences,
	Sentences,
	type SentencesProps,
	sentenceText,
} from "./react";
