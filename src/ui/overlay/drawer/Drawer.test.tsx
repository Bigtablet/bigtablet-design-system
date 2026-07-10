import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "./index";

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
		fireEvent.click(screen.getByRole("dialog"));
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("does not close on overlay click when closeOnOverlay is false", () => {
		const handleClose = vi.fn();
		render(
			<Drawer open onClose={handleClose} closeOnOverlay={false}>
				Content
			</Drawer>,
		);
		fireEvent.click(screen.getByRole("dialog"));
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
		fireEvent.keyDown(screen.getByRole("document"), { key: "Escape" });
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it("Escape closes only the topmost drawer when nested (stopPropagation)", () => {
		const outerClose = vi.fn();
		const innerClose = vi.fn();
		render(
			<Drawer open onClose={outerClose} title="Outer">
				<Drawer open onClose={innerClose} title="Inner">
					<button type="button">Inner content</button>
				</Drawer>
			</Drawer>,
		);

		// getAllByRole("document") in DOM order: [outer panel, inner panel]
		const panels = screen.getAllByRole("document");
		expect(panels).toHaveLength(2);
		fireEvent.keyDown(panels[1], { key: "Escape" });

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

	// ── Accessibility ────────────────────────────────────────────────────────

	it("has dialog role and modal accessibility attributes", () => {
		render(
			<Drawer open onClose={() => {}}>
				Content
			</Drawer>,
		);
		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
		// title 이 없으면 aria-label fallback
		expect(dialog).toHaveAttribute("aria-label", "Dialog");
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

	it("locks body scroll while open and restores on close", () => {
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
		expect(document.body.style.overflow).not.toBe("hidden");
	});

	it("keeps body scroll locked until the last overlay closes (shared counter)", () => {
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
		expect(document.body.style.overflow).not.toBe("hidden");
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

	it("forwards data props, protects overlay-critical props, and merges consumer style", () => {
		const consumerClick = vi.fn();
		const { container } = render(
			<Drawer
				open
				onClose={() => {}}
				data-testid="panel-x"
				style={{ backgroundColor: "rgb(255, 0, 0)" }}
				{...({ role: "menu", onClick: consumerClick } as Record<string, unknown>)}
			>
				Content
			</Drawer>,
		);
		const panel = container.querySelector(".drawer_panel") as HTMLElement;
		// data-* 등은 통과
		expect(panel).toHaveAttribute("data-testid", "panel-x");
		// role/onClick 은 컴포넌트가 전유 - 소비자 값 무시(스프레드 순서 회귀 시 깨짐)
		expect(panel).toHaveAttribute("role", "document");
		fireEvent.click(panel);
		expect(consumerClick).not.toHaveBeenCalled();
		// style 은 병합 - 소비자 값 적용
		expect(panel.style.backgroundColor).toBe("rgb(255, 0, 0)");
	});
});
