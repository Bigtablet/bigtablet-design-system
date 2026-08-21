import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./index";

describe("Modal", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("renders without motion when prefers-reduced-motion is set", () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: query.includes("prefers-reduced-motion"),
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		);

		render(
			<Modal open onClose={() => {}} title="Reduced">
				Content
			</Modal>,
		);

		// reduced-motion 에서 패널이 최종(휴지) 상태로 즉시 도달 (spring immediate)
		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel).toBeInTheDocument();
		expect(panel).toHaveStyle({ transform: "scale(1) translateY(0px)" });
	});

	it("renders when open", () => {
		render(
			<Modal open onClose={() => {}}>
				Modal content
			</Modal>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Modal content")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		render(
			<Modal open={false} onClose={() => {}}>
				Modal content
			</Modal>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders with title", () => {
		render(
			<Modal open onClose={() => {}} title="Modal Title">
				Content
			</Modal>,
		);
		expect(screen.getByText("Modal Title")).toBeInTheDocument();
	});

	it("calls onClose when overlay is clicked", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);

		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("does not close on overlay click when closeOnOverlay is false", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose} closeOnOverlay={false}>
				Content
			</Modal>,
		);

		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("does not close when clicking inside modal panel", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				<button type="button">Inside button</button>
			</Modal>,
		);

		fireEvent.click(screen.getByText("Inside button"));
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("closes on Escape key press", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);

		fireEvent.keyDown(document.querySelector(".modal_panel") as HTMLElement, { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("has correct accessibility attributes", () => {
		render(
			<Modal open onClose={() => {}}>
				Content
			</Modal>,
		);

		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
	});

	it("applies custom width", () => {
		render(
			<Modal open onClose={() => {}} width={800}>
				Content
			</Modal>,
		);

		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel).toHaveStyle({ width: "800px" });
	});

	it("applies custom className to panel", () => {
		render(
			<Modal open onClose={() => {}} className="custom-modal">
				Content
			</Modal>,
		);

		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel).toHaveClass("custom-modal");
	});

	it("keeps scroll locked when one of multiple open modals is closed", () => {
		const { rerender } = render(
			<>
				<Modal open onClose={() => {}}>
					First
				</Modal>
				<Modal open onClose={() => {}}>
					Second
				</Modal>
			</>,
		);

		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("2");

		// Close the second modal
		rerender(
			<>
				<Modal open onClose={() => {}}>
					First
				</Modal>
				<Modal open={false} onClose={() => {}}>
					Second
				</Modal>
			</>,
		);

		// First modal still open - scroll must remain locked
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.dataset.openModals).toBe("1");
	});

	it("activates the focus trap when toggled open after mounting closed", () => {
		// 닫힌 채로 마운트 → open=true 로 전환하는 일반적인 controlled 패턴에서도 트랩이 걸려야 함
		const { rerender } = render(
			<Modal open={false} onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Modal>,
		);
		rerender(
			<Modal open onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Modal>,
		);
		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel?.contains(document.activeElement)).toBe(true);
	});

	it("renders the portal and traps focus when mounted already open (isMounted gate)", () => {
		// 마운트 시점부터 open=true - isMounted 게이트가 걸려 서버/첫 렌더엔 null 이지만,
		// mount effect 이후 포털이 붙고 focus trap 이 활성화되어야 한다. (가드가 영구 null 로
		// 깨지면 dialog 가 안 뜨고 이 테스트가 실패한다.)
		render(
			<Modal open onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Modal>,
		);
		const panel = screen.getByRole("dialog").querySelector(".modal_panel");
		expect(panel).not.toBeNull();
		expect(panel?.contains(document.activeElement)).toBe(true);
	});

	it("calls onClose once on Escape from inside the modal (no duplicate handler)", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);
		fireEvent.keyDown(document.querySelector(".modal_panel") as HTMLElement, { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("forwards data props and merges consumer style", () => {
		render(
			<Modal
				open
				onClose={() => {}}
				data-testid="panel-x"
				style={{ backgroundColor: "rgb(255, 0, 0)" }}
			>
				Content
			</Modal>,
		);
		// 포털 렌더라 render container 밖(document.body)에 붙는다
		const panel = document.querySelector(".modal_panel") as HTMLElement;
		expect(panel).toHaveAttribute("data-testid", "panel-x");
		expect(panel.style.backgroundColor).toBe("rgb(255, 0, 0)");
	});

	// ── 오버레이 닫기 판정 ───────────────────────────────────────────────────
	// 패널에서 누르고 오버레이에서 놓으면 `click` 은 공통 조상인 오버레이에 디스패치된다.
	// 텍스트 선택 같은 정상 조작이 닫기로 이어져 폼 입력이 사라지던 버그.
	it("does not close when a drag starts in the panel and ends on the overlay", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);
		const overlay = screen.getByRole("dialog");
		const panel = document.querySelector(".modal_panel") as HTMLElement;

		fireEvent.pointerDown(panel);
		fireEvent.click(overlay);
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("does not close when a click lands on the panel", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose}>
				Content
			</Modal>,
		);
		const panel = document.querySelector(".modal_panel") as HTMLElement;
		fireEvent.pointerDown(panel);
		fireEvent.click(panel);
		expect(handleClose).not.toHaveBeenCalled();
	});

	// ── 접근성 이름 ──────────────────────────────────────────────────────────
	// 폴백("Dialog")을 없앴다 - 이름을 빼먹으면 조용히 영어로 채워지는 대신
	// 이름 없는 대화상자가 되어 axe `aria-dialog-name` 이 잡는다.
	it("leaves the dialog unnamed when neither title nor ariaLabel is given", () => {
		render(
			<Modal open onClose={() => {}}>
				Content
			</Modal>,
		);
		const overlay = screen.getByRole("dialog");
		expect(overlay).not.toHaveAttribute("aria-label");
		expect(overlay).not.toHaveAttribute("aria-labelledby");
	});

	it("names the dialog from ariaLabel when there is no title", () => {
		render(
			<Modal open onClose={() => {}} ariaLabel="설정">
				Content
			</Modal>,
		);
		expect(screen.getByRole("dialog", { name: "설정" })).toBeInTheDocument();
	});

	// role="document" 제거 - ARIA 1.0 시절 워크어라운드였고 현대 스크린리더엔 불필요하다.
	it("does not nest a document role inside the dialog", () => {
		render(
			<Modal open onClose={() => {}} title="제목">
				Content
			</Modal>,
		);
		expect(document.querySelector(".modal_panel")).not.toHaveAttribute("role");
	});

	// 본문 wrapper 는 스크롤을 위해 tabIndex=0 을 갖지만, 초기 포커스는 그 빈 div 가 아니라
	// 안쪽의 첫 상호작용 요소로 가야 한다. close 버튼이 없으면 wrapper 가 DOM 상 첫 매치가 된다.
	it("focuses the first control inside the body, not the scroll wrapper", () => {
		render(
			<Modal open onClose={() => {}} showCloseIcon={false} title="폼">
				<input aria-label="이름" />
			</Modal>,
		);
		expect(document.activeElement).toBe(screen.getByLabelText("이름"));
	});

	it("still keeps the scroll wrapper in the tab cycle", () => {
		render(
			<Modal open onClose={() => {}} showCloseIcon={false} title="폼">
				<input aria-label="이름" />
			</Modal>,
		);
		const body = document.querySelector(".modal_body") as HTMLElement;
		expect(body.tabIndex).toBe(0);
	});

	// ── 퇴출 수명 ────────────────────────────────────────────────────────────
	it("does not fire onExited for a modal that was never opened", () => {
		const onExited = vi.fn();
		render(
			<Modal open={false} onClose={() => {}} onExited={onExited}>
				Content
			</Modal>,
		);
		expect(onExited).not.toHaveBeenCalled();
	});

	// reduced-motion 에서 spring 이 immediate 라 퇴출이 한 틱에 끝난다 - 실제 타이밍을 기다리지
	// 않고 "언마운트된 뒤에 발화한다" 는 계약만 확인한다.
	it("fires onExited after the panel unmounts", async () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: query.includes("prefers-reduced-motion"),
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		);
		const onExited = vi.fn();
		const { rerender } = render(
			<Modal open onClose={() => {}} onExited={onExited} title="상세">
				Content
			</Modal>,
		);
		expect(onExited).not.toHaveBeenCalled();

		rerender(
			<Modal open={false} onClose={() => {}} onExited={onExited} title="상세">
				Content
			</Modal>,
		);
		await waitFor(() => expect(onExited).toHaveBeenCalledTimes(1));
		expect(document.querySelector(".modal_panel")).toBeNull();
		vi.unstubAllGlobals();
	});
});
