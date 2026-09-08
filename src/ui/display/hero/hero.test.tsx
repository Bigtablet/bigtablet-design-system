import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./index";

describe("Hero", () => {
	it("renders title as h1", () => {
		render(<Hero title="환영합니다" />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent("환영합니다");
	});

	it("renders subtitle", () => {
		render(<Hero title="제목" subtitle="부제목입니다" />);
		expect(screen.getByText("부제목입니다")).toBeInTheDocument();
	});

	it("renders eyebrow", () => {
		render(<Hero title="제목" eyebrow="CATEGORY" />);
		expect(screen.getByText("CATEGORY")).toBeInTheDocument();
	});

	it("renders CTA children in actions slot", () => {
		render(
			<Hero title="제목">
				<button type="button">CTA</button>
			</Hero>,
		);
		expect(screen.getByRole("button", { name: "CTA" })).toBeInTheDocument();
	});

	it("applies height class", () => {
		const { container } = render(<Hero title="제목" height="lg" />);
		expect(container.firstChild).toHaveClass("hero_height_lg");
	});

	it("applies align class", () => {
		const { container } = render(<Hero title="제목" align="center" />);
		expect(container.firstChild).toHaveClass("hero_align_center");
	});

	it("applies overlay class when overlay is set", () => {
		const { container } = render(<Hero title="제목" overlay="dark" />);
		expect(container.firstChild).toHaveClass("hero_overlay_dark");
	});

	it("auto sets inverse text color when overlay=dark", () => {
		const { container } = render(<Hero title="제목" overlay="dark" />);
		expect(container.firstChild).toHaveClass("hero_text_inverse");
	});

	it("sets backgroundImage as inline style", () => {
		const { container } = render(<Hero title="제목" backgroundImage="/banner.jpg" />);
		const el = container.firstChild as HTMLElement;
		expect(el.style.backgroundImage).toContain("/banner.jpg");
	});

	it("does not render content sections when not provided", () => {
		const { container } = render(<Hero />);
		expect(container.querySelector(".hero_title")).not.toBeInTheDocument();
		expect(container.querySelector(".hero_subtitle")).not.toBeInTheDocument();
		expect(container.querySelector(".hero_eyebrow")).not.toBeInTheDocument();
		expect(container.querySelector(".hero_actions")).not.toBeInTheDocument();
	});

	it("renders primaryAction with href as an anchor (Button as='a')", () => {
		render(<Hero title="제목" primaryAction={{ label: "자세히", href: "/detail" }} />);
		const link = screen.getByRole("link", { name: "자세히" });
		expect(link).toBeInstanceOf(HTMLAnchorElement);
		expect(link).toHaveAttribute("href", "/detail");
		expect(link).toHaveClass("button", "button_variant_filled", "button_size_lg");
	});

	it("renders primaryAction without href as a button", () => {
		render(<Hero title="제목" primaryAction={{ label: "클릭", onClick: () => {} }} />);
		expect(screen.getByRole("button", { name: "클릭" })).toBeInTheDocument();
	});
});
