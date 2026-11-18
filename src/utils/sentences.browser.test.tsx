import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSentences } from "./sentences";

// 붙여 둘 어절 묶음(#1077)이 실제 폭에서 어떻게 놓이는지 - jsdom 은 줄바꿈을 재지 못한다
describe("phrase grouping (Chromium)", () => {
	const text = "설정을 저장했습니다. 이 아래의 컴포넌트에서 부릅니다.";

	it("moves a whole phrase to the next line instead of splitting it", () => {
		const { container } = render(
			<p style={{ width: 230, fontSize: 16, lineHeight: "20px" }}>{renderSentences(text)}</p>,
		);
		const phrase = container.querySelector(".sentences_phrase") as HTMLElement;
		expect(phrase.textContent).toBe("이 아래의 컴포넌트에서");
		expect(phrase.getBoundingClientRect().height).toBeLessThan(30);
	});

	it("wraps inside a phrase rather than overflowing a box narrower than it", () => {
		const { container } = render(
			<p style={{ width: 80, fontSize: 16, lineHeight: "20px" }}>{renderSentences(text)}</p>,
		);
		const box = container.firstElementChild as HTMLElement;
		expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
	});
});
