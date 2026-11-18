import * as React from "react";
import "./sentences.scss";

/**
 * 문장을 끝내는 어절 - 마침표 · 물음표 · 느낌표로 끝난다. 숫자 바로 뒤 마침표("2026. 5. 21.")만 날짜라
 * 넘기고, 숫자 뒤 물음표 · 느낌표("정답은 42!")는 문장 끝이다. 문장 부호 뒤 닫는 따옴표 · 괄호
 * (`"완료했어요."`, `(자동 저장돼요.)`)도 문장 끝이다. 정규식 lookbehind(`(?<=…)`)로 나누지 않는다 -
 * Safari 16.4 미만(카카오톡 등 인앱 웹뷰 포함)은 그 문법을 파싱하지 못해 이 모듈을 가져오는 번들 전체가 깨진다.
 */
const SENTENCE_END = /(?:[^\d]\.|[!?])["')\]”’」』]*$/;

/**
 * 어절 단위로 훑어 문장의 원문 범위(`start`·`end`)를 모은다. 글자는 원문에서 잘라 쓴다 - 어절 사이 공백을
 * 다시 이어 붙이면 `1\u00a0000원` 의 줄바꿈 금지 공백이 일반 공백으로 바뀐다. `start` 는 같은 문장이 반복돼도
 * key 가 겹치지 않는다.
 */
export const splitSentences = (text: string) => {
	const sentences: { text: string; start: number; end: number }[] = [];
	let start = -1;
	let end = 0;
	for (const match of text.matchAll(/\S+/g)) {
		const index = match.index ?? 0;
		if (start < 0) start = index;
		end = index + match[0].length;
		if (SENTENCE_END.test(match[0])) {
			sentences.push({ text: text.slice(start, end), start, end });
			start = -1;
		}
	}
	if (start >= 0) sentences.push({ text: text.slice(start, end), start, end });
	return sentences;
};

/**
 * 다음 어절과 떼지 않는 관형사 - "이 아래의", "모든 항목" 처럼 뒤 말을 꾸미기만 해서 혼자 줄 끝에 남으면 어색하다.
 * 체언으로도 쓰이는 낱말("이" 는 이빨 · 조사로도 읽힘)은 띄어 쓴 한 글자일 때만이라 관형사로 봐도 틀리지 않는다
 */
const DETERMINERS = new Set([
	"이",
	"그",
	"저",
	"한",
	"두",
	"세",
	"네",
	"각",
	"모든",
	"첫",
	"새",
	"몇",
	"온갖",
	"여러",
	"어느",
	"무슨",
	"이런",
	"그런",
	"저런",
]);
/** 한 덩어리 최대 어절 수 - 길게 묶을수록 좁은 폭에서 줄 끝 빈자리가 커진다 */
const MAX_PHRASE = 3;

/**
 * `의` 로 끝나지만 조사 `~의` 가 아닌 명사 - "회의 일정을" 은 꾸밈 관계가 아니라 묶을 까닭이 없다.
 * ponytail: 자주 쓰는 것만 적었다. 빠진 명사는 묶여도 줄 끝 빈자리가 조금 커질 뿐이라 화면에서 보이면 더한다
 */
const NOUNS_ENDING_IN_UI = new Set([
	"회의",
	"동의",
	"주의",
	"협의",
	"논의",
	"건의",
	"합의",
	"문의",
	"강의",
	"정의",
	"의의",
	"편의",
	"예의",
	"성의",
	"결의",
	"모의",
	"심의",
	"토의",
	"질의",
	"항의",
]);

/** 다음 어절과 붙여 둘 어절인가 - `~의` 로 끝나는 꾸밈말 · 관형사. 쉼표 · 문장 부호로 끝나면 떼도 된다 */
const bindsNext = (word: string) =>
	(/[가-힣]의$/.test(word) && !NOUNS_ENDING_IN_UI.has(word)) || DETERMINERS.has(word);

/**
 * @description
 * 꾸미는 말과 꾸밈받는 말("이 아래의 컴포넌트에서", "고객의 신뢰를") 사이에서 줄이 갈리지 않게 그 어절들을
 * `nowrap` span 하나로 묶는다 (#1077). `keep-all` 은 어절 중간만 막고 어느 어절 사이가 어색한지는 모른다.
 * 묶음은 최대 3어절이고, 묶이지 않는 글자 · 공백은 원문 그대로 둔다 - 보이지 않는 문자를 넣지 않아 복사한 글이 같다.
 */
export const renderPhrases = (text: string): React.ReactNode => {
	const words = [...text.matchAll(/\S+/g)].map((m) => ({
		word: m[0],
		start: m.index ?? 0,
		end: (m.index ?? 0) + m[0].length,
	}));
	const out: React.ReactNode[] = [];
	let cursor = 0;
	for (let i = 0; i < words.length; ) {
		let j = i;
		while (j < words.length - 1 && j - i + 1 < MAX_PHRASE && bindsNext(words[j]?.word ?? "")) j++;
		const first = words[i];
		const last = words[j];
		if (j > i && first && last) {
			out.push(text.slice(cursor, first.start));
			out.push(
				<span key={first.start} className="sentences_phrase">
					{text.slice(first.start, last.end)}
				</span>,
			);
			cursor = last.end;
		}
		i = j + 1;
	}
	if (cursor === 0) return text;
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
