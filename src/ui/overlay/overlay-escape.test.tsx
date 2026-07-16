import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal";
import { Popover } from "./popover";
import { Tooltip } from "./tooltip";

/**
 * 여러 오버레이가 동시에 열렸을 때 공유 스택이 "최상단(가장 최근에 연) 오버레이만 닫힘"(APG)을
 * 컴포넌트 조합에서도 보장하는지, 그리고 자식 요소의 자체 Escape 처리(critical)를 막지 않는지 검증.
 */
describe("overlay Escape composition (shared stack)", () => {
	it("Tooltip over Popover: Escape closes only the topmost (Tooltip), Popover stays; next Escape closes Popover", () => {
		vi.useFakeTimers();
		try {
			const onOpenChange = vi.fn();
			render(
				<Popover
					defaultOpen
					onOpenChange={onOpenChange}
					trigger={<button type="button">trigger</button>}
					aria-label="pop"
					content={
						<Tooltip content="tip" delay={0}>
							<button type="button">inner</button>
						</Tooltip>
					}
				/>,
			);

			// Popover 는 이미 열림. inner 버튼에 hover 해 Tooltip 을 나중에 연다 → Tooltip 이 최상단.
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			fireEvent.mouseEnter(screen.getByRole("button", { name: "inner" }));
			act(() => {
				vi.advanceTimersByTime(10);
			});
			expect(screen.getByRole("tooltip")).toBeInTheDocument();

			// 1차 Escape - 최상단(Tooltip)만 닫히고 Popover 는 유지, onOpenChange 도 안 불림
			fireEvent.keyDown(document.body, { key: "Escape" });
			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(onOpenChange).not.toHaveBeenCalled();

			// 2차 Escape - 이제 최상단이 된 Popover 가 닫힌다
			fireEvent.keyDown(document.body, { key: "Escape" });
			expect(onOpenChange).toHaveBeenCalledWith(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it("Popover inside Modal: Escape closes only the Popover, Modal stays (topmost)", () => {
		const modalClose = vi.fn();
		const onOpenChange = vi.fn();
		render(
			<Modal open onClose={modalClose} title="M">
				<Popover
					onOpenChange={onOpenChange}
					trigger={<button type="button">open pop</button>}
					aria-label="pop"
					content={<span>pop body</span>}
				/>
			</Modal>,
		);
		// Modal 이 먼저 열려 있고, 그 안에서 Popover 를 클릭으로 나중에 연다 → Popover 최상단
		fireEvent.click(screen.getByText("open pop"));
		expect(screen.getByText("pop body")).toBeInTheDocument();

		fireEvent.keyDown(screen.getByText("pop body"), { key: "Escape" });

		// 최상단(Popover)만 닫히고(onOpenChange(false)) Modal 은 유지된다(onClose 미호출).
		// (Popover 의 exit 애니메이션 완료 후 unmount 는 Popover 자체 테스트가 커버하므로
		//  여기선 조합 관점의 신호 - onOpenChange/onClose - 만 검증한다.)
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(modalClose).not.toHaveBeenCalled();
	});

	it("does not steal Escape from a child that handles it first (child stops propagation)", () => {
		// critical: 레지스트리는 document bubble 리스너라 자식(input) 이 먼저 이벤트를 받는다.
		// 자식이 자체 Escape 를 처리하고 stopPropagation 하면 이벤트가 document 까지 오지 않아
		// Popover 는 닫히지 않는다 (IME/native select 등 자식 우선 처리 보장).
		const onOpenChange = vi.fn();
		render(
			<Popover
				defaultOpen
				onOpenChange={onOpenChange}
				trigger={<button type="button">t</button>}
				aria-label="pop"
				content={
					<input
						aria-label="field"
						onKeyDown={(e) => {
							if (e.key === "Escape") e.stopPropagation();
						}}
					/>
				}
			/>,
		);
		const field = screen.getByLabelText("field");
		expect(field).toHaveFocus(); // 열릴 때 첫 focusable 로 포커스 이동

		fireEvent.keyDown(field, { key: "Escape" });

		// 자식이 소비했으므로 Popover 는 열린 채 유지
		expect(onOpenChange).not.toHaveBeenCalled();
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("closes the Popover when a child does NOT consume the Escape", () => {
		const onOpenChange = vi.fn();
		render(
			<Popover
				defaultOpen
				onOpenChange={onOpenChange}
				trigger={<button type="button">t</button>}
				aria-label="pop"
				content={<input aria-label="field" />}
			/>,
		);
		const field = screen.getByLabelText("field");
		expect(field).toHaveFocus();

		fireEvent.keyDown(field, { key: "Escape" });

		// 자식이 소비하지 않으면 document 까지 버블돼 최상단 Popover 가 닫힌다
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
