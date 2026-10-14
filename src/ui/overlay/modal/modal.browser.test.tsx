import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Modal } from "./index";
import "./style.scss";

/** `role="dialog"` 는 화면 전체를 덮는 오버레이(`.modal`)에 있다 - 패널은 그 안의 `.modal_panel` */
const panelRect = () =>
	(document.querySelector(".modal_panel") as HTMLElement).getBoundingClientRect();

/** 그 점을 맨 위에서 칠하는 요소가 오버레이 안인가. 거터처럼 아무 요소도 없으면 null 이다. */
const isCoveredByOverlay = (x: number, y: number) =>
	Boolean(document.elementFromPoint(x, y)?.closest(".modal"));

describe("Modal layout (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("keeps the default 480px panel and its close button inside a 375px screen", async () => {
		await page.viewport(375, 667);
		render(
			<Modal open onClose={() => {}} title="제목">
				본문
			</Modal>,
		);
		await screen.findByRole("dialog");
		const panel = panelRect();
		const close = screen.getByRole("button", { name: /닫기|close/i }).getBoundingClientRect();
		expect(panel.left).toBeGreaterThanOrEqual(0);
		expect(panel.right).toBeLessThanOrEqual(375);
		expect(close.right).toBeLessThanOrEqual(panel.right);
		expect(close.left).toBeGreaterThanOrEqual(panel.left);
	});

	it("locks the page without shifting content and restores the scroll position", async () => {
		const Page = ({ open }: { open: boolean }) => (
			<>
				<div data-testid="content" style={{ height: 3000 }}>
					긴 페이지
				</div>
				<Modal open={open} onClose={() => {}} title="제목">
					본문
				</Modal>
			</>
		);
		const { rerender } = render(<Page open={false} />);
		window.scrollTo(0, 300);
		const before = screen.getByTestId("content").getBoundingClientRect();
		const layoutWidth = document.documentElement.clientWidth;

		rerender(<Page open />);
		await screen.findByRole("dialog");
		const panel = panelRect();
		const html = document.documentElement;
		expect(getComputedStyle(html).overflow).toBe("hidden");
		const during = screen.getByTestId("content").getBoundingClientRect();
		// 스크롤바가 사라진 자리만큼 padding 으로 메워 콘텐츠가 옆으로 움직이지 않는다
		expect(Math.abs(during.width - before.width)).toBeLessThan(1);
		expect(Math.abs(during.left - before.left)).toBeLessThan(1);
		// 오른쪽 끝(원래 스크롤바 자리)까지 오버레이가 덮는다 - 밝은 띠가 남지 않는다(#635)
		expect(isCoveredByOverlay(window.innerWidth - 1, 300)).toBe(true);
		// 오버레이가 스크롤바 자리까지 넓어져도 패널은 잠금 전 화면의 가운데에 남는다(#574)
		expect(Math.abs(panel.left + panel.width / 2 - layoutWidth / 2)).toBeLessThan(1);

		rerender(<Page open={false} />);
		await waitFor(() => expect(html).not.toHaveAttribute("data-bt-scroll-locked"));
		expect(window.scrollY).toBe(300);
		expect(html.style.overflow).toBe("");
		expect(document.body.style.paddingRight).toBe("");
	});

	it("covers a gutter the app reserved with scrollbar-gutter: stable (#635)", async () => {
		const html = document.documentElement;
		html.style.scrollbarGutter = "stable";
		try {
			// 스크롤이 없는 짧은 페이지라도 거터 자리는 비어 있다 - 잠금이 그 자리를 풀어야 덮인다
			render(
				<Modal open onClose={() => {}} title="제목">
					본문
				</Modal>,
			);
			await screen.findByRole("dialog");
			expect(isCoveredByOverlay(window.innerWidth - 1, 300)).toBe(true);
		} finally {
			html.style.scrollbarGutter = "";
		}
	});
});
