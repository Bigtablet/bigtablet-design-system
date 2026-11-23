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
 * 마침표가 글자마다 붙는 영문 약어("e.g." · "i.e." · "U.S.") - 문장 끝이 아니다 (#1113). 뒤에 붙는 닫는 따옴표 · 괄호는
 * `SENTENCE_END` 와 같은 글자를 받는다("(e.g.)" · "e.g.”").
 * 알려진 한계: 약어로 끝나는 문장("…in the U.S.")은 문장 끝으로 보지 않는다 - 글자만으로는 약어 뒤 마침표와 문장 끝
 * 마침표가 갈리지 않고, 문장이 이어 붙는 쪽(줄이 문장 안에서 끊김)이 문장이 잘리는 쪽보다 덜 어색하다.
 * 숫자 뒤 마침표("버전 4.10.1.")도 그대로 넘긴다 - "2026.05.21." 처럼 붙여 쓴 날짜와 글자만으로 갈리지 않는다
 */
const ABBREVIATION = /(?:^|[^A-Za-z])(?:[A-Za-z]\.){2,}["')\]”’」』]*$/;

/**
 * 줄을 바꿀 수 있는 공백 - JS `\s` 에서 줄바꿈 금지 공백(U+00A0 · U+2007 · U+202F)을 뺐다. `\s` 로 어절을 나누면
 * "한 번&nbsp;더" 의 "번" · "더" 가 다른 어절이 돼, 묶음 · 줄바꿈 엔진이 nbsp 자리에서 줄을 바꾼다 (#1137)
 */
export const BREAK_SPACE = /[^\S\u00a0\u2007\u202f]+/;
/** 어절 - 줄을 바꿀 수 있는 공백 사이의 글자. nbsp 로 붙인 말은 한 어절이다 */
export const WORD = /(?:\S|[\u00a0\u2007\u202f])+/g;

/** 문장을 끝내는 어절인가 */
export const endsSentence = (word: string) => SENTENCE_END.test(word) && !ABBREVIATION.test(word);

/**
 * 어절 단위로 훑어 문장의 원문 범위(`start`·`end`)를 모은다. 글자는 원문에서 잘라 쓴다 - 어절 사이 공백을
 * 다시 이어 붙이면 `1\u00a0000원` 의 줄바꿈 금지 공백이 일반 공백으로 바뀐다. `start` 는 같은 문장이 반복돼도
 * key 가 겹치지 않는다.
 */
export const splitSentences = (text: string) => {
	const sentences: { text: string; start: number; end: number }[] = [];
	let start = -1;
	let end = 0;
	for (const match of text.matchAll(WORD)) {
		const index = match.index ?? 0;
		if (start < 0) start = index;
		end = index + match[0].length;
		if (endsSentence(match[0])) {
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

/**
 * 다음 어절과 붙여 둘 어절인가 - `~의` 로 끝나는 꾸밈말 · 관형사. 쉼표 · 문장 부호로 끝나면 떼도 된다.
 * "민주주의" · "자본주의" 처럼 `~주의` 로 끝나는 명사는 목록 대신 끝 모양으로 넘긴다
 */
const bindsNext = (word: string) =>
	(/[가-힣]의$/.test(word) && !NOUNS_ENDING_IN_UI.has(word) && !/[가-힣]주의$/.test(word)) ||
	DETERMINERS.has(word);

/**
 * 앞 어절에 붙여 둘 말 - 혼자서는 뜻이 서지 않아 다음 줄 맨 앞에 혼자 남으면 어색하다 (#1081).
 * "body 입니다" 처럼 영문 · 코드 뒤에 띄어 쓴 서술어, "할 수", "본 것" 의 의존명사(뒤에 붙은 조사 · 서술어 · 문장 부호까지).
 * 의존명사 뒤는 조사 목록으로만 받는다 - 글자 수로 받으면 "수정한" · "때문에" 같은 다른 낱말까지 걸린다
 */
const ATTACHES_PREV =
	/^(?:입니다|입니까|이다|이에요|예요|이죠|이고|이며|이면|(?:수|것|때|줄|뿐|듯|만큼|중)(?:가|도|는|은|을|를|이|에|에서|에는|만|이다|입니다|이에요|예요|이죠)?)[.,!?"')\]”’]*$/;

/** 앞 어절과 붙여 둘 어절인가 */
const bindsPrev = (word: string) => ATTACHES_PREV.test(word);

/** 영문 · 숫자 · 닫는 따옴표 · 괄호 뒤에 띄어 쓴 조사("prop 을", `"복사" 로`, "(…) 는") - 다음 줄 맨 앞에 혼자 남으면 안 된다 */
const SPACED_PARTICLE =
	/^(?:이|가|은|는|을|를|의|와|과|도|만|로|으로|에|에서|에게|부터|까지|처럼|보다|마다|만큼|이나|나|라고|이라고|하고)(?:는|도|만|의)?[.,!?]*$/;

/**
 * 두 어절 사이를 붙여 둘 자리인가 - `phraseRanges` 의 묶음과 `gapPenalty` 의 100점이 같은 규칙을 쓴다 (#1138).
 * 백틱 - 마크다운 원문을 그대로 넘긴 글("`totalPages` 로")도 코드 뒤 조사를 떼지 않게 (#1133)
 */
const bindsAcross = (before: string, after: string) =>
	bindsNext(before) ||
	bindsPrev(after) ||
	(/[A-Za-z0-9"')\]”’>`]$/.test(before) && SPACED_PARTICLE.test(after));

/**
 * 붙여 둘 어절 묶음의 원문 범위 - 2어절 이상인 묶음만 돌려준다 (#1077).
 * `~의` 꾸밈말 · 관형사를 다음 어절과, 서술어 · 의존명사 · 영문 뒤 띄어 쓴 조사를 앞 어절과 잇고, 이어지면 합치되 최대 3어절까지.
 */
export const phraseRanges = (text: string): { start: number; end: number }[] => {
	const words = [...text.matchAll(WORD)].map((m) => ({
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
			bindsAcross(words[j]?.word ?? "", words[j + 1]?.word ?? "")
		)
			j++;
		const first = words[i];
		const last = words[j];
		if (j > i && first && last) ranges.push({ start: first.start, end: last.end });
		i = j + 1;
	}
	return ranges;
};

/** 받침 있는 글자인가 - 한글 음절은 28 개 받침 단위로 늘어선다 */
const hasFinal = (ch: string) => (ch.charCodeAt(0) - 0xac00) % 28 !== 0;

/**
 * 뒤 명사를 꾸미는 용언인가 - "붙이는 순서", "읽는 문서", "같은 모양". 주제 조사 `는` · `은`("카드는" · "버튼은")과
 * 글자만으로는 갈리지 않는다. `는` 은 받침 뒤("읽는" - 명사 뒤라면 `은`)거나 흔한 줄기 끝 글자 뒤, `은` 은 흔한 형용사 줄기 뒤만 본다.
 * ponytail: 형태소 분석 없이 끝 두 글자만 본다. 틀려도("카드는") 벌점이 보통보다 2 높을 뿐이라, 화면에서 어색하면 글자를 더한다
 */
const isModifier = (word: string) => {
	if (!/^[가-힣]{2,}$/.test(word)) return false;
	const last = word.at(-1) ?? "";
	const stem = word.at(-2) ?? "";
	if (last === "는")
		return hasFinal(stem) || /[하되이리오가주보지치키우두쓰뜨나내대르드]/.test(stem);
	if (last === "은") return /[같작높낮좋많넓좁짧얇붙묶받읽남닫찾놓넣않깊밝]/.test(stem);
	return /[운된던]/.test(last);
};

/**
 * 조사 · 어미 없이 끝난 낱말 - 복합명사의 앞 조각("디자인 시스템", "서버 템플릿", "Esc 닫기")이거나 부사("다시")다.
 * 끝 글자가 조사 · 어미로 흔히 쓰이는 글자면 넘긴다 - 그 글자로 끝나는 명사("사이" · "화면")는 놓친다
 */
const BARE_END = /[이가은는을를에의와과도만로서고며면게지요다나든야라니죠께해여어아듯]$/;
const isBare = (word: string) =>
	(/^[가-힣]+$/.test(word) && !BARE_END.test(word)) || /^[A-Za-z0-9][\w.+#-]*$/.test(word);

/** 뒤 어절과 한 덩어리로 읽히는가 - 꾸미는 말 + 명사, 복합명사. 떼도 뜻은 서서 붙여 둘 자리(100)보다 약하다 */
const leansNext = (before: string, after: string) => {
	if (!/^[가-힣\d]/.test(after)) return false;
	return isBare(before) || isModifier(before);
};

/**
 * 두 어절 사이에서 줄을 바꾸면 얼마나 어색한가 - 줄바꿈 엔진(`layout.ts`)의 벌점 (#1083).
 * 문장 끝 0 · 쉼표 · 쌍점 뒤 1 · 보통 4 · 꾸미는 말 · 복합명사 사이 6 · 나열(`·`) 사이 8 ·
 * 문장 마지막 어절만 넘기는 자리 12 · 붙여 둘 자리(`phraseRanges` 와 같은 규칙)와 `·` 로 시작하는 줄 100.
 * `A · B` 는 쉼표와 달리 한 덩어리 이름으로 읽힌다("React 19 · Next.js") - 끊으면 쉼표보다 어색하다
 */
export const gapPenalty = (before: string, after: string): number => {
	if (endsSentence(before)) return 0;
	if (bindsAcross(before, after) || after === "·") return 100;
	if (/[,:;]["')\]”’]*$/.test(before)) return 1;
	// 문장의 마지막 어절(서술어)만 다음 줄로 - "패키지에 / 싣습니다. 다음 문장…" 은 문장이 끝난 듯 읽히다 한 어절이 떨어진다
	if (endsSentence(after)) return 12;
	if (/·$/.test(before)) return 8;
	if (leansNext(before, after)) return 6;
	return 4;
};
