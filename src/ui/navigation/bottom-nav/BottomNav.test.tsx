import { fireEvent, render, screen } from "@testing-library/react";
import { Bell, Home, ShoppingCart } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { BottomNav, BottomNavItem, BottomNavSpacer } from "./index";

/** Next.js `Link` 대역. 라우터 링크는 결국 `<a>` 를 렌더하는 컴포넌트다. */
const RouterLink = ({
	href,
	children,
	...rest
}: {
	href: string;
	children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
	<a data-router="true" href={href} {...rest}>
		{children}
	</a>
);

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

	it("disabled prop on anchor - aria-disabled + tabIndex -1 + click blocked", () => {
		const onClick = vi.fn();
		render(
			<BottomNav>
				<BottomNavItem
					as="a"
					href="/orders"
					icon={<Home />}
					label="주문"
					disabled
					onClick={onClick}
				/>
			</BottomNav>,
		);
		const link = screen.getByRole("link", { name: "주문" });
		expect(link).toHaveAttribute("aria-disabled", "true");
		expect(link).toHaveAttribute("tabindex", "-1");
		fireEvent.click(link);
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

	it("renders a component given to as", () => {
		render(<BottomNavItem as={RouterLink} href="/home" icon={<span />} label="홈" active />);

		const link = screen.getByRole("link", { name: /홈/ });
		expect(link).toHaveAttribute("data-router", "true");
		expect(link).toHaveAttribute("aria-current", "page");
	});

	it("blocks a disabled component link without native disabled", () => {
		const onClick = vi.fn();
		render(
			<BottomNavItem
				as={RouterLink}
				href="/home"
				icon={<span />}
				label="홈"
				disabled
				onClick={onClick}
			/>,
		);

		const link = screen.getByRole("link", { name: /홈/ });
		expect(link).toHaveAttribute("aria-disabled", "true");
		expect(link).not.toHaveAttribute("disabled");

		fireEvent.click(link);
		expect(onClick).not.toHaveBeenCalled();
	});

	// 타입 레벨 회귀 방지 - `as="a"` 는 `href` 를 요구해야 한다(판별 유니온 시절 계약).
	// 아래 무시 지시자가 "불필요"로 판정되면 tsc 가 실패하므로 이 단언은 tsc 가 검증한다.
	it("requires href when as is a at the type level", () => {
		// @ts-expect-error - `as="a"` 에 href 가 없으면 타입 에러여야 한다.
		const hrefless = <BottomNavItem as="a" icon={<Home />} label="주문" />;
		expect(hrefless).toBeTruthy();
	});

	it("stops a disabled click from reaching an ancestor", () => {
		const onAncestorClick = vi.fn();
		render(
			// biome-ignore lint/a11y/useKeyWithClickEvents: 전파를 보려면 상위 클릭 대상이 필요하다
			<div onClick={onAncestorClick}>
				<BottomNavItem as={RouterLink} href="/home" icon={<span />} label="홈" disabled />
			</div>,
		);

		fireEvent.click(screen.getByRole("link", { name: /홈/ }));
		expect(onAncestorClick).not.toHaveBeenCalled();
	});
});
