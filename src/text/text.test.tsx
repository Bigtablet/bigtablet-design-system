import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	phraseRanges,
	renderPhrases,
	renderSentences,
	Sentences,
	sentenceText,
	splitSentences,
} from "./index";

const texts = (text: string) => splitSentences(text).map((sentence) => sentence.text);

describe("splitSentences", () => {
	it("splits on period, question and exclamation marks", () => {
		expect(texts("저장했어요. 계속할까요? 완료!")).toEqual(["저장했어요.", "계속할까요?", "완료!"]);
	});

	// 숫자 바로 뒤 마침표는 날짜 - 문장 끝으로 보지 않는다.
	it("does not end a sentence on a dotted abbreviation", () => {
		expect(texts("예시(e.g. 버튼)를 봅니다. 다음입니다.")).toEqual([
			"예시(e.g. 버튼)를 봅니다.",
			"다음입니다.",
		]);
		// 닫는 괄호 · 따옴표가 바로 붙어도 약어다
		expect(texts("버튼 (e.g.) 처럼 씁니다. 다음입니다.")).toEqual([
			"버튼 (e.g.) 처럼 씁니다.",
			"다음입니다.",
		]);
		expect(texts("“i.e.” 로 적습니다. 다음입니다.")).toEqual([
			"“i.e.” 로 적습니다.",
			"다음입니다.",
		]);
	});

	it("keeps a dotted date inside its sentence", () => {
		expect(texts("2026. 5. 21. 에 만료돼요. 갱신하세요.")).toEqual([
			"2026. 5. 21. 에 만료돼요.",
			"갱신하세요.",
		]);
	});

	// 숫자 뒤 예외는 마침표에만 - 물음표 · 느낌표는 문장 끝이다.
	it("ends a sentence on ? or ! right after a digit", () => {
		expect(texts("정답은 42! 다음 문제로 넘어가세요.")).toEqual([
			"정답은 42!",
			"다음 문제로 넘어가세요.",
		]);
	});

	it("ends a sentence after closing quotes and brackets", () => {
		expect(texts('"완료했어요." (자동 저장돼요.) 「끝」이에요.')).toEqual([
			'"완료했어요."',
			"(자동 저장돼요.)",
			"「끝」이에요.",
		]);
	});

	it("keeps trailing words without an end mark as the last sentence", () => {
		expect(texts("결제가 실패했어요. 다시 시도")).toEqual(["결제가 실패했어요.", "다시 시도"]);
	});

	// 같은 문장이 반복돼도 시작 위치가 달라 key 가 겹치지 않는다.
	it("gives repeated sentences distinct start offsets", () => {
		expect(splitSentences("확인. 확인.").map((sentence) => sentence.start)).toEqual([0, 4]);
	});
});

describe("renderSentences", () => {
	it("returns a single sentence and non-string content unchanged", () => {
		expect(renderSentences("한 문장이에요.")).toBe("한 문장이에요.");
		const node = <b>굵게</b>;
		expect(renderSentences(node)).toBe(node);
	});

	// 문장 사이 공백을 텍스트로 남겨 textContent(접근성 이름 · 낭독)가 원문과 같다.
	it("wraps each sentence and keeps the original text content", () => {
		const text = "결제 수단이 비활성화되었습니다. 새 결제 수단을 등록하세요.";
		const { container } = render(<p>{renderSentences(text)}</p>);
		const items = container.querySelectorAll(".sentences_item");
		expect([...items].map((item) => item.textContent)).toEqual([
			"결제 수단이 비활성화되었습니다.",
			"새 결제 수단을 등록하세요.",
		]);
		expect(container.textContent).toBe(text);
	});

	// 문장 안팎의 공백을 원문 그대로 둔다 - 줄바꿈 금지 공백(U+00A0)이 일반 공백으로 바뀌지 않는다.
	it("keeps non-breaking and surrounding spaces from the original", () => {
		const text = " 금액은 1\u00a0000원입니다.  확인하세요. ";
		const { container } = render(<p>{renderSentences(text)}</p>);
		expect(container.querySelector(".sentences_item")?.textContent).toBe(
			"금액은 1\u00a0000원입니다.",
		);
		expect(container.textContent).toBe(text);
	});
});

