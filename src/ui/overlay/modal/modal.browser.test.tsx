import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { AlertProvider, useAlert } from "../../feedback/alert";
import "../../feedback/alert/style.scss";
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

// #982 - 포커스 트랩 구멍과 포커스 복귀를 실제 Chromium 에서 본다
describe("Modal focus trap (Chromium, #982)", () => {
	it("keeps Tab inside after a click on the title, and Shift+Tab from the panel wraps", async () => {
		render(
			<Modal open title="제목" footer={<button type="button">확인</button>}>
				<input aria-label="이름" />
			</Modal>,
		);
		await screen.findByRole("dialog");
		await userEvent.click(screen.getByRole("heading", { name: "제목" }));
		expect(document.querySelector(".modal_panel")?.contains(document.activeElement)).toBe(true);
		await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "확인" }));
		await userEvent.keyboard("{Tab}");
		expect(document.querySelector(".modal_panel")?.contains(document.activeElement)).toBe(true);
	});

	it("does not let Tab escape past a display:none last control", async () => {
		render(
			<Modal open title="제목">
				<input aria-label="이름" />
				<button type="button" style={{ display: "none" }}>
					숨김
				</button>
			</Modal>,
		);
		await screen.findByRole("dialog");
		const input = screen.getByRole("textbox", { name: "이름" });
		input.focus();
		await userEvent.keyboard("{Tab}");
		expect(document.querySelector(".modal_panel")?.contains(document.activeElement)).toBe(true);
	});

	it("returns focus to the trigger when a confirm callback closes the parent modal", async () => {
		function Screen() {
			const [open, setOpen] = React.useState(false);
			const { showAlert } = useAlert();
			return (
				<>
					<button type="button" onClick={() => setOpen(true)}>
						열기
					</button>
					<Modal open={open} onClose={() => setOpen(false)} title="편집">
						<button
							type="button"
							onClick={() => showAlert({ title: "닫을까요?", onConfirm: () => setOpen(false) })}
						>
							닫기 요청
						</button>
					</Modal>
				</>
			);
		}
		render(
			<AlertProvider>
				<Screen />
			</AlertProvider>,
		);
		const trigger = screen.getByRole("button", { name: "열기" });
		await userEvent.click(trigger);
		await userEvent.click(await screen.findByRole("button", { name: "닫기 요청" }));
		await userEvent.click(await screen.findByRole("button", { name: /확인|OK/ }));
		await waitFor(() => expect(document.querySelector(".modal")).toBeNull());
		expect(document.activeElement).toBe(trigger);
	});
});
