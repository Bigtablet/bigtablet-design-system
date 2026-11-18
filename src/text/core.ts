// 줄바꿈 규칙 - React 없이 쓰는 순수 함수 (#1079). 화면에 붙이는 래퍼는 ./react.tsx 가 맡는다.
// 앱이 서버 · 다른 렌더러에서 같은 규칙으로 문장 · 어절 범위를 얻을 때도 이 파일만 쓴다.

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
 * 붙여 둘 어절 묶음의 원문 범위 - 2어절 이상인 묶음만 돌려준다 (#1077).
 * `~의` 꾸밈말 · 관형사를 다음 어절과 잇고, 이어지면 합치되 최대 3어절까지.
 */
export const phraseRanges = (text: string): { start: number; end: number }[] => {
	const words = [...text.matchAll(/\S+/g)].map((m) => ({
		word: m[0],
		start: m.index ?? 0,
		end: (m.index ?? 0) + m[0].length,
	}));
	const ranges: { start: number; end: number }[] = [];
	for (let i = 0; i < words.length; ) {
		let j = i;
		while (j < words.length - 1 && j - i + 1 < MAX_PHRASE && bindsNext(words[j]?.word ?? "")) j++;
		const first = words[i];
		const last = words[j];
		if (j > i && first && last) ranges.push({ start: first.start, end: last.end });
		i = j + 1;
	}
	return ranges;
};
