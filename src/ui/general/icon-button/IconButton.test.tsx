import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./index";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("IconButton", () => {
	it("renders with default props", () => {
		render(<IconButton icon={<TestIcon />} aria-label="action" />);
		const button = screen.getByRole("button", { name: "action" });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass(
			"icon_button",
			"icon_button_variant_standard",
			"icon_button_size_md",
		);
	});

	it("renders the icon", () => {
		render(<IconButton icon={<TestIcon />} aria-label="action" />);
		expect(screen.getByTestId("test-icon")).toBeInTheDocument();
	});

	it("renders with different variants", () => {
		const { rerender } = render(
			<IconButton variant="filled" icon={<TestIcon />} aria-label="action" />,
		);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_filled");

		rerender(<IconButton variant="tonal" icon={<TestIcon />} aria-label="action" />);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_tonal");

		rerender(<IconButton variant="outlined" icon={<TestIcon />} aria-label="action" />);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_outlined");

		rerender(<IconButton variant="standard" icon={<TestIcon />} aria-label="action" />);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_standard");
	});

	it("renders with different sizes", () => {
		const { rerender } = render(<IconButton size="sm" icon={<TestIcon />} aria-label="action" />);
		expect(screen.getByRole("button")).toHaveClass("icon_button_size_sm");

		rerender(<IconButton size="md" icon={<TestIcon />} aria-label="action" />);
		expect(screen.getByRole("button")).toHaveClass("icon_button_size_md");
	});

	it("handles click events", () => {
		const handleClick = vi.fn();
		render(<IconButton icon={<TestIcon />} aria-label="action" onClick={handleClick} />);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = vi.fn();
		render(<IconButton icon={<TestIcon />} aria-label="action" disabled onClick={handleClick} />);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();

		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("applies custom className", () => {
		render(<IconButton icon={<TestIcon />} aria-label="action" className="custom-class" />);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});

	it("forwards ref to the root element", () => {
		let node: HTMLButtonElement | null = null;
		render(<IconButton icon={<i />} aria-label="x" ref={(el) => { node = el; }} />);
		expect(node).toBeInstanceOf(HTMLButtonElement);
	});

	describe("accessible name", () => {
		it("accepts aria-labelledby instead of aria-label", () => {
			render(
				<>
					<span id="icon-button-label">저장</span>
					<IconButton icon={<TestIcon />} aria-labelledby="icon-button-label" />
				</>,
			);
			expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
		});

		it("keeps the icon hidden from the accessibility tree", () => {
			render(<IconButton icon={<TestIcon />} aria-label="action" />);
			expect(screen.getByTestId("test-icon").parentElement).toHaveAttribute("aria-hidden", "true");
		});

		// 타입 레벨 회귀 방지 - 접근성 이름 없는 IconButton 은 컴파일되면 안 된다.
		// 아래 무시 지시자가 "불필요"로 판정되면 tsc 가 실패하므로 이 단언은 tsc 가 검증한다.
		it("requires aria-label or aria-labelledby at the type level", () => {
			// @ts-expect-error - aria-label / aria-labelledby 둘 다 없으면 타입 에러여야 한다.
			const nameless = <IconButton icon={<TestIcon />} />;
			expect(nameless).toBeTruthy();
		});
	});
});
