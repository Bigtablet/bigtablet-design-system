import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./index";

describe("Skeleton", () => {
	it("renders with default text variant", () => {
		const { container } = render(<Skeleton />);
		expect(container.firstChild).toHaveClass("skeleton");
		expect(container.firstChild).toHaveClass("skeleton_variant_text");
	});

	it("applies aria-hidden for screen reader skip", () => {
		const { container } = render(<Skeleton />);
		expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
	});

	it("applies variant class", () => {
		const { container } = render(<Skeleton variant="avatar" />);
		expect(container.firstChild).toHaveClass("skeleton_variant_avatar");
	});

	it("applies radius class when specified", () => {
		const { container } = render(<Skeleton radius="full" />);
		expect(container.firstChild).toHaveClass("skeleton_radius_full");
	});

	it("converts numeric width/height to px", () => {
		const { container } = render(<Skeleton width={120} height={40} />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.width).toBe("120px");
		expect(el.style.height).toBe("40px");
	});

	it("accepts string CSS values for width/height", () => {
		const { container } = render(<Skeleton width="50%" height="2rem" />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.width).toBe("50%");
		expect(el.style.height).toBe("2rem");
	});

	it("avatar variant mirrors width to height when height not specified", () => {
		const { container } = render(<Skeleton variant="avatar" width={48} />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.height).toBe("48px");
	});

	it("merges custom className", () => {
		const { container } = render(<Skeleton className="custom" />);
		expect(container.firstChild).toHaveClass("custom");
	});
});
