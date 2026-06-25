import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavBar, NavLink } from "./index";

describe("NavBar", () => {
	it("renders brand, links, and actions", () => {
		render(
			<NavBar brand={<div>Bigtablet</div>} actions={<button type="button">Sign in</button>}>
				<NavLink href="/about">About</NavLink>
				<NavLink href="/blog">Blog</NavLink>
			</NavBar>,
		);
		expect(screen.getByText("Bigtablet")).toBeInTheDocument();
		expect(screen.getByText("Sign in")).toBeInTheDocument();
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByText("Blog")).toBeInTheDocument();
	});

	it("marks active link with aria-current=page", () => {
		render(
			<NavBar>
				<NavLink href="/about" active>
					About
				</NavLink>
			</NavBar>,
		);
		expect(screen.getByText("About")).toHaveAttribute("aria-current", "page");
	});

	it("applies variant class", () => {
		const { container } = render(<NavBar variant="accent">test</NavBar>);
		expect(container.firstChild).toHaveClass("nav_bar_variant_accent");
	});

	it("applies sticky class", () => {
		const { container } = render(<NavBar sticky>test</NavBar>);
		expect(container.firstChild).toHaveClass("nav_bar_sticky");
	});

	describe("LocaleSwitcher", () => {
		const makeLocale = (onChange = vi.fn()) => ({
			current: "ko",
			options: [
				{ value: "ko", label: "한국어" },
				{ value: "en", label: "English" },
			],
			onChange,
		});

		it("opens menu with options on trigger click", () => {
			render(<NavBar locale={makeLocale()} />);
			fireEvent.click(screen.getByRole("button"));
			expect(screen.getByRole("menu")).toBeInTheDocument();
			expect(screen.getAllByRole("menuitem")).toHaveLength(2);
		});

		it("calls onChange and closes on option select", () => {
			const onChange = vi.fn();
			render(<NavBar locale={makeLocale(onChange)} />);
			fireEvent.click(screen.getByRole("button"));
			fireEvent.click(screen.getByRole("menuitem", { name: "English" }));
			expect(onChange).toHaveBeenCalledWith("en");
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});

		it("focuses first item on open and moves with ArrowDown", () => {
			render(<NavBar locale={makeLocale()} />);
			fireEvent.click(screen.getByRole("button"));
			const items = screen.getAllByRole("menuitem");
			expect(items[0]).toHaveFocus();
			fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
			expect(items[1]).toHaveFocus();
		});

		it("Escape closes and returns focus to the trigger", () => {
			render(<NavBar locale={makeLocale()} />);
			const trigger = screen.getByRole("button");
			fireEvent.click(trigger);
			fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
			expect(trigger).toHaveFocus();
		});
	});


	it("LocaleSwitcher calls onValueChange (canonical) on select", () => {
		const onValueChange = vi.fn();
		render(
			<NavBar
				locale={{
					current: "ko",
					options: [
						{ value: "ko", label: "한국어" },
						{ value: "en", label: "English" },
					],
					onValueChange,
				}}
			/>,
		);
		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByRole("menuitem", { name: "English" }));
		expect(onValueChange).toHaveBeenCalledWith("en");
	});

});
