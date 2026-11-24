import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSentences } from "./index";

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

	// 묶음은 inline-block 이라 기준선이 기본값이면 마지막 줄에 맞춰진다 - 두 줄로 감긴 문장이 목록 번호를 둘째 줄로
	// 끌어내렸다(#1148). ::marker 는 잴 수 없어, 번호처럼 줄 머리 기준선에 서는 폭 0 표지로 잰다
	it("keeps the line start beside the first line of a wrapped sentence", () => {
		const { container } = render(
			<ol style={{ width: 200, fontSize: 16, lineHeight: "20px" }}>
				<li>
					<span data-line-start="" />
					{renderSentences(
						"첫 문장은 폭을 넘어 두 줄 넘게 감길 만큼 충분히 길게 씁니다. 둘째 문장입니다.",
					)}
				</li>
			</ol>,
		);
		const lineStart = container.querySelector("[data-line-start]") as HTMLElement;
		const first = container.querySelector(".sentences_item") as HTMLElement;
		expect(first.getBoundingClientRect().height).toBeGreaterThan(30);
		expect(
			Math.abs(lineStart.getBoundingClientRect().top - first.getBoundingClientRect().top),
		).toBeLessThan(2);
	});

	it("wraps inside a phrase rather than overflowing a box narrower than it", () => {
		const { container } = render(
			<p style={{ width: 80, fontSize: 16, lineHeight: "20px" }}>{renderSentences(text)}</p>,
		);
		const box = container.firstElementChild as HTMLElement;
		expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
	});
});
