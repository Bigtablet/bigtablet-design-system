const SYLLABLE_FIRST = 0xac00;
const SYLLABLE_LAST = 0xd7a3;
/** 초성 19자 (호환 자모). 음절 인덱스 / 588 */
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
/** 종성 28자 - 공백은 받침 없음(0)과 겹받침. 겹받침은 다음 글자 초성으로 넘길 수 없다 */
const JONG = " ㄱㄲ ㄴ  ㄷㄹ       ㅁㅂ ㅅㅆㅇㅈㅊㅋㅌㅍㅎ";

const syllableIndex = (ch: string) => {
	const code = ch.charCodeAt(0);
	return code >= SYLLABLE_FIRST && code <= SYLLABLE_LAST ? code - SYLLABLE_FIRST : -1;
};

/** 검색 매칭용 정규화 - 대소문자·공백 무시 */
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/**
 * 질의 한 글자가 라벨 한 글자에 맞는지.
 * - 초성만 친 글자(`ㄱ`)는 그 초성으로 시작하는 음절에 맞는다
 * - 마지막 글자는 아직 조합 중일 수 있다 - 받침 없는 `우` 는 `울` · `운` 에 맞는다
 */
const charMatches = (q: string, l: string, isLast: boolean) => {
	if (q === l) return true;
	const li = syllableIndex(l);
	if (li < 0) return false;
	const cho = CHO.indexOf(q);
	if (cho >= 0) return Math.floor(li / 588) === cho;
	const qi = syllableIndex(q);
	return isLast && qi >= 0 && qi % 28 === 0 && li - (li % 28) === qi;
};

const matchesAt = (label: string, query: string) => {
	for (let start = 0; start + query.length <= label.length; start++) {
		let ok = true;
		for (let i = 0; i < query.length && ok; i++) {
			ok = charMatches(query.charAt(i), label.charAt(start + i), i === query.length - 1);
		}
		if (ok) return true;
	}
	return false;
};

/**
 * 라벨이 검색어를 포함하는지 - 한글 입력 중간 상태를 받아준다.
 *
 * IME 조합이 끝나기를 기다리지 않고 매 입력마다 부르기 위한 것이다. 조합 중인 마지막 글자는
 * 받침이 다음 음절의 초성일 수 있다 - `서울` 을 치다 보면 `성` 이 먼저 나온다. 그래서 마지막
 * 글자에 받침이 있으면 `서` + `ㅇ` 으로 나눈 질의도 시도한다.
 *
 * @example
 * matchesSearch("서울특별시", "ㅅㅇ")  // true - 초성
 * matchesSearch("서울특별시", "서우")  // true - 받침 전
 * matchesSearch("서울특별시", "성")    // true - 받침이 다음 초성
 */
export function matchesSearch(label: string, query: string): boolean {
	const l = normalize(label);
	const q = normalize(query);
	if (q === "") return true;
	if (matchesAt(l, q)) return true;

	const last = syllableIndex(q.charAt(q.length - 1));
	const jong = last >= 0 ? JONG.charAt(last % 28).trim() : "";
	if (!jong) return false;
	const withoutJong = String.fromCharCode(SYLLABLE_FIRST + last - (last % 28));
	return matchesAt(l, q.slice(0, -1) + withoutJong + jong);
}
