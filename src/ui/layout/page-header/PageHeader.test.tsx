import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./index";

describe("PageHeader", () => {
	it("renders the title as the page's h1", () => {
		// 화면의 제목이다. h2 로 두면 문서에 h1 이 없어 개요 탐색이 끊긴다.
		render(<PageHeader title="주문 관리" />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("주문 관리");
	});

	it("adds no second banner landmark", () => {
		// <header> 는 <main> 안에 있어도 banner 다 - main 은 sectioning content 가 아니다.
		// NavBar 가 이미 <header> 라, PageHeader 까지 <header> 면 banner 가 둘이 된다.
		render(
			<>
				<header>NavBar 자리</header>
				<main>
					<PageHeader title="주문 관리" />
				</main>
			</>,
		);

		expect(screen.getAllByRole("banner")).toHaveLength(1);
	});

	it("shows only the slots it was given", () => {
		const { container, rerender } = render(<PageHeader title="주문" />);
		expect(container.querySelector(".page_header_description")).toBeNull();
		expect(container.querySelector(".page_header_breadcrumb")).toBeNull();
		expect(container.querySelector(".page_header_actions")).toBeNull();
		expect(container.querySelector(".page_header_tabs")).toBeNull();

		rerender(
			<PageHeader
				title="주문"
				description="최근 30일"
				breadcrumb={<nav aria-label="경로">홈</nav>}
				actions={<button type="button">추가</button>}
				tabs={<div role="tablist">탭</div>}
			/>,
		);
		expect(screen.getByText("최근 30일")).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "경로" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
		expect(screen.getByRole("tablist")).toBeInTheDocument();
	});

	it("keeps the caller's className", () => {
		const { container } = render(<PageHeader title="주문" className="custom" />);

		expect(container.firstElementChild).toHaveClass("page_header", "custom");
	});
});