describe("Sentences", () => {
	it("renders a single sentence as plain text", () => {
		const { container } = render(
			<p>
				<Sentences text="한 문장이에요." />
			</p>,
		);
		expect(container.innerHTML).toBe("<p>한 문장이에요.</p>");
	});

	it("wraps each sentence like renderSentences", () => {
		const text = "Saved. Continue?";
		const { container } = render(
			<p>
				<Sentences text={text} />
			</p>,
		);
		expect(container.querySelectorAll(".sentences_item")).toHaveLength(2);
		expect(container.textContent).toBe(text);
	});

	// 띄어쓰기 없는 언어는 어절이 하나라 나누지 않는다.
	it("leaves text without spaces (ja · zh) as is", () => {
		const text = "保存しました。続けますか？";
		const { container } = render(
			<p>
				<Sentences text={text} />
			</p>,
		);
		expect(container.querySelector(".sentences_item")).toBeNull();
		expect(container.textContent).toBe(text);
	});
});

describe("sentenceText", () => {
	// 기본 매처는 span 으로 나뉜 문구를 못 찾는다 - 매처는 가장 안쪽 요소 하나를 고른다.
	it("finds split text by its full content", () => {
		const text = "저장했어요. 계속할까요?";
		render(
			<p data-testid="target">
				<Sentences text={text} />
			</p>,
		);
		expect(screen.queryByText(text)).toBeNull();
		expect(screen.getByText(sentenceText(text))).toBe(screen.getByTestId("target"));
	});
});

// 꾸미는 말과 꾸밈받는 말 사이에서 줄이 갈리지 않게 묶는다 (#1077)
describe("renderPhrases", () => {
	const phrases = (text: string) => {
		const { container } = render(<p>{renderPhrases(text)}</p>);
		return {
			groups: [...container.querySelectorAll(".sentences_phrase")].map((el) => el.textContent),
			text: container.textContent,
		};
	};

	it("keeps a ~의 word with the next word", () => {
		expect(phrases("고객의 신뢰를 먼저 얻습니다").groups).toEqual(["고객의 신뢰를"]);
	});

	it("chains a determiner and a ~의 word into one phrase", () => {
		expect(phrases("이 아래의 컴포넌트에서 부릅니다").groups).toEqual(["이 아래의 컴포넌트에서"]);
	});

	it("caps a phrase at three words", () => {
		expect(phrases("그 회사의 팀의 자료의 목록").groups).toEqual(["그 회사의 팀의", "자료의 목록"]);
	});

	// 조사가 아니라 `의` 로 끝나는 명사 - 꾸밈 관계가 아니라 묶지 않는다
	it("does not bind a noun that only ends in 의", () => {
		expect(phrases("회의 일정을 확인합니다").groups).toEqual([]);
	});

	// 혼자 뜻이 서지 않는 말은 앞 어절에 붙인다 (#1081)
	it("keeps a copula or dependent noun with the word before it", () => {
		expect(phrases("본문이면 body 입니다.").groups).toEqual(["body 입니다."]);
		expect(phrases("지금 바꿀 수 있습니다").groups).toEqual(["바꿀 수"]);
		expect(phrases("진행 중입니다").groups).toEqual(["진행 중입니다"]);
	});

	it("does not treat a word that merely starts like a dependent noun as one", () => {
		expect(phrases("내용을 수정한 뒤 저장합니다").groups).toEqual([]);
	});

	it("does not bind across a comma", () => {
		expect(phrases("고객의, 신뢰").groups).toEqual([]);
	});

	it("leaves text without such words untouched and keeps the original characters", () => {
		expect(renderPhrases("저장했어요")).toBe("저장했어요");
		expect(phrases("이 아래의\u00a0컴포넌트 1\u00a0000원").text).toBe(
			"이 아래의\u00a0컴포넌트 1\u00a0000원",
		);
	});

	it("binds inside each sentence of a multi-sentence text", () => {
		render(<p data-testid="p">{renderSentences("이 화면을 엽니다. 모든 항목이 보입니다.")}</p>);
		const groups = [...screen.getByTestId("p").querySelectorAll(".sentences_phrase")].map(
			(el) => el.textContent,
		);
		expect(groups).toEqual(["이 화면을", "모든 항목이"]);
		expect(screen.getByText(sentenceText("이 화면을 엽니다. 모든 항목이 보입니다."))).toBe(
			screen.getByTestId("p"),
		);
	});

	it("keeps a single sentence string as is", () => {
		expect(renderSentences("이 아래의 컴포넌트에서 부릅니다")).toBe(
			"이 아래의 컴포넌트에서 부릅니다",
		);
	});
});

