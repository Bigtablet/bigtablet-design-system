import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSentences, splitSentences } from "./sentences";

const texts = (text: string) => splitSentences(text).map((sentence) => sentence.text);

describe("splitSentences", () => {
	it("splits on period, question and exclamation marks", () => {
		expect(texts("저장했어요. 계속할까요? 완료!")).toEqual(["저장했어요.", "계속할까요?", "완료!"]);
	});

	// 숫자 바로 뒤 마침표는 날짜 - 문장 끝으로 보지 않는다.
	it("keeps a dotted date inside its sentence", () => {
		expect(texts("2026. 5. 21. 에 만료돼요. 갱신하세요.")).toEqual([
			"2026. 5. 21. 에 만료돼요.",
			"갱신하세요.",
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
});
