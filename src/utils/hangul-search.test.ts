import { describe, expect, it } from "vitest";
import { matchesSearch } from "./hangul-search";

describe("matchesSearch", () => {
	it("matches plain substrings, ignoring case and spaces", () => {
		expect(matchesSearch("Blue Berry", "berry")).toBe(true);
		expect(matchesSearch("서울 특별시", "울특")).toBe(true);
		expect(matchesSearch("Apple", "pear")).toBe(false);
		expect(matchesSearch("Apple", "")).toBe(true);
	});

	it("matches initial consonants (초성)", () => {
		expect(matchesSearch("서울특별시", "ㅅㅇ")).toBe(true);
		expect(matchesSearch("서울특별시", "ㅌㅂ")).toBe(true);
		expect(matchesSearch("부산광역시", "ㅅㅇ")).toBe(false);
		// 초성과 완성 글자를 섞어 친 경우
		expect(matchesSearch("서울특별시", "서ㅇ")).toBe(true);
	});

	it("matches a last syllable still being composed without its final consonant", () => {
		expect(matchesSearch("서울특별시", "서우")).toBe(true);
		// 마지막 글자만 받침 없이 받아준다 - 중간 글자는 정확해야 한다
		expect(matchesSearch("서울특별시", "서우특")).toBe(false);
	});

	it("matches a final consonant that is really the next syllable's initial", () => {
		// 서울 을 치는 도중의 `성`
		expect(matchesSearch("서울특별시", "성")).toBe(true);
		// `특별` 을 치는 도중 - `특` 뒤 `ㅂ` 은 초성, 이어서 `벼`
		expect(matchesSearch("서울특별시", "서울특ㅂ")).toBe(true);
		expect(matchesSearch("서울특별시", "서울특벼")).toBe(true);
		expect(matchesSearch("서해", "성")).toBe(false);
	});
});
