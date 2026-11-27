import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { AlertProvider, useAlert } from "../../feedback/alert";
import "../../feedback/alert/style.scss";
import { Modal, ModalStep, ModalSteps } from "./index";
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

	// 내용이 늘어도 윗변은 제자리, 아래로만 자란다 (#1157) - 가운데 정렬이면 늘어난 만큼 절반씩 위로 튀었다
	it("keeps the panel top in place when its content grows (#1157)", async () => {
		await page.viewport(1024, 940);
		const { rerender } = render(
			<Modal open onClose={() => {}} title="기기 등록">
				본문
			</Modal>,
		);
		await screen.findByRole("dialog");
		const before = panelRect();
		// 15vh = 141px 은 상한 128px 에서 멈춘다
		expect(before.top).toBe(128);

		rerender(
			<Modal open onClose={() => {}} title="기기 등록">
				<p>본문</p>
				<p style={{ height: 120 }}>이름을 입력하세요</p>
			</Modal>,
		);
		const after = panelRect();
		expect(after.height).toBeGreaterThan(before.height + 100);
		expect(after.top).toBe(before.top);
	});

	it("caps a long panel below the top offset and scrolls its body", async () => {
		await page.viewport(800, 600);
		render(
			<Modal open onClose={() => {}} title="긴 내용">
				<div style={{ height: 2000 }}>본문</div>
			</Modal>,
		);
		await screen.findByRole("dialog");
		const panel = panelRect();
		// 15vh = 90px 위, 32px 아래
		expect(panel.top).toBe(90);
		expect(panel.bottom).toBe(600 - 32);
		const body = document.querySelector(".modal_body") as HTMLElement;
		expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
	});

	// 소비 앱은 대개 `* { box-sizing: border-box }` 를 건다. 패널이 호스트의 box-sizing 을 그대로 받으면
	// max-height 식이 안쪽 여백을 한 번 더 빼서 아래에 32px 가 아니라 96px 가 남았다
	it("leaves the same 32px below a long panel when the host resets box-sizing", async () => {
		await page.viewport(800, 600);
		const reset = document.createElement("style");
		reset.textContent = "*, *::before, *::after { box-sizing: border-box; }";
		document.head.appendChild(reset);
		try {
			render(
				<Modal open onClose={() => {}} title="긴 내용">
					<div style={{ height: 2000 }}>본문</div>
				</Modal>,
			);
			await screen.findByRole("dialog");
			const panel = panelRect();
			expect(panel.top).toBe(90);
			expect(panel.bottom).toBe(600 - 32);
		} finally {
			reset.remove();
		}
	});

	// 스크롤 영역(&_body) 밖의 슬롯만으로 상한을 넘으면 딤을 스크롤해 footer 에 닿는다
	it("lets the overlay scroll to a footer pushed out by a tall description", async () => {
		await page.viewport(800, 600);
		render(
			<Modal
				open
				onClose={() => {}}
				title="긴 설명"
				description={<div style={{ height: 440 }}>설명</div>}
				footer={<button type="button">확인</button>}
			/>,
		);
		await screen.findByRole("dialog");
		const overlay = document.querySelector(".modal") as HTMLElement;
		overlay.scrollTop = overlay.scrollHeight;
		const ok = screen.getByRole("button", { name: "확인" }).getBoundingClientRect();
		expect(ok.bottom).toBeLessThanOrEqual(600);
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

	// #1043 - html 과 body 를 함께 hidden 으로 잠그면 body 가 새 스크롤 상자가 되어, 스크롤해 둔
	// 페이지의 sticky 헤더가 스크롤되지 않는 body 를 기준으로 붙어 화면 위로 밀려났다
	it.each([
		["no reset", ""],
		["body { overflow-x: hidden } reset", "hidden"],
	])("keeps a sticky header in place while locked (%s)", async (_, bodyOverflowX) => {
		document.body.style.overflowX = bodyOverflowX;
		try {
			const Page = ({ open }: { open: boolean }) => (
				<>
					<header data-testid="sticky" style={{ position: "sticky", top: 0, height: 48 }}>
						헤더
					</header>
					<div style={{ height: 3000 }}>긴 페이지</div>
					<Modal open={open} onClose={() => {}} title="제목">
						본문
					</Modal>
				</>
			);
			const { rerender } = render(<Page open={false} />);
			window.scrollTo(0, 900);
			expect(screen.getByTestId("sticky").getBoundingClientRect().top).toBe(0);

			rerender(<Page open />);
			await screen.findByRole("dialog");
			expect(screen.getByTestId("sticky").getBoundingClientRect().top).toBe(0);
			expect(window.scrollY).toBe(900);
		} finally {
			document.body.style.overflowX = "";
		}
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

// 같은 모달 안에서 단계를 바꿀 때 높이가 이어지고, 전환 중 본문에 스크롤바가 생기지 않는다 (#1162)
describe("ModalSteps transition (Chromium, #1162)", () => {
	function Wizard({ step }: { step: string }) {
		return (
			<Modal open onClose={() => {}} title="기기 등록">
				<ModalSteps active={step}>
					<ModalStep name="form">
						<input aria-label="이름" />
					</ModalStep>
					<ModalStep name="verify">
						<input aria-label="인증 번호" />
						<div style={{ height: 160 }} />
					</ModalStep>
				</ModalSteps>
			</Modal>
		);
	}

	it("eases the panel height, keeps the body free of a scrollbar, then returns to auto", async () => {
		await page.viewport(1024, 940);
		const { rerender } = render(<Wizard step="form" />);
		await screen.findByRole("dialog");
		const panel = document.querySelector(".modal_panel") as HTMLElement;
		const body = document.querySelector(".modal_body") as HTMLElement;
		// ResizeObserver 가 처음 높이를 잴 틈
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		const before = panel.getBoundingClientRect().height;
		const top = panel.getBoundingClientRect().top;

		rerender(<Wizard step="verify" />);
		await new Promise((r) => setTimeout(r, 60));
		const during = panel.getBoundingClientRect().height;
		expect(during).toBeGreaterThan(before);
		expect(panel.style.overflow).toBe("hidden");
		expect(body.offsetWidth - body.clientWidth).toBe(0);
		expect(panel.getBoundingClientRect().top).toBe(top);

		await expect.poll(() => panel.getAnimations().length).toBe(0);
		await expect.poll(() => panel.style.overflow).toBe("");
		const after = panel.getBoundingClientRect().height;
		// 중간값을 지나 끝 높이에 닿는다 - 끝 높이를 넘었다가 툭 줄지 않는다
		expect(during).toBeLessThan(after);
		expect(after - before).toBeCloseTo(160, 0);
	});
});
