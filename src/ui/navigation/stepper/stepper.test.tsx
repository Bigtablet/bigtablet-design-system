import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Stepper, type StepperStep } from "./index";

const STEPS: StepperStep[] = [
	{ id: "account", label: "계정" },
	{ id: "profile", label: "프로필", description: "이름과 소속" },
	{ id: "done", label: "완료" },
];

describe("Stepper", () => {
	it("renders an ordered list so the sequence survives", () => {
		// <div> 로 만들면 "3개 중 2번째" 라는 순서 정보가 스크린리더에 남지 않는다.
		const { container } = render(<Stepper steps={STEPS} current={1} />);

		expect(container.querySelector("ol")).not.toBeNull();
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
	});

	it("derives done / active / pending from the current index", () => {
		const { container } = render(<Stepper steps={STEPS} current={1} />);

		const items = container.querySelectorAll(".stepper_step");
		expect(items[0]).toHaveClass("stepper_step_done");
		expect(items[1]).toHaveClass("stepper_step_active");
		expect(items[2]).toHaveClass("stepper_step_pending");
	});

	it("marks only the current step with aria-current=step", () => {
		render(<Stepper steps={STEPS} current={1} />);

		const items = screen.getAllByRole("listitem");
		expect(items[0]).not.toHaveAttribute("aria-current");
		expect(items[1]).toHaveAttribute("aria-current", "step");
		expect(items[2]).not.toHaveAttribute("aria-current");
	});

	it("speaks the status, not just paints it", () => {
		// 체크 모양과 배경색은 보조기술에 닿지 않는다 (WCAG 1.4.1).
		render(<Stepper steps={STEPS} current={1} />);

		const items = screen.getAllByRole("listitem");
		expect(items[0]).toHaveTextContent("계정 완료");
		expect(items[1]).toHaveTextContent("프로필 현재 단계");
		expect(items[2]).toHaveTextContent("완료");
		expect(items[2]).not.toHaveTextContent("완료 완료");
	});

	it("tells done apart from pending by shape - check vs hollow number", () => {
		const { container } = render(<Stepper steps={STEPS} current={1} />);

		const indicators = container.querySelectorAll(".stepper_indicator");
		expect(indicators[0].querySelector("svg")).not.toBeNull();
		expect(indicators[1]).toHaveTextContent("2");
		expect(indicators[2]).toHaveTextContent("3");
	});

	it("makes only past steps clickable when onStepClick is given", () => {
		// 아직 오지 않은 단계로 건너뛰면 그 사이 폼 검증을 우회한다 - 되돌아가기만 연다.
		const onStepClick = vi.fn();
		render(<Stepper steps={STEPS} current={1} onStepClick={onStepClick} />);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(1);
		expect(buttons[0]).toHaveTextContent("계정");

		fireEvent.click(buttons[0]);
		expect(onStepClick).toHaveBeenCalledWith(0, STEPS[0]);
	});

	it("renders no buttons at all without onStepClick", () => {
		render(<Stepper steps={STEPS} current={2} />);

		expect(screen.queryByRole("button")).toBeNull();
	});

	it("switches layout class with orientation", () => {
		const { container, rerender } = render(<Stepper steps={STEPS} current={0} />);
		expect(container.firstChild).toHaveClass("stepper_horizontal");

		rerender(<Stepper steps={STEPS} current={0} orientation="vertical" />);
		expect(container.firstChild).toHaveClass("stepper_vertical");
	});
});
