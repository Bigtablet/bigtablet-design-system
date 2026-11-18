import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BalancedText } from "./balanced";

// jsdom 은 canvas 가 없다 - 계산을 못 하면 글자 규칙만 건 원문 그대로 둔다 (SSR 첫 렌더와 같다)
describe("BalancedText without canvas", () => {
	it("renders the original text with phrase grouping and the given element", () => {
		render(<BalancedText as="h2" text="이 아래의 컴포넌트에서 부릅니다" className="title" />);
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toHaveTextContent("이 아래의 컴포넌트에서 부릅니다");
		expect(heading).toHaveClass("title");
		expect(heading.querySelector(".text_balanced_line")).toBeNull();
		expect(heading.querySelector(".sentences_phrase")).toHaveTextContent("이 아래의 컴포넌트에서");
	});
});
