import { fireEvent, render, screen } from "@testing-library/react";
import { Bell, Home, ShoppingCart } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { BottomNav, BottomNavItem, BottomNavSpacer } from "./index";

describe("BottomNav", () => {
	it("renders nav with aria-label", () => {
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="홈" />
			</BottomNav>,
		);
		expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
	});

	it("custom aria-label", () => {
		render(
			<BottomNav ariaLabel="하단 네비">
				<BottomNavItem icon={<Home />} label="홈" />
			</BottomNav>,
		);
		expect(screen.getByRole("navigation", { name: "하단 네비" })).toBeInTheDocument();
	});

	it("renders items with icon + label", () => {
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="주문" />
				<BottomNavItem icon={<ShoppingCart />} label="매출" />
			</BottomNav>,
		);
		expect(screen.getByRole("button", { name: "주문" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "매출" })).toBeInTheDocument();
	});

	it("applies aria-current=page on active item", () => {
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="주문" active />
				<BottomNavItem icon={<ShoppingCart />} label="매출" />
			</BottomNav>,
		);
		expect(screen.getByRole("button", { name: "주문" })).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("button", { name: "매출" })).not.toHaveAttribute("aria-current");
	});

	it("calls onClick when item clicked", () => {
		const onClick = vi.fn();
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="주문" onClick={onClick} />
			</BottomNav>,
		);
		fireEvent.click(screen.getByRole("button", { name: "주문" }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("renders as anchor when as='a' and href provided", () => {
		render(
			<BottomNav>
				<BottomNavItem as="a" href="/orders" icon={<Home />} label="주문" />
			</BottomNav>,
		);
		const link = screen.getByRole("link", { name: "주문" });
		expect(link).toHaveAttribute("href", "/orders");
	});

	it("renders badge when provided", () => {
		render(
			<BottomNav>
				<BottomNavItem icon={<Bell />} label="알림" badge={<span data-testid="dot">●</span>} />
			</BottomNav>,
		);
		expect(screen.getByTestId("dot")).toBeInTheDocument();
	});

	it("active item has active class", () => {
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="주문" active />
			</BottomNav>,
		);
		expect(screen.getByRole("button", { name: "주문" })).toHaveClass("bottom_nav_item_active");
	});

	it("button type defaults to 'button'", () => {
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="주문" />
			</BottomNav>,
		);
		expect(screen.getByRole("button", { name: "주문" })).toHaveAttribute("type", "button");
	});

	it("disabled prop disables button", () => {
		const onClick = vi.fn();
		render(
			<BottomNav>
				<BottomNavItem icon={<Home />} label="주문" disabled onClick={onClick} />
			</BottomNav>,
		);
		const btn = screen.getByRole("button", { name: "주문" });
		expect(btn).toBeDisabled();
		fireEvent.click(btn);
		expect(onClick).not.toHaveBeenCalled();
	});

	it("passes additional props through (data attribute)", () => {
		render(
			<BottomNav data-testid="nav">
				<BottomNavItem icon={<Home />} label="주문" data-key="orders" />
			</BottomNav>,
		);
		expect(screen.getByTestId("nav")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "주문" })).toHaveAttribute("data-key", "orders");
	});
});

describe("BottomNavSpacer", () => {
	it("renders an aria-hidden div with spacer class", () => {
		const { container } = render(<BottomNavSpacer />);
		const spacer = container.firstChild as HTMLElement;
		expect(spacer).toHaveClass("bottom_nav_spacer");
		expect(spacer).toHaveAttribute("aria-hidden", "true");
	});

	it("accepts className", () => {
		const { container } = render(<BottomNavSpacer className="extra" />);
		expect(container.firstChild).toHaveClass("bottom_nav_spacer", "extra");
	});
});
