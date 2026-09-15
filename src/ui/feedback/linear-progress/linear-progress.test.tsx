import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinearProgress } from "./index";

describe("LinearProgress", () => {
	it("renders progressbar role", () => {
		render(<LinearProgress totalSteps={4} currentStep={2} aria-label="Progress" />);
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("shows correct aria attributes", () => {
		render(<LinearProgress totalSteps={4} currentStep={2} aria-label="Progress" />);
		const el = screen.getByRole("progressbar");
		expect(el).toHaveAttribute("aria-valuenow", "2");
		expect(el).toHaveAttribute("aria-valuemin", "0");
		expect(el).toHaveAttribute("aria-valuemax", "4");
	});

	it("renders 0% width when currentStep is 0", () => {
		render(<LinearProgress totalSteps={4} currentStep={0} aria-label="Progress" />);
		const indicator = screen.getByRole("progressbar").querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "0%" });
	});

	it("renders 50% width when currentStep is half of totalSteps", () => {
		render(<LinearProgress totalSteps={4} currentStep={2} aria-label="Progress" />);
		const indicator = screen.getByRole("progressbar").querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "50%" });
	});

	it("renders 100% width when complete", () => {
		render(<LinearProgress totalSteps={4} currentStep={4} aria-label="Progress" />);
		const indicator = screen.getByRole("progressbar").querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "100%" });
	});

	it("clamps to 0-100 range", () => {
		const { rerender } = render(
			<LinearProgress totalSteps={4} currentStep={-1} aria-label="Progress" />,
		);
		let bar = screen.getByRole("progressbar");
		expect(bar.querySelector(".linear_progress_indicator")).toHaveStyle({ width: "0%" });
		// 막대만 보고 "clamps" 라고 부르면 안 된다 - 스크린리더가 읽는 값은 aria-valuenow 다.
		// 범위 밖 값이 그대로 나가면 "-1 / 4" 로 읽힌다.
		expect(bar).toHaveAttribute("aria-valuenow", "0");

		rerender(<LinearProgress totalSteps={4} currentStep={10} aria-label="Progress" />);
		bar = screen.getByRole("progressbar");
		expect(bar.querySelector(".linear_progress_indicator")).toHaveStyle({ width: "100%" });
		expect(bar).toHaveAttribute("aria-valuenow", "4");
	});

	it("accepts custom className", () => {
		render(
			<LinearProgress totalSteps={4} currentStep={2} className="my-custom" aria-label="Progress" />,
		);
		const el = screen.getByRole("progressbar");
		expect(el).toHaveClass("linear_progress");
		expect(el).toHaveClass("my-custom");
	});
});
