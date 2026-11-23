import { describe, expect, it } from "vitest";
import { gapPenalty, phraseRanges } from "./core";
import {
	chooseBreaks,
	layoutBest,
	layoutNative,
	type MeasureText,
	scoreBreaks,
	toWords,
} from "./layout";

// 글자 하나 10px, 공백 10px - 줄 폭을 손으로 셀 수 있게
const measure: MeasureText = (text) => [...text].length * 10;
const lines = (text: string, breaks: number[]) => {
	const words = toWords(text);
	const out: string[] = [];
	let from = 0;
	for (const end of [...breaks, words.length - 1]) {
		out.push(
			words
				.slice(from, end + 1)
				.map((w) => w.text)
				.join(" "),
		);
		from = end + 1;
	}
	return out;
};

describe("gapPenalty", () => {
	it("is free after a sentence, cheap after a comma, and costly inside a phrase", () => {
		expect(gapPenalty("싣습니다.", "사이트와")).toBe(0);
		expect(gapPenalty("heading,", "본문이면")).toBe(1);
		expect(gapPenalty("본문이면", "body")).toBe(4);
		expect(gapPenalty("아래의", "컴포넌트에서")).toBe(100);
		expect(gapPenalty("body", "입니다.")).toBe(100);
		expect(gapPenalty("`pagination.totalPages`", "로")).toBe(100);
	});

	it("leans a modifier and a compound noun toward the next word", () => {
		expect(gapPenalty("붙이는", "순서를")).toBe(6);
		expect(gapPenalty("읽는", "문서가")).toBe(6);
		expect(gapPenalty("같은", "모양으로")).toBe(6);
		expect(gapPenalty("서버", "템플릿에서")).toBe(6);
		expect(gapPenalty("디자인", "시스템의")).toBe(6);
		// 주제 조사 · 목적격 조사 뒤는 보통
		expect(gapPenalty("버튼은", "누르면")).toBe(4);
		expect(gapPenalty("토큰을", "쓰고")).toBe(4);
		expect(gapPenalty("Esc", "닫기")).toBe(6);
		expect(gapPenalty("prop", "을")).toBe(100);
		expect(gapPenalty("query.data", "에는")).toBe(100);
		expect(gapPenalty('선택"', "으로")).toBe(100);
	});

	it("does not bind ~주의 nouns as ~의 modifiers", () => {
		expect(gapPenalty("자본주의", "사회")).toBe(4);
		// "주의" 혼자(명사)는 목록에서 걸러지고, "~주의" 규칙은 앞 글자가 있어야 걸린다
		expect(gapPenalty("주의", "사항")).toBe(4);
		expect(phraseRanges("이 주의 사항을 읽고 민주주의 사회를 봅니다")).toEqual([
			{ start: 0, end: 4 },
		]);
	});

	it("keeps the last word of a sentence with the sentence", () => {
		expect(gapPenalty("패키지에", "싣습니다.")).toBe(12);
		expect(gapPenalty("순서로", "짓습니다.")).toBe(12);
	});

	it("keeps a · list together and never starts a line with ·", () => {
		expect(gapPenalty("·", "Next.js")).toBe(8);
		expect(gapPenalty("19", "·")).toBe(100);
	});
});

describe("layoutNative", () => {
	it("fills words until the next one overflows, like keep-all", () => {
		// "가나 다라 마바" = 20 + 10 + 20 + 10 + 20 = 80px
		const text = "가나 다라 마바";
		expect(lines(text, layoutNative(toWords(text), measure, 80))).toEqual(["가나 다라 마바"]);
		expect(lines(text, layoutNative(toWords(text), measure, 50))).toEqual(["가나 다라", "마바"]);
	});

	it("puts a word longer than the line on its own line", () => {
		const text = "가 나다라마바사 아";
		expect(lines(text, layoutNative(toWords(text), measure, 40))).toEqual([
			"가",
			"나다라마바사",
			"아",
		]);
	});
});

