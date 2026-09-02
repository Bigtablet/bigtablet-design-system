import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stat } from "./index";

describe("Stat", () => {
	it("shows label, value and delta", () => {
		const { container } = render(<Stat label="오늘 매출" value="₩1,284,000" delta="+12%" />);

		expect(screen.getByText("오늘 매출")).toBeInTheDocument();
		expect(screen.getByText("₩1,284,000")).toBeInTheDocument();
		expect(container.querySelector(".stat_delta")).toHaveTextContent("+12%");
	});

	it("omits the delta row when there is no delta", () => {
		// 빈 줄이 남으면 지표들이 나란히 있을 때 값 높이가 어긋난다.
		const { container } = render(<Stat label="활성 직원" value="12" />);

		expect(container.querySelector(".stat_delta")).toBeNull();
	});

	it("colours the delta by good/bad, not by direction", () => {
		// "재고 부족 +2" 는 오르지만 나쁘다 - 방향과 색을 묶으면 표현할 수 없다.
		const { container, rerender } = render(
			<Stat label="재고 부족" value="3" delta="+2개" deltaTone="negative" />,
		);
		expect(container.querySelector(".stat_delta")).toHaveClass("stat_delta_negative");

		rerender(<Stat label="매출" value="1" delta="+2%" deltaTone="positive" />);
		expect(container.querySelector(".stat_delta")).toHaveClass("stat_delta_positive");
	});

	it("defaults the delta tone to neutral", () => {
		const { container } = render(<Stat label="활성 직원" value="12" delta="0%" />);

		expect(container.querySelector(".stat_delta")).toHaveClass("stat_delta_neutral");
	});

	it("hides a decorative icon from the accessibility tree", () => {
		const { container } = render(
			<Stat label="매출" value="1" icon={<svg data-testid="i" role="img" aria-label="x" />} />,
		);

		expect(container.querySelector(".stat_icon")).toHaveAttribute("aria-hidden", "true");
	});

	it("hands the root element to a ref", () => {
		const ref = { current: null as HTMLDivElement | null };
		render(<Stat label="매출" value="1" ref={ref} />);

		expect(ref.current).toHaveClass("stat");
	});
});
