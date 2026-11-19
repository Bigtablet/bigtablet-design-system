import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BalancedText } from "./balanced";

// jsdom 은 canvas 가 없다 - 계산을 못 하면 글자 규칙만 건 원문 그대로 둔다 (SSR 첫 렌더와 같다)
describe("BalancedText without canvas", () => {
	it("renders the original text as words under the root with a stable id", () => {
		render(
			<BalancedText as="h2" className="title">
				이 아래의 컴포넌트에서 부릅니다
			</BalancedText>,
		);
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toHaveTextContent("이 아래의 컴포넌트에서 부릅니다");
		expect(heading).toHaveClass("title", "text_balanced");
		expect(heading.querySelector(".text_balanced_line")).toBeNull();
		// 하이드레이션 전 스크립트가 `:nth-child(n of .text_balanced_word)` 로 세려면 어절이 루트 바로 아래여야 한다
		expect(heading.querySelectorAll(":scope > .text_balanced_word")).toHaveLength(4);
		expect(heading.getAttribute("data-balanced")).toBeTruthy();
	});

	it("keeps its own data-balanced id even when one is passed in", () => {
		const { container } = render(
			<BalancedText as="p" {...{ "data-balanced": "mine" }}>
				글
			</BalancedText>,
		);
		expect(container.firstElementChild?.getAttribute("data-balanced")).not.toBe("mine");
	});

	it("keeps inline elements whole and glues text written right after them", () => {
		const { container } = render(
			<BalancedText as="p">
				마크업 없이 <code>useConfirm</code> 훅으로 <code>x</code>에서 띄웁니다.
			</BalancedText>,
		);
		const p = container.firstElementChild as HTMLElement;
		expect(p).toHaveTextContent("마크업 없이 useConfirm 훅으로 x에서 띄웁니다.");
		const words = [...p.querySelectorAll(".text_balanced_word")].map((w) => w.textContent);
		expect(words).toEqual(["마크업", "없이", "useConfirm", "훅으로", "x에서", "띄웁니다."]);
		expect(p.querySelectorAll("code")).toHaveLength(2);
	});

	it("splits words inside fragments and keeps empty elements without duplicate keys", () => {
		const errors: unknown[] = [];
		const original = console.error;
		console.error = (...args: unknown[]) => errors.push(args);
		try {
			const { container } = render(
				<BalancedText as="p">
					보기 <i /> 아이콘 <>여러 어절 문장</>
				</BalancedText>,
			);
			const words = [
				...(container.firstElementChild as HTMLElement).querySelectorAll(".text_balanced_word"),
			].map((w) => w.textContent);
			expect(words).toEqual(["보기", "", "아이콘", "여러", "어절", "문장"]);
			expect(errors).toHaveLength(0);
		} finally {
			console.error = original;
		}
	});
});
