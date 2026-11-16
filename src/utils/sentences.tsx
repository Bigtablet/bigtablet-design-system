import * as React from "react";
import "./sentences.scss";

/**
 * 문장을 끝내는 어절 - 마침표 · 물음표 · 느낌표로 끝나고 그 앞 글자가 숫자가 아니다. 숫자 바로 뒤 마침표
 * ("2026. 5. 21.")는 날짜라 넘긴다. 문장 부호 뒤 닫는 따옴표 · 괄호(`"완료했어요."`, `(자동 저장돼요.)`)도
 * 문장 끝이다. 정규식 lookbehind(`(?<=…)`)로 나누지 않는다 - Safari 16.4 미만
 * (카카오톡 등 인앱 웹뷰 포함)은 그 문법을 파싱하지 못해 이 모듈을 가져오는 번들 전체가 깨진다.
 */
const SENTENCE_END = /[^\d][.!?]["')\]”’」』]*$/;

/** 어절 단위로 훑어 문장으로 모은다. `start` 는 원문에서 문장이 시작하는 위치라 같은 문장이 반복돼도 key 가 겹치지 않는다. */
export const splitSentences = (text: string) => {
	const sentences: { text: string; start: number }[] = [];
	let words: string[] = [];
	let start = 0;
	for (const match of text.matchAll(/\S+/g)) {
		if (words.length === 0) start = match.index ?? 0;
		words.push(match[0]);
		if (SENTENCE_END.test(match[0])) {
			sentences.push({ text: words.join(" "), start });
			words = [];
		}
	}
	if (words.length > 0) sentences.push({ text: words.join(" "), start });
	return sentences;
};

/**
 * @description
 * 두 문장 이상인 문구를 문장마다 인라인 블록으로 묶어 줄이 문장 사이에서 먼저 끊기게 한다 (#1005).
 * `keep-all` 은 어절 사이 어디서든 끊어 다음 문장의 첫 어절이 앞 줄에 남는다 - 문장 경계는 글자만으로
 * 알 수 없어 `text-wrap` 으로도 못 막는다. 문장 사이 공백은 텍스트로 남겨 접근성 이름 · 낭독이 그대로다.
 * 한 문장짜리와 문자열이 아닌 값은 그대로 돌려준다 - 마크업이 바뀌지 않는다.
 */
export const renderSentences = (content: React.ReactNode): React.ReactNode => {
	if (typeof content !== "string") return content;
	const sentences = splitSentences(content);
	if (sentences.length < 2) return content;
	return sentences.map((sentence, index) => (
		<React.Fragment key={sentence.start}>
			{index > 0 && " "}
			<span className="sentences_item">{sentence.text}</span>
		</React.Fragment>
	));
};
