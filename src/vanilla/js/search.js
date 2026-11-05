/** 검색 매칭용 정규화 - 대소문자·공백 무시 */
export function normalizeForSearch(str) {
	return String(str).toLowerCase().replace(/\s+/g, "");
}

// 한글 검색 - React `src/utils/hangul-search.ts` 의 `matchesSearch` 를 그대로 옮겼다. 고칠 때 둘을 같이 고친다.
// 초성(`ㅅㅇ` → 서울)과 조합 중인 마지막 글자(`서우`·`성` → 서울)를 받아 IME 조합을 기다리지 않고 거른다.
export const HANGUL_FIRST = 0xac00;
export const HANGUL_LAST = 0xd7a3;
export const HANGUL_CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
export const HANGUL_JONG = " ㄱㄲ ㄴ  ㄷㄹ       ㅁㅂ ㅅㅆㅇㅈㅊㅋㅌㅍㅎ";

export function syllableIndex(ch) {
	const code = ch.charCodeAt(0);
	return code >= HANGUL_FIRST && code <= HANGUL_LAST ? code - HANGUL_FIRST : -1;
}

export function hangulCharMatches(q, l, isLast) {
	if (q === l) return true;
	const li = syllableIndex(l);
	if (li < 0) return false;
	const cho = HANGUL_CHO.indexOf(q);
	if (cho >= 0) return Math.floor(li / 588) === cho;
	const qi = syllableIndex(q);
	return isLast && qi >= 0 && qi % 28 === 0 && li - (li % 28) === qi;
}

export function hangulMatchesAt(label, query) {
	for (let start = 0; start + query.length <= label.length; start++) {
		let ok = true;
		for (let i = 0; i < query.length && ok; i++) {
			ok = hangulCharMatches(query.charAt(i), label.charAt(start + i), i === query.length - 1);
		}
		if (ok) return true;
	}
	return false;
}

export function matchesSearch(label, query) {
	const l = normalizeForSearch(label);
	const q = normalizeForSearch(query);
	if (q === "") return true;
	if (hangulMatchesAt(l, q)) return true;
	const last = syllableIndex(q.charAt(q.length - 1));
	const jong = last >= 0 ? HANGUL_JONG.charAt(last % 28).trim() : "";
	if (!jong) return false;
	const withoutJong = String.fromCharCode(HANGUL_FIRST + last - (last % 28));
	return hangulMatchesAt(l, q.slice(0, -1) + withoutJong + jong);
}
