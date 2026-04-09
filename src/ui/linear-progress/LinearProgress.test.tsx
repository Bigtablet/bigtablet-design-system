import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinearProgress } from "./index";

describe("LinearProgress", () => {
	it("renders progressbar role", () => {
		render(<LinearProgress totalSteps={4} currentStep={2} />);
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("shows correct aria attributes", () => {
		render(<LinearProgress totalSteps={4} currentStep={2} />);
		const el = screen.getByRole("progressbar");
		expect(el).toHaveAttribute("aria-valuenow", "2");
		expect(el).toHaveAttribute("aria-valuemin", "0");
		expect(el).toHaveAttribute("aria-valuemax", "4");
	});

	it("renders 0% width when currentStep is 0", () => {
		render(<LinearProgress totalSteps={4} currentStep={0} />);
		const indicator = screen
			.getByRole("progressbar")
			.querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "0%" });
	});

	it("renders 50% width when currentStep is half of totalSteps", () => {
		render(<LinearProgress totalSteps={4} currentStep={2} />);
		const indicator = screen
			.getByRole("progressbar")
			.querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "50%" });
	});

	it("renders 100% width when complete", () => {
		render(<LinearProgress totalSteps={4} currentStep={4} />);
		const indicator = screen
			.getByRole("progressbar")
			.querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "100%" });
	});

	it("clamps to 0-100 range", () => {
		const { rerender } = render(
			<LinearProgress totalSteps={4} currentStep={-1} />,
		);
		let indicator = screen
			.getByRole("progressbar")
			.querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "0%" });

		rerender(<LinearProgress totalSteps={4} currentStep={10} />);
		indicator = screen
			.getByRole("progressbar")
			.querySelector(".linear_progress_indicator");
		expect(indicator).toHaveStyle({ width: "100%" });
	});

	it("accepts custom className", () => {
		render(
			<LinearProgress
				totalSteps={4}
				currentStep={2}
				className="my-custom"
			/>,
		);
		const el = screen.getByRole("progressbar");
		expect(el).toHaveClass("linear_progress");
		expect(el).toHaveClass("my-custom");
	});
});
