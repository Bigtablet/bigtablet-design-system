import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorState } from "./index";

describe("ErrorState", () => {
	it("renders default title when none provided", () => {
		render(<ErrorState />);
		expect(screen.getByText("문제가 발생했습니다")).toBeInTheDocument();
	});

	it("renders custom title + description", () => {
		render(<ErrorState title="불러오기 실패" description="다시 시도해 주세요" />);
		expect(screen.getByText("불러오기 실패")).toBeInTheDocument();
		expect(screen.getByText("다시 시도해 주세요")).toBeInTheDocument();
	});

	it("has role=alert", () => {
		render(<ErrorState title="에러" />);
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("defaults to page variant", () => {
		const { container } = render(<ErrorState title="에러" />);
		expect(container.firstChild).toHaveClass("error_state_variant_page");
	});

	it("applies widget variant class", () => {
		const { container } = render(<ErrorState variant="widget" title="에러" />);
		expect(container.firstChild).toHaveClass("error_state_variant_widget");
	});

	it("renders default icon", () => {
		const { container } = render(<ErrorState title="에러" />);
		expect(container.querySelector(".error_state_icon")).toBeInTheDocument();
	});

	it("hides icon when icon={null}", () => {
		const { container } = render(<ErrorState title="에러" icon={null} />);
		expect(container.querySelector(".error_state_icon")).not.toBeInTheDocument();
	});

	it("renders custom icon", () => {
		render(<ErrorState title="에러" icon={<span data-testid="custom-icon">!</span>} />);
		expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
	});

	it("renders action slot", () => {
		render(<ErrorState title="에러" action={<button type="button">재시도</button>} />);
		expect(screen.getByRole("button", { name: "재시도" })).toBeInTheDocument();
	});

	it("passes through className", () => {
		const { container } = render(<ErrorState title="에러" className="custom" />);
		expect(container.firstChild).toHaveClass("error_state", "custom");
	});
});
