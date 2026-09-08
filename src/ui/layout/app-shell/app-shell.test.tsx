import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./index";

describe("AppShell", () => {
	it("puts the children in a main landmark", () => {
		// 본문이 landmark 가 아니면 스크린리더 사용자가 네비게이션을 건너뛸 수 없다.
		render(<AppShell>본문</AppShell>);

		expect(screen.getByRole("main")).toHaveTextContent("본문");
	});

	it("only makes a sidebar column when there is a sidebar", () => {
		// 열을 항상 만들면 사이드바 없는 화면에 빈 칸이 남는다.
		const { container, rerender } = render(<AppShell>본문</AppShell>);
		expect(container.querySelector(".app_shell_with_sidebar")).toBeNull();
		expect(container.querySelector(".app_shell_sidebar")).toBeNull();

		rerender(<AppShell sidebar={<nav>메뉴</nav>}>본문</AppShell>);
		expect(container.querySelector(".app_shell_with_sidebar")).not.toBeNull();
		expect(screen.getByRole("navigation")).toHaveTextContent("메뉴");
	});

	it("renders the header above the main content", () => {
		render(
			<AppShell header={<div>헤더</div>} sidebar={<nav>메뉴</nav>}>
				본문
			</AppShell>,
		);

		const body = screen.getByRole("main").parentElement;
		expect(body?.firstElementChild).toHaveClass("app_shell_header");
		expect(body?.lastElementChild).toHaveClass("app_shell_main");
	});

	it("drops its own padding when the screen brings its own", () => {
		const { container, rerender } = render(<AppShell>본문</AppShell>);
		expect(container.querySelector(".app_shell_main_padded")).not.toBeNull();

		rerender(<AppShell padded={false}>본문</AppShell>);
		expect(container.querySelector(".app_shell_main_padded")).toBeNull();
	});

	it("hands the root element to a ref", () => {
		// 형제 layout 프리미티브(Container·Grid·Section·Stack)가 모두 지원하는 규약이다.
		// 셸은 스크롤 계측·포털 기준점으로 루트가 필요할 수 있다.
		const ref = { current: null as HTMLDivElement | null };
		render(<AppShell ref={ref}>본문</AppShell>);

		expect(ref.current).toHaveClass("app_shell");
	});

	it("keeps the caller's className and attributes", () => {
		const { container } = render(
			<AppShell className="custom" data-testid="shell">
				본문
			</AppShell>,
		);

		const root = container.firstElementChild;
		expect(root).toHaveClass("app_shell", "custom");
		expect(root).toHaveAttribute("data-testid", "shell");
	});
});
