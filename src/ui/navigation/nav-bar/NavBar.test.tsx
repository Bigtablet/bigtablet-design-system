import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
