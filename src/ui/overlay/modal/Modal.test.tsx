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

	// ── children freeze ──────────────────────────────────────────────────────
	// 부모가 open 과 본문을 같은 값에 묶는 것은 흔한 형태다. 그때 본문이 먼저 사라지면
	// 제목만 남은 빈 패널이 페이드아웃해 두 단계로 닫히는 것이 보인다.
	it("keeps the last children through the exit animation", () => {
		const { rerender } = render(
			<Modal open onClose={() => {}} title="상세">
				<p>상세 내용</p>
			</Modal>,
		);
		expect(screen.getByText("상세 내용")).toBeInTheDocument();

		// 닫는 tick 에 부모가 데이터를 비운다
		rerender(
			<Modal open={false} onClose={() => {}} title="상세" />,
		);
		expect(screen.getByText("상세 내용")).toBeInTheDocument();
	});

	it("lets new children win when reopened during the exit animation", () => {
		const { rerender } = render(
			<Modal open onClose={() => {}} title="상세">
				<p>첫 번째</p>
			</Modal>,
		);
		rerender(<Modal open={false} onClose={() => {}} title="상세" />);
		expect(screen.getByText("첫 번째")).toBeInTheDocument();

		rerender(
			<Modal open onClose={() => {}} title="상세">
				<p>두 번째</p>
			</Modal>,
		);
		expect(screen.getByText("두 번째")).toBeInTheDocument();
		expect(screen.queryByText("첫 번째")).not.toBeInTheDocument();
	});

	// ── dismissible ──────────────────────────────────────────────────────────
	it("blocks both Escape and overlay click when dismissible is false", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose} dismissible={false}>
				Content
			</Modal>,
		);
		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		fireEvent.keyDown(document.querySelector(".modal_panel") as HTMLElement, { key: "Escape" });
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("wins over closeOnOverlay when both are given", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose} closeOnOverlay={false} dismissible>
				Content
			</Modal>,
		);
		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("leaves Escape working when only closeOnOverlay is off", () => {
		const handleClose = vi.fn();
		render(
			<Modal open onClose={handleClose} closeOnOverlay={false}>
				Content
			</Modal>,
		);
		fireEvent.keyDown(document.querySelector(".modal_panel") as HTMLElement, { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	// 열려 있는 동안 children 이 바뀌면 기억도 따라가야 한다. 초기값만 붙잡으면 닫을 때
	// 처음 열었을 때의 본문으로 되돌아간다.
	it("freezes the children it had when it closed, not the ones it opened with", () => {
		const { rerender } = render(
			<Modal open onClose={() => {}} title="상세">
				<p>첫 내용</p>
			</Modal>,
		);
		rerender(
			<Modal open onClose={() => {}} title="상세">
				<p>바뀐 내용</p>
			</Modal>,
		);
		rerender(<Modal open={false} onClose={() => {}} title="상세" />);

		expect(screen.getByText("바뀐 내용")).toBeInTheDocument();
		expect(screen.queryByText("첫 내용")).not.toBeInTheDocument();
	});

	// dismissible={false} 라도 Escape 스택에는 등록돼야 한다. 등록하지 않으면 최상단 자리를
	// 비워, Escape 가 아래에 있는 오버레이로 내려가 사용자가 보고 있지 않은 것이 닫힌다.
	it("consumes Escape instead of letting it reach the overlay beneath", () => {
		const outerClose = vi.fn();
		const innerClose = vi.fn();
		const { rerender } = render(
			<Modal open onClose={outerClose} title="아래">
				<Modal open={false} onClose={innerClose} dismissible={false} title="위">
					<button type="button">보호된 폼</button>
				</Modal>
			</Modal>,
		);
		// 아래 모달이 먼저, 위 모달을 나중에 연다 → 위 모달이 스택 최상단
		rerender(
			<Modal open onClose={outerClose} title="아래">
				<Modal open onClose={innerClose} dismissible={false} title="위">
					<button type="button">보호된 폼</button>
				</Modal>
			</Modal>,
		);

		fireEvent.keyDown(screen.getByText("보호된 폼"), { key: "Escape" });

		// 위 모달은 dismissible={false} 라 닫히지 않고, 아래 모달도 닫히지 않는다
		expect(innerClose).not.toHaveBeenCalled();
		expect(outerClose).not.toHaveBeenCalled();
	});

	// children 만 얼리면 같은 데이터에 묶인 footer/title 이 먼저 사라져 같은 버그가 재현된다.
	it("freezes title, description and footer along with children", () => {
		const { rerender } = render(
			<Modal
				open
				onClose={() => {}}
				title="항목 제목"
				description="항목 설명"
				footer={<button type="button">삭제</button>}
			>
				<p>항목 본문</p>
			</Modal>,
		);
		rerender(<Modal open={false} onClose={() => {}} />);

		expect(screen.getByText("항목 제목")).toBeInTheDocument();
		expect(screen.getByText("항목 설명")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
		expect(screen.getByText("항목 본문")).toBeInTheDocument();
	});
});
