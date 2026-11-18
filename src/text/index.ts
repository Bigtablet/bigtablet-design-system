// `@bigtablet/design-system/text` - 문장 · 어절 줄바꿈 규칙 (#1079).
// DS 컴포넌트(Toast · Alert · supportingText …)가 쓰는 것과 같은 규칙이라 앱 화면과 줄바꿈이 갈리지 않는다.
export { phraseRanges, splitSentences } from "./core";
export {
	renderPhrases,
	renderSentences,
	Sentences,
	type SentencesProps,
	sentenceText,
} from "./react";
