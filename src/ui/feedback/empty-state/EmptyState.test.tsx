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
});
