import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./index";

describe("Breadcrumb", () => {
	it("renders all items", () => {
		render(
			<Breadcrumb
				items={[
					{ label: "홈", href: "/" },
					{ label: "블로그", href: "/blog" },
					{ label: "글 제목" },
				]}
			/>,
		);
		expect(screen.getByText("홈")).toBeInTheDocument();
		expect(screen.getByText("블로그")).toBeInTheDocument();
		expect(screen.getByText("글 제목")).toBeInTheDocument();
	});

	it("marks last item with aria-current=page", () => {
		render(
			<Breadcrumb
				items={[
					{ label: "홈", href: "/" },
					{ label: "현재" },
				]}
			/>,
		);
		expect(screen.getByText("현재")).toHaveAttribute("aria-current", "page");
	});

	it("renders link for non-last items with href", () => {
		render(
			<Breadcrumb
				items={[
					{ label: "홈", href: "/home" },
					{ label: "current" },
				]}
			/>,
		);
		const link = screen.getByText("홈").closest("a");
		expect(link).toHaveAttribute("href", "/home");
	});

	it("calls onClick", () => {
		const onClick = vi.fn();
		render(
			<Breadcrumb
				items={[
					{ label: "Click me", onClick },
					{ label: "current" },
				]}
			/>,
		);
		fireEvent.click(screen.getByText("Click me"));
		expect(onClick).toHaveBeenCalled();
	});

	it("uses nav with aria-label", () => {
		render(<Breadcrumb items={[{ label: "Home" }]} />);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Breadcrumb");
	});
});
