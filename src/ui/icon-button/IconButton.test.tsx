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

		rerender(
			<IconButton variant="tonal" icon={<TestIcon />} aria-label="action" />,
		);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_tonal");

		rerender(
			<IconButton variant="outlined" icon={<TestIcon />} aria-label="action" />,
		);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_outlined");

		rerender(
			<IconButton variant="standard" icon={<TestIcon />} aria-label="action" />,
		);
		expect(screen.getByRole("button")).toHaveClass("icon_button_variant_standard");
	});

	it("renders with different sizes", () => {
		const { rerender } = render(
			<IconButton size="sm" icon={<TestIcon />} aria-label="action" />,
		);
		expect(screen.getByRole("button")).toHaveClass("icon_button_size_sm");

		rerender(
			<IconButton size="md" icon={<TestIcon />} aria-label="action" />,
		);
		expect(screen.getByRole("button")).toHaveClass("icon_button_size_md");
	});

	it("handles click events", () => {
		const handleClick = vi.fn();
		render(
			<IconButton icon={<TestIcon />} aria-label="action" onClick={handleClick} />,
		);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = vi.fn();
		render(
			<IconButton
				icon={<TestIcon />}
				aria-label="action"
				disabled
				onClick={handleClick}
			/>,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();

		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("applies custom className", () => {
		render(
			<IconButton
				icon={<TestIcon />}
				aria-label="action"
				className="custom-class"
			/>,
		);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});
});
