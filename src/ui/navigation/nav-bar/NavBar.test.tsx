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
			expect(screen.getAllByRole("menuitemradio")).toHaveLength(2);
		});

		it("calls onChange and closes on option select", () => {
			const onChange = vi.fn();
			render(<NavBar locale={makeLocale(onChange)} />);
			fireEvent.click(screen.getByRole("button"));
			fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
			expect(onChange).toHaveBeenCalledWith("en");
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});

		it("focuses first item on open and moves with ArrowDown", () => {
			render(<NavBar locale={makeLocale()} />);
			fireEvent.click(screen.getByRole("button"));
			const items = screen.getAllByRole("menuitemradio");
			expect(items[0]).toHaveFocus();
			fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
			expect(items[1]).toHaveFocus();
		});

		it("trigger has an accessible name matching the visible label", () => {
			render(<NavBar locale={makeLocale()} />);
			expect(screen.getByRole("button", { name: "한국어" })).toBeInTheDocument();
		});

		it("trigger keeps an accessible name when hideLabel hides the text", () => {
			render(<NavBar locale={{ ...makeLocale(), hideLabel: true }} />);
			const trigger = screen.getByRole("button", { name: "한국어" });
			// 라벨 텍스트는 렌더되지 않지만 접근성 이름은 남아 있어야 한다.
			expect(trigger).toHaveTextContent("");
			expect(trigger).toHaveAttribute("aria-label", "한국어");
		});

		it("falls back to the uppercased current code when no option matches", () => {
			render(<NavBar locale={{ current: "ja", options: [], hideLabel: true }} />);
			expect(screen.getByRole("button", { name: "JA" })).toBeInTheDocument();
		});

		it("ariaLabel overrides the derived accessible name", () => {
			render(<NavBar locale={{ ...makeLocale(), hideLabel: true, ariaLabel: "언어 선택" }} />);
			expect(screen.getByRole("button", { name: "언어 선택" })).toBeInTheDocument();
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
		fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
		expect(onValueChange).toHaveBeenCalledWith("en");
	});

	it("LocaleSwitcher prefers onValueChange over the deprecated onChange when both are given", () => {
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		render(
			<NavBar
				locale={{
					current: "ko",
					options: [
						{ value: "ko", label: "한국어" },
						{ value: "en", label: "English" },
					],
					onValueChange,
					onChange,
				}}
			/>,
		);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("en");
		expect(onChange).not.toHaveBeenCalled();
	});

});