describe("layoutBest", () => {
	// "가나다라 이 아래의" = 100px, "이 아래의 컴포넌트에서" = 120px
	it("moves the break off a phrase it would split", () => {
		// 폭 120: 브라우저는 "가나다라 이 아래의" / "컴포넌트에서" - 꾸밈 관계 사이에서 끊긴다.
		// "가나다라" / "이 아래의 컴포넌트에서" 도 두 줄에 들어가므로 그쪽이 낫다
		const text = "가나다라 이 아래의 컴포넌트에서";
		const words = toWords(text);
		expect(lines(text, layoutNative(words, measure, 120))).toEqual([
			"가나다라 이 아래의",
			"컴포넌트에서",
		]);
		expect(lines(text, layoutBest(words, measure, 120, 2) ?? [])).toEqual([
			"가나다라",
			"이 아래의 컴포넌트에서",
		]);
	});

	it("keeps an unavoidable split when no same-line-count layout avoids it", () => {
		// 폭 110 에서는 "이 아래의 컴포넌트에서" 가 한 줄에 안 들어가 피할 수 없다
		const text = "가나다라 이 아래의 컴포넌트에서";
		const words = toWords(text);
		expect(lines(text, layoutBest(words, measure, 110, 2) ?? [])).toEqual([
			"가나다라 이 아래의",
			"컴포넌트에서",
		]);
	});

	it("returns null when no layout with that many lines fits", () => {
		expect(layoutBest(toWords("가나다라 마바사아"), measure, 50, 1)).toBeNull();
	});

	it("never makes a line wider than the width", () => {
		const text =
			"모든 항목이 이 아래의 컴포넌트에서 보이고 사용자는 그 목록의 순서를 바꿀 수 있습니다";
		const words = toWords(text);
		const native = layoutNative(words, measure, 150);
		const best = layoutBest(words, measure, 150, native.length + 1) ?? [];
		for (const line of lines(text, best)) expect(measure(line)).toBeLessThanOrEqual(150);
	});
});

describe("scoreBreaks", () => {
	it("charges a break inside parentheses above a no-space gap", () => {
		const text = "글 마크업(h · p · ul · a …)에 타이포 규칙을 입힙니다.";
		const words = toWords(text);
		const at = (w: string) => words.findIndex((word) => word.text === w);
		expect(scoreBreaks(words, measure, 1000, [at("·")]).penalty).toBe(60);
		expect(scoreBreaks(words, measure, 1000, [at("에")]).penalty).toBe(4);
	});

	it("never leaves only the first word of the next sentence at the end of a line", () => {
		// "실행은 지금부터. AI가 / 설계하는" - Sentences 가 막는 자리다 (#1113)
		const words = toWords("미팅은 끝났지만, 실행은 지금부터. AI가 설계하는 완벽한 후속 일정");
		const at = (w: string) => words.findIndex((word) => word.text === w);
		expect(scoreBreaks(words, measure, 1000, [at("AI가")]).penalty).toBe(100);
		expect(scoreBreaks(words, measure, 1000, [at("지금부터.")]).penalty).toBe(0);
		// 한 어절짜리 문장 뒤는 문장 끝이라 그대로 0 이다
		const short = toWords("확인했어요. 네. 다음 단계로 갑니다.");
		expect(scoreBreaks(short, measure, 1000, [1]).penalty).toBe(0);
	});

	it("charges a middle line that fills less than half the box, but not a short first line", () => {
		// 폭 100 - "aaaaaaaa"(80) / "b"(10) / "cccc dddd": 끊는 자리 4 + 4, 가운데 줄이 짧아 8 (#1113)
		const words = toWords("aaaaaaaa b cccc dddd");
		expect(scoreBreaks(words, measure, 100, [0, 1]).penalty).toBe(16);
		// 첫 줄이 짧은 것은 제목 줄("녹음본 업로드. / …")처럼 의도한 모양이라 벌점이 없다
		expect(scoreBreaks(words, measure, 100, [1]).penalty).toBe(4);
	});
});

describe("chooseBreaks across sentences", () => {
	it.each([130, 150, 170])(
		"never ends a line with only the first word of the next sentence (width %i)",
		(width) => {
			// 예전 엔진은 140~170 에서 "미팅은 끝났지만, / 실행은 지금부터. AI가 / 설계하는 …" 로 바꿨다 (#1113)
			const text = "미팅은 끝났지만, 실행은 지금부터. AI가 설계하는 완벽한 후속 일정";
			const { breaks } = chooseBreaks(text, measure, width);
			expect(lines(text, breaks).some((line) => line.endsWith("AI가"))).toBe(false);
		},
	);
});