// React 없이 쓰는 순수 규칙 - 앱이 서버 · 다른 렌더러에서도 같은 범위를 얻는다 (#1079)
describe("phraseRanges", () => {
	it("returns the source ranges of phrases of two or more words", () => {
		const text = "모든 항목이 이 아래의 컴포넌트에서 보입니다";
		expect(phraseRanges(text).map(({ start, end }) => text.slice(start, end))).toEqual([
			"모든 항목이",
			"이 아래의 컴포넌트에서",
		]);
	});

	// gapPenalty 의 붙여 둘 자리와 같은 규칙 - BalancedText 와 문장 단위 줄바꿈이 갈리지 않게 (#1138)
	it("binds a spaced particle to the English word, code, or bracket before it", () => {
		const text = "Windows Hello · Touch ID 로 확인합니다. `totalPages` 를 (선택) 는 넘깁니다";
		expect(phraseRanges(text).map(({ start, end }) => text.slice(start, end))).toEqual([
			"ID 로",
			"`totalPages` 를",
			"(선택) 는",
		]);
	});

	// JS `\s` 는 nbsp 를 포함한다 - 어절로 나누면 묶음 경계에서 nbsp 가 무시된다 (#1137)
	it("treats words glued with a no-break space as one word", () => {
		const text = "2단계 인증을 한 번 더 받습니다. 이 Google 계정으로 엽니다";
		expect(phraseRanges(text).map(({ start, end }) => text.slice(start, end))).toEqual([
			"한 번 더",
			"이 Google 계정으로",
		]);
		expect(splitSentences("1 000원입니다. 다음입니다.").map((s) => s.text)).toEqual([
			"1 000원입니다.",
			"다음입니다.",
		]);
	});
});

// 코드 · 링크 같은 요소에 이어 붙은 조각은 묶지 않는다 - 통째로 다음 줄로 넘어가 요소와 조사가 떨어진다 (#1081)
describe("renderSentences with surrounding elements", () => {
	const items = (text: string, options: Parameters<typeof renderSentences>[1]) => {
		const { container } = render(<p>{renderSentences(text, options)}</p>);
		return [...container.querySelectorAll(".sentences_item")].map((el) => el.textContent);
	};

	it("leaves the first sentence open when it continues from an element", () => {
		expect(items(" 가 이것을 만듭니다. 내용이 같습니다.", { continuesFrom: true })).toEqual([
			"내용이 같습니다.",
		]);
	});

	it("leaves an unfinished last sentence open when an element follows", () => {
		expect(items("내용이 같습니다. 에이전트에게는 이 사이트의 ", { continuesTo: true })).toEqual([
			"내용이 같습니다.",
		]);
	});

	it("keeps whitespace between two elements", () => {
		expect(renderSentences(" ", { continuesFrom: true, continuesTo: true })).toBe(" ");
	});

	it("keeps a finished last sentence grouped even when an element follows", () => {
		expect(items("첫 문장입니다. 둘째 문장입니다.", { continuesTo: true })).toEqual([
			"첫 문장입니다.",
			"둘째 문장입니다.",
		]);
	});
});
