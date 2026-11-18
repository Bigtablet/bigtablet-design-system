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
 * 앞 어절에 붙여 둘 말 - 혼자서는 뜻이 서지 않아 다음 줄 맨 앞에 혼자 남으면 어색하다 (#1081).
 * "body 입니다" 처럼 영문 · 코드 뒤에 띄어 쓴 서술어, "할 수", "본 것" 의 의존명사(뒤에 붙은 조사 · 서술어 · 문장 부호까지).
 * 의존명사 뒤는 조사 목록으로만 받는다 - 글자 수로 받으면 "수정한" · "때문에" 같은 다른 낱말까지 걸린다
 */
const ATTACHES_PREV =
	/^(?:입니다|입니까|이다|이에요|예요|이죠|이고|이며|이면|(?:수|것|때|줄|뿐|듯|만큼|중)(?:가|도|는|은|을|를|이|에|에서|에는|만|이다|입니다|이에요|예요|이죠)?)[.,!?"')\]”’]*$/;

/** 앞 어절과 붙여 둘 어절인가 */
const bindsPrev = (word: string) => ATTACHES_PREV.test(word);

/**
 * 붙여 둘 어절 묶음의 원문 범위 - 2어절 이상인 묶음만 돌려준다 (#1077).
 * `~의` 꾸밈말 · 관형사를 다음 어절과, 서술어 · 의존명사를 앞 어절과 잇고, 이어지면 합치되 최대 3어절까지.
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
		while (
			j < words.length - 1 &&
			j - i + 1 < MAX_PHRASE &&
			(bindsNext(words[j]?.word ?? "") || bindsPrev(words[j + 1]?.word ?? ""))
		)
			j++;
		const first = words[i];
		const last = words[j];
		if (j > i && first && last) ranges.push({ start: first.start, end: last.end });
		i = j + 1;
	}
	return ranges;
};

/**
 * 두 어절 사이에서 줄을 바꾸면 얼마나 어색한가 - 줄바꿈 엔진(`layout.ts`)의 벌점 (#1083).
 * 문장 끝 0 · 쉼표 · 쌍점 뒤 1 · 보통 4 · 붙여 둘 자리(`phraseRanges` 와 같은 규칙) 100
 */
export const gapPenalty = (before: string, after: string): number => {
	if (SENTENCE_END.test(before)) return 0;
	if (bindsNext(before) || bindsPrev(after)) return 100;
	if (/[,:;·]["')\]”’]*$/.test(before) || after === "·") return 1;
	return 4;
};