describe("chooseBreaks with a short middle line", () => {
	it("does not trade a compound noun for a middle line of one word", () => {
		// 폭 200 - 브라우저는 "…작은 결정 / 사항까지, …" 로 끊는다. 예전 엔진은 벌점 합(7)만 보고
		// "…작은 결정 / 사항까지, / AI가 …" 로 바꿔 가운데 줄이 한 어절이 됐다 (#1113)
		const text =
			"스쳐 지나가는 아이디어부터 작은 결정 사항까지, AI가 빠짐없이 기록하고 요약해줘요.";
		const { breaks } = chooseBreaks(text, measure, 200);
		expect(lines(text, breaks)).toEqual([
			"스쳐 지나가는 아이디어부터",
			"작은 결정 사항까지,",
			"AI가 빠짐없이 기록하고 요약해줘요.",
		]);
	});
});

describe("a lone last word", () => {
	it("charges leaving only the last word on the last line, unless it is a sentence of its own", () => {
		const words = toWords("안에 다른 버튼을 두지 않습니다");
		expect(scoreBreaks(words, measure, 1000, [words.length - 2]).penalty).toBe(12);
		// 앞 어절에서 문장이 끝났으면 새 문장 하나가 줄을 차지하는 것이다 (#1133)
		const sentence = toWords("저장했습니다. 계속할까요?");
		expect(scoreBreaks(sentence, measure, 1000, [0]).penalty).toBe(0);
	});

	it("moves another word down instead of leaving one alone, with the same line count", () => {
		// 폭 330 - 브라우저는 "…버튼을 두지 / 않습니다" 로 끊는다 (#1133)
		const text = "카드 전체가 눌리는 표면이 되므로 안에 다른 버튼을 두지 않습니다";
		const choice = chooseBreaks(text, measure, 330);
		expect(lines(text, choice.native).at(-1)).toBe("않습니다");
		expect(choice.changed).toBe(true);
		expect(choice.breaks.length).toBe(choice.native.length);
		expect(lines(text, choice.breaks).at(-1)?.split(" ").length).toBeGreaterThan(1);
	});
});

describe("unclosed parentheses", () => {
	it("do not turn every later gap into an inside-parentheses gap", () => {
		const words = toWords("안 됐어요 :( 다시 해 볼게요. 다음 문장입니다.");
		const at = (w: string) => words.findIndex((word) => word.text === w);
		expect(scoreBreaks(words, measure, 1000, [at("볼게요.")]).penalty).toBe(0);
	});
});

describe("list items", () => {
	it("charges a split inside a · list item above a split between items", () => {
		const words = toWords("포커스 트랩 · Esc 닫기 · 배경 잠금");
		const at = (w: string) => words.findIndex((word) => word.text === w);
		expect(scoreBreaks(words, measure, 1000, [at("Esc")]).penalty).toBe(10);
		expect(scoreBreaks(words, measure, 1000, [at("트랩") + 1]).penalty).toBe(8);
	});
});

describe("chooseBreaks", () => {
	it("keeps the browser result when it already breaks in good places", () => {
		const text = "저장했습니다. 계속할까요?";
		const choice = chooseBreaks(text, measure, 80);
		expect(choice.changed).toBe(false);
		expect(choice.breaks).toEqual(choice.native);
	});

	it("replaces the browser result when it splits a phrase, with the same line count", () => {
		const text = "제목이면 heading, 본문이면 body 입니다.";
		// 폭 240: 브라우저는 "body" 뒤에서 끊어 "입니다." 가 혼자 다음 줄
		const choice = chooseBreaks(text, measure, 240);
		const native = lines(text, choice.native);
		expect(native.at(-1)).toBe("입니다.");
		expect(choice.changed).toBe(true);
		expect(choice.breaks.length).toBe(choice.native.length);
		expect(lines(text, choice.breaks).some((line) => line.endsWith("body"))).toBe(false);
		const words = toWords(text);
		expect(scoreBreaks(words, measure, 240, choice.breaks).penalty).toBeLessThan(
			scoreBreaks(words, measure, 240, choice.native).penalty,
		);
	});

	it("leaves single-line text and too-long words alone", () => {
		expect(chooseBreaks("짧은 글", measure, 500).changed).toBe(false);
		expect(chooseBreaks("가 나다라마바사아자 차", measure, 40).changed).toBe(false);
	});
});
