import * as React from "react";
import { phraseRanges, splitSentences } from "./core";
import "./text.scss";

/**
 * @description
 * 꾸미는 말과 꾸밈받는 말("이 아래의 컴포넌트에서", "고객의 신뢰를") 사이에서 줄이 갈리지 않게 그 어절들을
 * span 하나(`inline-block`)로 묶는다 (#1077). `keep-all` 은 어절 중간만 막고 어느 어절 사이가 어색한지는 모른다.
 * 묶음은 최대 3어절이고, 묶이지 않는 글자 · 공백은 원문 그대로 둔다 - 보이지 않는 문자를 넣지 않아 복사한 글이 같다.
 */
export const renderPhrases = (text: string): React.ReactNode => {
	const ranges = phraseRanges(text);
	if (ranges.length === 0) return text;
	const out: React.ReactNode[] = [];
	let cursor = 0;
	for (const { start, end } of ranges) {
		out.push(text.slice(cursor, start));
		out.push(
			<span key={start} className="sentences_phrase">
				{text.slice(start, end)}
			</span>,
		);
		cursor = end;
	}
	out.push(text.slice(cursor));
	return out;
};

/**
 * @description
 * 두 문장 이상인 문구를 문장마다 인라인 블록으로 묶어 줄이 문장 사이에서 먼저 끊기게 한다 (#1005).
 * `keep-all` 은 어절 사이 어디서든 끊어 다음 문장의 첫 어절이 앞 줄에 남는다 - 문장 경계는 글자만으로
 * 알 수 없어 `text-wrap` 으로도 못 막는다. 문장 사이 공백은 원문 그대로 텍스트로 남겨 접근성 이름 · 낭독이 같다.
 * 한 문장짜리와 문자열이 아닌 값은 그대로 돌려준다 - 마크업이 바뀌지 않는다.
 */
export const renderSentences = (content: React.ReactNode): React.ReactNode => {
	if (typeof content !== "string") return content;
	const sentences = splitSentences(content);
	if (sentences.length < 2) return content;
	const last = sentences[sentences.length - 1]?.end ?? content.length;
	return [
		...sentences.map((sentence, index) => (
			<React.Fragment key={sentence.start}>
				{content.slice(index > 0 ? (sentences[index - 1]?.end ?? 0) : 0, sentence.start)}
				<span className="sentences_item">{renderPhrases(sentence.text)}</span>
			</React.Fragment>
		)),
		content.slice(last),
	];
};

export interface SentencesProps {
	/** 나눌 문구. 한 문장이면 그대로 렌더된다. */
	text: string;
}

/**
 * @description
 * 앱이 직접 그리는 문단에 Toast · Alert · `supportingText` 와 같은 문장 단위 줄바꿈을 건다 (#1012).
 * 분할 규칙은 `renderSentences` 하나다 - 앱과 DS 가 따로 두면 한쪽만 고쳐 화면마다 줄바꿈이 갈린다.
 * 띄어쓰기 없는 언어(ja · zh)는 어절이 하나라 나누지 않고 원문 그대로 둔다.
 */
export const Sentences = ({ text }: SentencesProps) => renderSentences(text);

/**
 * @description
 * `Sentences` 가 문장마다 span 으로 나눈 문구를 원문 그대로 찾는 `getByText` 매처. 기본 매처는 텍스트 노드
 * 하나만 보므로 나뉜 문구를 못 찾는다 - 전체 글자가 원문과 같은 가장 안쪽 요소를 고른다.
 *
 * @example
 * screen.getByText(sentenceText("저장했어요. 계속할까요?"));
 */
export const sentenceText =
	(text: string) =>
	(_content: string, element: Element | null): boolean =>
		element?.textContent === text &&
		![...element.children].some((child) => child.textContent === text);
