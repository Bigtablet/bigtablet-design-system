import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./index";

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

describe("Button", () => {
	it("renders with default props", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: "Click me" });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass("button", "button_variant_filled", "button_size_md");
	});

	it("renders with different variants", () => {
		const { rerender } = render(<Button variant="tonal">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_variant_tonal");

		rerender(<Button variant="outline">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_variant_outline");

		rerender(<Button variant="text">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_variant_text");
	});

	it("renders with different sizes", () => {
		const { rerender } = render(<Button size="sm">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_size_sm");

		rerender(<Button size="xl">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_size_xl");
	});

	it("renders with leading and trailing icons", () => {
		render(
			<Button leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
				Button
			</Button>,
		);

		expect(screen.getByTestId("lead")).toBeInTheDocument();
		expect(screen.getByTestId("trail")).toBeInTheDocument();
	});

	it("handles click events", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Click me
			</Button>,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();

		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("applies custom className", () => {
		render(<Button className="custom-class">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});

	it("applies fullWidth", () => {
		render(<Button fullWidth>Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("button_full_width");
	});

	it("does not apply fullWidth by default", () => {
		render(<Button>Button</Button>);
		expect(screen.getByRole("button")).not.toHaveClass("button_full_width");
	});

	it("forwards ref to the root element", () => {
		let node: HTMLButtonElement | null = null;
		render(
			<Button
				ref={(el) => {
					node = el;
				}}
			>
				X
			</Button>,
		);
		expect(node).toBeInstanceOf(HTMLButtonElement);
	});

	describe("danger × variant (orthogonal)", () => {
		const variants = ["filled", "tonal", "outline", "text"] as const;

		it.each(variants)("emits button_danger alongside button_variant_%s", (variant) => {
			render(
				<Button variant={variant} danger>
					Delete
				</Button>,
			);
			expect(screen.getByRole("button")).toHaveClass(`button_variant_${variant}`, "button_danger");
		});

		it("falls back to the filled variant when danger is set without a variant", () => {
			render(<Button danger>Delete</Button>);
			expect(screen.getByRole("button")).toHaveClass("button_variant_filled", "button_danger");
		});

		it("does not emit button_danger by default", () => {
			render(<Button variant="outline">Button</Button>);
			expect(screen.getByRole("button")).not.toHaveClass("button_danger");
		});
	});

	it("renders a button element (not anchor) by default", () => {
		const { container } = render(<Button>Button</Button>);
		expect(container.querySelector("button")).toBeInTheDocument();
		expect(container.querySelector("a")).not.toBeInTheDocument();
	});

	describe("as anchor", () => {
		it("renders an <a href> with role=link when as='a'", () => {
			render(
				<Button as="a" href="/next">
					Go
				</Button>,
			);
			const link = screen.getByRole("link", { name: "Go" });
			expect(link).toBeInstanceOf(HTMLAnchorElement);
			expect(link).toHaveAttribute("href", "/next");
			expect(link).toHaveClass("button", "button_variant_filled", "button_size_md");
		});

		it("does not set a type attribute on the anchor", () => {
			render(
				<Button as="a" href="/x">
					Go
				</Button>,
			);
			expect(screen.getByRole("link")).not.toHaveAttribute("type");
		});

		it("applies variant/size/danger/fullWidth/radius classes to the anchor", () => {
			render(
				<Button as="a" href="/x" variant="outline" size="lg" danger fullWidth radius="sm">
					Go
				</Button>,
			);
			expect(screen.getByRole("link")).toHaveClass(
				"button",
				"button_variant_outline",
				"button_size_lg",
				"button_danger",
				"button_full_width",
				"button_radius_sm",
			);
		});

		it("renders leading and trailing icons in the anchor", () => {
			render(
				<Button
					as="a"
					href="/x"
					leadingIcon={<svg data-testid="lead" />}
					trailingIcon={<svg data-testid="trail" />}
				>
					Go
				</Button>,
			);
			expect(screen.getByTestId("lead")).toBeInTheDocument();
			expect(screen.getByTestId("trail")).toBeInTheDocument();
			expect(screen.getByRole("link").querySelector(".button_label")).toHaveTextContent("Go");
		});

		it("passes target and rel through to the anchor", () => {
			render(
				<Button as="a" href="https://x.com" target="_blank" rel="noopener noreferrer">
					Go
				</Button>,
			);
			const link = screen.getByRole("link");
			expect(link).toHaveAttribute("target", "_blank");
			expect(link).toHaveAttribute("rel", "noopener noreferrer");
		});

		it("applies custom className alongside base classes on the anchor", () => {
			render(
				<Button as="a" href="/x" className="custom-class">
					Go
				</Button>,
			);
			expect(screen.getByRole("link")).toHaveClass("button", "custom-class");
		});

		it("handles click events on the anchor", () => {
			const handleClick = vi.fn();
			render(
				<Button as="a" href="/x" onClick={handleClick}>
					Go
				</Button>,
			);
			fireEvent.click(screen.getByRole("link"));
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it("forwards ref to the anchor element", () => {
			let node: HTMLAnchorElement | null = null;
			render(
				<Button
					as="a"
					href="/x"
					ref={(el) => {
						node = el;
					}}
				>
					Go
				</Button>,
			);
			expect(node).toBeInstanceOf(HTMLAnchorElement);
		});

		it("renders as an anchor when only href is given (no as)", () => {
			render(<Button href="/only-href">Link</Button>);
			const link = screen.getByRole("link", { name: "Link" });
			expect(link).toHaveAttribute("href", "/only-href");
			expect(link).toHaveClass("button");
		});

		it("disables the anchor via aria-disabled + tabIndex and blocks click (BottomNavItem pattern)", () => {
			const handleClick = vi.fn();
			render(
				<Button as="a" href="/x" disabled onClick={handleClick}>
					Go
				</Button>,
			);
			const link = screen.getByRole("link", { name: "Go" });
			expect(link).toHaveAttribute("aria-disabled", "true");
			expect(link).toHaveAttribute("tabindex", "-1");
			expect(link).toHaveClass("button_disabled");
			// href 는 유지(link 시맨틱)하되 클릭 내비게이션은 preventDefault 로 차단
			const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
			link.dispatchEvent(clickEvent);
			expect(handleClick).not.toHaveBeenCalled();
			expect(clickEvent.defaultPrevented).toBe(true);
		});
	});

	it("renders a component given to as", () => {
		// 리터럴 유니온이었을 때는 이게 불가능해, Next 앱이 DS 를 우회해 자기 버튼을 만들었다.
		render(
			<Button as={RouterLink} href="/orders">
				주문
			</Button>,
		);

		const link = screen.getByRole("link", { name: "주문" });
		expect(link).toHaveAttribute("data-router", "true");
		expect(link).toHaveAttribute("href", "/orders");
		expect(link).toHaveClass("button");
	});

	it("does not hand native disabled to a non-button element", () => {
		// anchor·커스텀 컴포넌트에는 native disabled 가 없다. 그냥 넘기면 조용히 무시되고
		// 비활성 버튼이 눌린다.
		const onClick = vi.fn();
		render(
			<Button as={RouterLink} href="/orders" disabled onClick={onClick}>
				주문
			</Button>,
		);

		const link = screen.getByRole("link", { name: "주문" });
		expect(link).toHaveAttribute("aria-disabled", "true");
		expect(link).toHaveAttribute("tabindex", "-1");
		expect(link).not.toHaveAttribute("disabled");

		fireEvent.click(link);
		expect(onClick).not.toHaveBeenCalled();
	});

	it("drops href when as says button", () => {
		// `<button href>` 는 유효하지 않은 HTML 이다.
		render(
			<Button as="button" href="/orders">
				주문
			</Button>,
		);

		expect(screen.getByRole("button", { name: "주문" })).not.toHaveAttribute("href");
	});

	// 타입 레벨 회귀 방지 - `as="a"` 는 `href` 를 요구해야 한다(판별 유니온 시절 계약).
	// 아래 무시 지시자가 "불필요"로 판정되면 tsc 가 실패하므로 이 단언은 tsc 가 검증한다.
	it("requires href when as is a at the type level", () => {
		// @ts-expect-error - `as="a"` 에 href 가 없으면 타입 에러여야 한다.
		const hrefless = <Button as="a">주문</Button>;
		expect(hrefless).toBeTruthy();
	});
});
