import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MediaCard } from "./index";

const IMG = { src: "/test.jpg", alt: "테스트 이미지" };

describe("MediaCard", () => {
	it("renders image with alt text", () => {
		render(<MediaCard image={IMG} heading="제목" />);
		const img = screen.getByRole("img", { name: "테스트 이미지" });
		expect(img).toHaveAttribute("src", "/test.jpg");
	});

	it("renders heading as h3 by default", () => {
		render(<MediaCard image={IMG} heading="제목" />);
		const heading = screen.getByRole("heading", { level: 3 });
		expect(heading).toHaveTextContent("제목");
	});

	it("renders heading as custom tag via headingAs", () => {
		render(<MediaCard image={IMG} heading="제목" headingAs="h2" />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("제목");
	});

	it("renders eyebrow", () => {
		render(<MediaCard image={IMG} eyebrow="NEW" heading="제목" />);
		expect(screen.getByText("NEW")).toBeInTheDocument();
	});

	it("renders meta", () => {
		render(<MediaCard image={IMG} heading="제목" meta="2026-05-19" />);
		expect(screen.getByText("2026-05-19")).toBeInTheDocument();
	});

	it("renders children content", () => {
		render(
			<MediaCard image={IMG} heading="제목">
				본문 내용
			</MediaCard>,
		);
		expect(screen.getByText("본문 내용")).toBeInTheDocument();
	});

	it("applies imagePosition class", () => {
		const { container } = render(<MediaCard image={IMG} imagePosition="overlay" heading="제목" />);
		expect(container.firstChild).toHaveClass("media_card_image_overlay");
	});

	it("applies clickable class", () => {
		const { container } = render(<MediaCard image={IMG} heading="제목" clickable />);
		expect(container.firstChild).toHaveClass("media_card_clickable");
	});

	it("applies aspectRatio inline style on image wrap", () => {
		const { container } = render(<MediaCard image={IMG} heading="제목" aspectRatio="16/9" />);
		const wrap = container.querySelector(".media_card_image_wrap") as HTMLElement;
		expect(wrap.style.aspectRatio).toBe("16/9");
	});

	it("applies bordered class", () => {
		const { container } = render(<MediaCard image={IMG} heading="제목" bordered />);
		expect(container.firstChild).toHaveClass("media_card_bordered");
	});
	it("is keyboard operable when it has an onClick", () => {
		// 커서와 hover 만 바꾸고 role·tabIndex·키 핸들러가 없으면, 마우스로는 눌리고
		// 키보드로는 도달조차 못 하는 컨트롤이 된다 (WCAG 2.1.1).
		const onClick = vi.fn();
		render(
			<MediaCard clickable image={{ src: "/a.png", alt: "" }} heading="공지" onClick={onClick} />,
		);

		const card = screen.getByRole("button");
		expect(card).toHaveAttribute("tabindex", "0");

		fireEvent.keyDown(card, { key: "Enter" });
		expect(onClick).toHaveBeenCalledTimes(1);

		fireEvent.keyDown(card, { key: " " });
		expect(onClick).toHaveBeenCalledTimes(2);
	});

	it("stays out of the tab order without an onClick", () => {
		// 겉모습만 바꾸는 prop 이 탭 정지를 만들면 아무 일도 안 하는 자리에 포커스가 선다.
		render(<MediaCard clickable image={{ src: "/a.png", alt: "" }} heading="공지" />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
