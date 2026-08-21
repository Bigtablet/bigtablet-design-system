import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./index";

describe("EmptyState", () => {
	it("renders title and description", () => {
		render(<EmptyState title="비어있음" description="아직 데이터가 없어요" />);
		expect(screen.getByText("비어있음")).toBeInTheDocument();
		expect(screen.getByText("아직 데이터가 없어요")).toBeInTheDocument();
	});

	it("renders illustration slot", () => {
		render(<EmptyState illustration={<svg data-testid="ill" />} title="t" />);
		expect(screen.getByTestId("ill")).toBeInTheDocument();
	});

	it("renders action slot", () => {
		render(<EmptyState title="t" action={<button type="button">Add</button>} />);
		expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
	});

	it("title is h3", () => {
		render(<EmptyState title="t" />);
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("t");
	});

	it("applies size class", () => {
		const { container } = render(<EmptyState size="lg" title="t" />);
		expect(container.firstChild).toHaveClass("empty_state_size_lg");
	});

	// ── 슬롯 접근성 계약 ────────────────────────────────────────────────────
	// illustration 은 장식 전용이라 aria-hidden 을 유지하고, action 은 노출한다.
	// 이 짝을 고정해 두는 이유는 두 방향 모두 조용히 깨지기 때문이다.
	//  - illustration 에서 aria-hidden 이 빠지면 이름 없는 그래픽이 트리에 노출된다 (axe 는 못 잡는다).
	//  - action 에 aria-hidden 이 붙으면 포커스는 가는데 보조기기엔 없는 버튼이 된다 (WCAG 4.1.2).
	it("keeps the illustration slot out of the accessibility tree", () => {
		render(<EmptyState illustration={<svg data-testid="ill" />} title="t" />);
		expect(screen.getByTestId("ill").closest("[aria-hidden]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
	});

	// 미지정 시 기존과 동일해야 한다 - 옵션이 기본 동작을 바꾸면 모든 사용처가 회귀한다.
	it("does not fill height unless asked", () => {
		const { container } = render(<EmptyState title="t" />);
		expect(container.firstChild).not.toHaveClass("empty_state_fill_height");
	});

	it("fills the parent height when fillHeight is set", () => {
		const { container } = render(<EmptyState title="t" fillHeight />);
		expect(container.firstChild).toHaveClass("empty_state_fill_height");
	});

	it("exposes the action slot to the accessibility tree", () => {
		render(<EmptyState title="t" action={<button type="button">Add</button>} />);
		expect(screen.getByRole("button", { name: "Add" }).closest("[aria-hidden]")).toBeNull();
	});
});
