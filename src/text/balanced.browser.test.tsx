import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BalancedText } from "./balanced";

const text = "제목이면 heading, 본문이면 body 입니다.";

// 실제 Chromium 에서 마운트 뒤 줄을 계산해 바꾸는지, 바꿔도 원문이 그대로인지 (#1083)
describe("BalancedText (Chromium)", () => {
	const lineTexts = (el: HTMLElement) =>
		[...el.querySelectorAll(".text_balanced_line")].map((line) => line.textContent);

	it("moves a lone copula back so no line ends right before it", async () => {
		// 폭을 "…본문이면 body" 까지 한 줄에 들어가고 "입니다." 는 넘치게 - 브라우저는 "body / 입니다." 로 끊는다
		const { container } = render(
			<BalancedText
				as="p"
				text={text}
				style={{ width: 300, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			/>,
		);
		const p = container.firstElementChild as HTMLElement;
		const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
		ctx.font = "16px sans-serif";
		const upToBody = ctx.measureText("제목이면 heading, 본문이면 body").width;
		const all = ctx.measureText(text).width;
		p.style.width = `${Math.ceil((upToBody + all) / 2)}px`;

		await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(1);
		const lines = lineTexts(p);
		expect(lines.some((line) => line?.endsWith("body"))).toBe(false);
		// 복사 · 접근성 이름은 원문 그대로
		expect(p.textContent).toBe(text);
		const tops = new Set(
			[...p.querySelectorAll(".text_balanced_line")].map((l) =>
				Math.round(l.getBoundingClientRect().top),
			),
		);
		expect(tops.size).toBe(lines.length);
	});

	it("keeps the browser wrapping when it already breaks in good places", async () => {
		const { container } = render(
			<BalancedText
				as="p"
				text="저장했습니다. 계속할까요?"
				style={{ width: 120, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			/>,
		);
		const p = container.firstElementChild as HTMLElement;
		await new Promise((r) => setTimeout(r, 300));
		expect(p.querySelector(".text_balanced_line")).toBeNull();
		expect(p.textContent).toBe("저장했습니다. 계속할까요?");
	});
});
