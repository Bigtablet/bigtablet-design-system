// `@bigtablet/design-system/text` - 문장 · 어절 줄바꿈 규칙 (#1079).
// DS 컴포넌트(Toast · Alert · supportingText …)가 쓰는 것과 같은 규칙이라 앱 화면과 줄바꿈이 갈리지 않는다.

export { BalancedText, type BalancedTextProps } from "./balanced";
export { gapPenalty, phraseRanges, splitSentences } from "./core";
export {
	type BreakChoice,
	type Breaks,
	chooseBreaks,
	chooseWordBreaks,
	type LayoutScore,
	layoutBest,
	layoutNative,
	type MeasureText,
	scoreBreaks,
	toWords,
	type Word,
} from "./layout";
export { type CanvasMeasurer, createCanvasMeasurer, fontOf } from "./measure";
export {
	renderPhrases,
	renderSentences,
	Sentences,
	type SentencesProps,
	sentenceText,
} from "./react";
