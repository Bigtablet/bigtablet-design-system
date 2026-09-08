import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./index";

describe("Breadcrumb", () => {
	it("renders a link item through `as` so a router Link can take over", () => {
		// `onClick` 우회로는 수정자 클릭(cmd/ctrl/shift)과 새 탭 열기가 죽는다 - 소비처가
		// 라우터 Link 를 그대로 끼울 수 있어야 한다(#588).
		const Link = ({ href, children, ...rest }: { href?: string; children?: React.ReactNode }) => (
			<a data-testid="router-link" href={href} {...rest}>
				{children}
			</a>
		);

		render(<Breadcrumb items={[{ label: "홈", href: "/", as: Link }, { label: "현재" }]} />);

		const link = screen.getByTestId("router-link");
		expect(link).toHaveAttribute("href", "/");
		expect(link).toHaveClass("breadcrumb_link");
		expect(link).toHaveTextContent("홈");
	});

	it("ignores `as` on the current page - it is not a link", () => {
		const Link = () => <a data-testid="router-link" href="/x" />;

		render(
			<Breadcrumb
				items={[
					{ label: "홈", href: "/" },
					{ label: "현재", as: Link },
				]}
			/>,
		);

		expect(screen.queryByTestId("router-link")).toBeNull();
		expect(screen.getByText("현재")).toHaveAttribute("aria-current", "page");
	});

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
		render(<Breadcrumb items={[{ label: "홈", href: "/" }, { label: "현재" }]} />);
		expect(screen.getByText("현재")).toHaveAttribute("aria-current", "page");
	});

	it("renders link for non-last items with href", () => {
		render(<Breadcrumb items={[{ label: "홈", href: "/home" }, { label: "current" }]} />);
		const link = screen.getByText("홈").closest("a");
		expect(link).toHaveAttribute("href", "/home");
	});

	it("calls onClick", () => {
		const onClick = vi.fn();
		render(<Breadcrumb items={[{ label: "Click me", onClick }, { label: "current" }]} />);
		fireEvent.click(screen.getByText("Click me"));
		expect(onClick).toHaveBeenCalled();
	});

	it("uses nav with aria-label", () => {
		render(<Breadcrumb items={[{ label: "Home" }]} />);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "현재 위치");
	});

	// <nav> 랜드마크 이름은 스크린리더의 리전 목록에 그대로 뜬다. 이전엔 영문 하드코딩이었다.
	it("lets the app override the nav landmark name", () => {
		render(
			<Breadcrumb items={[{ label: "홈", href: "/" }, { label: "상세" }]} navLabel="Breadcrumb" />,
		);
		expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Breadcrumb");
	});
});
