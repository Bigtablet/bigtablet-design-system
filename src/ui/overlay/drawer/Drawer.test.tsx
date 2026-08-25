import { Globals } from "@react-spring/web";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "./index";

const stubReducedMotion = () => {
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
};

describe("Drawer", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("renders when open", () => {
		render(
			<Drawer open onClose={() => {}}>
				Drawer content
			</Drawer>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Drawer content")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		render(
			<Drawer open={false} onClose={() => {}}>
				Drawer content
			</Drawer>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders title inside header with linked aria-labelledby", () => {
		render(
			<Drawer open onClose={() => {}} title="Drawer Title">
				Content
			</Drawer>,
		);
		const dialog = screen.getByRole("dialog");
		const heading = screen.getByText("Drawer Title");
		expect(heading).toBeInTheDocument();
		expect(dialog).toHaveAttribute("aria-labelledby", heading.getAttribute("id"));
	});

	// ── Placement ────────────────────────────────────────────────────────────

	it("defaults to the right placement", () => {
		render(
			<Drawer open onClose={() => {}}>
				Content
			</Drawer>,
		);
		expect(screen.getByRole("dialog")).toHaveClass("drawer_placement_right");
	});

	it.each(["left", "right", "bottom"] as const)(
		"applies the placement class for %s",
		(placement) => {
			render(
				<Drawer open onClose={() => {}} placement={placement}>
					Content
				</Drawer>,
			);
			expect(screen.getByRole("dialog")).toHaveClass(`drawer_placement_${placement}`);
		},
	);

	// ── Size ───────────────────────────────────────────────────────────────

	it("applies numeric size as px width for left/right", () => {
		render(
			<Drawer open onClose={() => {}} placement="right" size={420}>
				Content
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).toHaveStyle({ width: "420px" });
	});

	it("applies string size verbatim", () => {
		render(
			<Drawer open onClose={() => {}} placement="left" size="50vw">
				Content
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).toHaveStyle({ width: "50vw" });
	});

	it("applies size as height for bottom placement", () => {
		render(
			<Drawer open onClose={() => {}} placement="bottom" size={300}>
				Content
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).toHaveStyle({ height: "300px" });
	});

	// ── Overlay / close ──────────────────────────────────────────────────────

	it("calls onClose when overlay is clicked", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose}>
				Content
			</Drawer>,
		);
		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("does not close on overlay click when closeOnOverlay is false", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose} closeOnOverlay={false}>
				Content
			</Drawer>,
		);
		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(handleClose).not.toHaveBeenCalled();
	});

	// 패널에서 누르고 오버레이에서 놓으면 `click` 은 공통 조상인 오버레이에 디스패치된다.
	// 텍스트 선택 같은 정상 조작이 닫기로 이어져 폼 입력이 사라지던 버그 (Modal 과 동일 계약).
	it("does not close when a drag starts in the panel and ends on the overlay", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose}>
				Content
			</Drawer>,
		);
		const overlay = screen.getByRole("dialog");
		const panel = document.querySelector(".drawer_panel") as HTMLElement;

		fireEvent.pointerDown(panel);
		fireEvent.click(overlay);
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("does not close when clicking inside the panel", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose}>
				<button type="button">Inside button</button>
			</Drawer>,
		);
		fireEvent.click(screen.getByText("Inside button"));
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("renders the close icon button and calls onClose when clicked", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose} closeLabel="Close drawer">
				Content
			</Drawer>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Close drawer" }));
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("hides the close icon when showCloseIcon is false", () => {
		render(
			<Drawer open onClose={() => {}} showCloseIcon={false}>
				Content
			</Drawer>,
		);
		expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
	});

	// ── Escape ────────────────────────────────────────────────────────────

	it("closes on Escape and calls onClose once", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose}>
				Content
			</Drawer>,
		);
		fireEvent.keyDown(document.querySelector(".drawer_panel") as HTMLElement, { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("Escape closes only the topmost drawer when nested (shared overlay stack)", () => {
		const outerClose = vi.fn();
		const innerClose = vi.fn();
		// 공유 스택은 LIFO - 최상단 = 가장 최근에 열린 오버레이다. 실제 앱에서 중첩 오버레이는
		// 순차적으로 열리므로(바깥을 연 뒤 안쪽을 연다) 열린 순서 = stacking 순서가 된다.
		// 그 순서를 재현하기 위해 바깥을 먼저 연 뒤 rerender 로 안쪽을 연다.
		const { rerender } = render(
			<Drawer open onClose={outerClose} title="Outer">
				<Drawer open={false} onClose={innerClose} title="Inner">
					<button type="button">Inner content</button>
				</Drawer>
			</Drawer>,
		);
		rerender(
			<Drawer open onClose={outerClose} title="Outer">
				<Drawer open onClose={innerClose} title="Inner">
					<button type="button">Inner content</button>
				</Drawer>
			</Drawer>,
		);

		// 포털 렌더라 DOM 순서가 React 트리 순서와 다를 수 있음 - 내용으로 inner 패널을 찾는다
		const panels = document.querySelectorAll(".drawer_panel");
		expect(panels).toHaveLength(2);
		const innerPanel = screen.getByText("Inner content").closest(".drawer_panel") as HTMLElement;
		fireEvent.keyDown(innerPanel, { key: "Escape" });

		// 최상단(나중에 연 inner)만 닫히고 outer 는 유지된다 (APG)
		expect(innerClose).toHaveBeenCalledTimes(1);
		expect(outerClose).not.toHaveBeenCalled();
	});

	// ── Focus trap ────────────────────────────────────────────────────────

	it("moves focus into the panel when opened (focus trap active)", () => {
		render(
			<Drawer open onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).not.toBeNull();
		expect(panel?.contains(document.activeElement)).toBe(true);
	});

	it("activates the focus trap when toggled open after mounting closed", () => {
		// 닫힌 채로 마운트 → open=true 로 전환하는 일반적인 controlled 패턴에서도 트랩이 걸려야 함
		const { rerender } = render(
			<Drawer open={false} onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Drawer>,
		);
		rerender(
			<Drawer open onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel?.contains(document.activeElement)).toBe(true);
	});

	it("renders the portal and traps focus when mounted already open (isMounted gate)", () => {
		// 마운트 시점부터 open=true - isMounted 게이트가 걸려도 mount effect 이후 포털+트랩 활성화
		render(
			<Drawer open onClose={() => {}} title="Trap">
				<button type="button">First action</button>
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).not.toBeNull();
		expect(panel?.contains(document.activeElement)).toBe(true);
	});

	// ── Accessibility ────────────────────────────────────────────────────────

	it("has dialog role and modal accessibility attributes", () => {
		render(
			<Drawer open onClose={() => {}}>
				Content
			</Drawer>,
		);
		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
	});

	// 폴백("Dialog")을 없앴다 - 이름을 빼먹으면 조용히 영어로 채워지는 대신 이름 없는
	// 대화상자가 되어 axe `aria-dialog-name` 이 잡는다 (Modal 과 동일 계약).
	it("leaves the dialog unnamed when neither title nor ariaLabel is given", () => {
		render(
			<Drawer open onClose={() => {}}>
				Content
			</Drawer>,
		);
		const dialog = screen.getByRole("dialog");
		expect(dialog).not.toHaveAttribute("aria-label");
		expect(dialog).not.toHaveAttribute("aria-labelledby");
	});

	// role="document" 제거 - ARIA 1.0 시절 워크어라운드였고 현대 스크린리더엔 불필요하다.
	it("does not nest a document role inside the dialog", () => {
		render(
			<Drawer open onClose={() => {}} title="제목">
				Content
			</Drawer>,
		);
		expect(document.querySelector(".drawer_panel")).not.toHaveAttribute("role");
	});

	// 본문 wrapper 는 스크롤을 위해 tabIndex=0 을 갖지만, 초기 포커스는 그 빈 div 가 아니라
	// 안쪽의 첫 상호작용 요소로 가야 한다. close 버튼이 없으면 wrapper 가 DOM 상 첫 매치가 된다.
	it("focuses the first control inside the body, not the scroll wrapper", () => {
		render(
			<Drawer open onClose={() => {}} showCloseIcon={false} title="폼">
				<input aria-label="이름" />
			</Drawer>,
		);
		expect(document.activeElement).toBe(screen.getByLabelText("이름"));
	});

	it("still keeps the scroll wrapper in the tab cycle", () => {
		render(
			<Drawer open onClose={() => {}} showCloseIcon={false} title="폼">
				<input aria-label="이름" />
			</Drawer>,
		);
		const body = document.querySelector(".drawer_body") as HTMLElement;
		expect(body.tabIndex).toBe(0);
	});

	it("uses ariaLabel for the dialog when provided without a title", () => {
		render(
			<Drawer open onClose={() => {}} ariaLabel="필터 패널">
				Content
			</Drawer>,
		);
		expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "필터 패널");
	});

	// ── Body scroll lock ───────────────────────────────────────────────────

	it("locks body scroll while open and restores after the exit finishes", async () => {
		const { rerender } = render(
			<Drawer open onClose={() => {}}>
				Content
			</Drawer>,
		);
		expect(document.body.style.overflow).toBe("hidden");

		rerender(
			<Drawer open={false} onClose={() => {}}>
				Content
			</Drawer>,
		);
		// 닫기 시작 시점에는 아직 잠겨 있어야 한다 - 퇴출 애니메이션 동안 오버레이가 계속
		// 렌더되므로, 여기서 풀면 `scrollbar-gutter` 보정이 사라져 거터에 빈 띠가 보이고
		// 배경 콘텐츠가 그만큼 튄다.
		expect(document.body.style.overflow).toBe("hidden");

		// 퇴출이 끝나(shouldRender false) 완전히 unmount 되면 풀린다.
		await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
	});

	it("releases the scroll lock under reduced motion", async () => {
		// Drawer 는 useSpringPresence 의 onExitComplete 로 shouldRender 를 내린다.
		// reduced-motion(`immediate: true`)에서도 그 콜백이 도는지 확인한다 - 안 돌면
		// 잠금이 영구히 남는다.
		// setup.ts 가 스위트 전체에 skipAnimation 을 걸어 두면 어떤 스프링이든 즉시 끝나
		// 일반 종료 테스트와 같은 경로가 된다. 여기서만 끄고 `immediate: reduced` 가 실제로
		// 도는 경로를 태운다. (그 플래그를 지우는 뮤테이션까지 잡지는 못한다 - 스프링이
		// 애니메이션으로 끝나도 waitFor 안에 들어오기 때문이다.)
		Globals.assign({ skipAnimation: false });
		stubReducedMotion();
		const { rerender } = render(
			<Drawer open onClose={() => {}}>
				Content
			</Drawer>,
		);
		expect(document.body.style.overflow).toBe("hidden");

		rerender(
			<Drawer open={false} onClose={() => {}}>
				Content
			</Drawer>,
		);

		await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
		expect(document.body.dataset.openModals).toBeUndefined();

		Globals.assign({ skipAnimation: true });
	});

	it("keeps body scroll locked until the last overlay closes (shared counter)", async () => {
		const { rerender } = render(
			<>
				<Drawer open onClose={() => {}}>
					Outer
				</Drawer>
				<Drawer open onClose={() => {}}>
					Inner
				</Drawer>
			</>,
		);
		expect(document.body.style.overflow).toBe("hidden");

		// 안쪽만 닫힘 - 바깥이 아직 열려 있으므로 잠금 유지 (카운터 1)
		rerender(
			<>
				<Drawer open onClose={() => {}}>
					Outer
				</Drawer>
				<Drawer open={false} onClose={() => {}}>
					Inner
				</Drawer>
			</>,
		);
		expect(document.body.style.overflow).toBe("hidden");

		// 마지막까지 닫히면 원래 overflow 복원 (카운터 0)
		rerender(
			<>
				<Drawer open={false} onClose={() => {}}>
					Outer
				</Drawer>
				<Drawer open={false} onClose={() => {}}>
					Inner
				</Drawer>
			</>,
		);
		await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
	});

	// ── Reduced motion ───────────────────────────────────────────────────────

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
			<Drawer open onClose={() => {}} placement="right" title="Reduced">
				Content
			</Drawer>,
		);

		// reduced-motion 에서도 정상 렌더 + 패널이 최종(휴지) 위치에 즉시 도달
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).toBeInTheDocument();
		expect(panel).toHaveStyle({ transform: "translateX(0%)" });
	});

	// ── className passthrough ─────────────────────────────────────────────

	it("applies custom className to the panel", () => {
		render(
			<Drawer open onClose={() => {}} className="custom-drawer">
				Content
			</Drawer>,
		);
		const panel = screen.getByRole("dialog").querySelector(".drawer_panel");
		expect(panel).toHaveClass("custom-drawer");
	});

	it("forwards data props and merges consumer style", () => {
		render(
			<Drawer
				open
				onClose={() => {}}
				data-testid="panel-x"
				style={{ backgroundColor: "rgb(255, 0, 0)" }}
			>
				Content
			</Drawer>,
		);
		// 포털 렌더라 render container 밖(document.body)에 붙는다
		const panel = document.querySelector(".drawer_panel") as HTMLElement;
		expect(panel).toHaveAttribute("data-testid", "panel-x");
		expect(panel.style.backgroundColor).toBe("rgb(255, 0, 0)");
	});

	// ── 퇴출 수명 ────────────────────────────────────────────────────────────
	it("does not fire onExited for a drawer that was never opened", () => {
		const onExited = vi.fn();
		render(
			<Drawer open={false} onClose={() => {}} onExited={onExited}>
				Content
			</Drawer>,
		);
		expect(onExited).not.toHaveBeenCalled();
	});

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
			<Drawer open onClose={() => {}} onExited={onExited} title="상세">
				Content
			</Drawer>,
		);
		expect(onExited).not.toHaveBeenCalled();

		rerender(
			<Drawer open={false} onClose={() => {}} onExited={onExited} title="상세">
				Content
			</Drawer>,
		);
		await waitFor(() => expect(onExited).toHaveBeenCalledTimes(1));
		expect(document.querySelector(".drawer_panel")).toBeNull();
		vi.unstubAllGlobals();
	});

	// ── children freeze ──────────────────────────────────────────────────────
	it("keeps the last children through the exit animation", () => {
		const { rerender } = render(
			<Drawer open onClose={() => {}} title="상세">
				<p>상세 내용</p>
			</Drawer>,
		);
		expect(screen.getByText("상세 내용")).toBeInTheDocument();

		rerender(<Drawer open={false} onClose={() => {}} title="상세" />);
		expect(screen.getByText("상세 내용")).toBeInTheDocument();
	});

	it("lets new children win when reopened during the exit animation", () => {
		const { rerender } = render(
			<Drawer open onClose={() => {}} title="상세">
				<p>첫 번째</p>
			</Drawer>,
		);
		rerender(<Drawer open={false} onClose={() => {}} title="상세" />);
		rerender(
			<Drawer open onClose={() => {}} title="상세">
				<p>두 번째</p>
			</Drawer>,
		);
		expect(screen.getByText("두 번째")).toBeInTheDocument();
		expect(screen.queryByText("첫 번째")).not.toBeInTheDocument();
	});

	// ── dismissible ──────────────────────────────────────────────────────────
	it("blocks both Escape and overlay click when dismissible is false", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose} dismissible={false}>
				Content
			</Drawer>,
		);
		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		fireEvent.keyDown(document.querySelector(".drawer_panel") as HTMLElement, { key: "Escape" });
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("wins over closeOnOverlay when both are given", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose} closeOnOverlay={false} dismissible>
				Content
			</Drawer>,
		);
		const overlay = screen.getByRole("dialog");
		fireEvent.pointerDown(overlay);
		fireEvent.click(overlay);
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	// 열려 있는 동안 children 이 바뀌면 기억도 따라가야 한다. 초기값만 붙잡으면 닫을 때
	// 처음 열었을 때의 본문으로 되돌아간다.
	it("freezes the children it had when it closed, not the ones it opened with", () => {
		const { rerender } = render(
			<Drawer open onClose={() => {}} title="상세">
				<p>첫 내용</p>
			</Drawer>,
		);
		rerender(
			<Drawer open onClose={() => {}} title="상세">
				<p>바뀐 내용</p>
			</Drawer>,
		);
		rerender(<Drawer open={false} onClose={() => {}} title="상세" />);

		expect(screen.getByText("바뀐 내용")).toBeInTheDocument();
		expect(screen.queryByText("첫 내용")).not.toBeInTheDocument();
	});

	it("consumes Escape instead of letting it reach the overlay beneath", () => {
		const outerClose = vi.fn();
		const innerClose = vi.fn();
		const { rerender } = render(
			<Drawer open onClose={outerClose} title="아래">
				<Drawer open={false} onClose={innerClose} dismissible={false} title="위">
					<button type="button">보호된 폼</button>
				</Drawer>
			</Drawer>,
		);
		rerender(
			<Drawer open onClose={outerClose} title="아래">
				<Drawer open onClose={innerClose} dismissible={false} title="위">
					<button type="button">보호된 폼</button>
				</Drawer>
			</Drawer>,
		);

		fireEvent.keyDown(screen.getByText("보호된 폼"), { key: "Escape" });

		expect(innerClose).not.toHaveBeenCalled();
		expect(outerClose).not.toHaveBeenCalled();
	});

	it("freezes title and footer along with children", () => {
		const { rerender } = render(
			<Drawer
				open
				onClose={() => {}}
				title="항목 제목"
				footer={<button type="button">삭제</button>}
			>
				<p>항목 본문</p>
			</Drawer>,
		);
		rerender(<Drawer open={false} onClose={() => {}} />);

		expect(screen.getByText("항목 제목")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
		expect(screen.getByText("항목 본문")).toBeInTheDocument();
	});
});
