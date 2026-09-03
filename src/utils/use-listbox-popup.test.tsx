import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { useListboxPopup } from "./use-listbox-popup";

interface Item {
	value: string;
	disabled?: boolean;
}

const ITEMS: Item[] = [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }];

/** 훅의 거동만 드러내는 최소 컴포넌트. Dropdown 의 렌더는 여기 관심사가 아니다. */
const Probe = ({
	items = ITEMS,
	onCommit = vi.fn(),
	returnFocusOnClose = false,
	disabled = false,
	expose,
}: {
	items?: Item[];
	onCommit?: (item: Item) => void;
	returnFocusOnClose?: boolean;
	disabled?: boolean;
	/** 공개 API 를 직접 부르는 테스트용 - Dropdown 경로로는 닿지 않는 분기를 덮는다 */
	expose?: (popup: ReturnType<typeof useListboxPopup<Item>>) => void;
}) => {
	const popup = useListboxPopup<Item>({ items, onCommit, returnFocusOnClose, disabled });
	// 렌더 중에 부르면 React 가 버린 렌더의 popup 이 테스트로 새어 나간다.
	useEffect(() => {
		expose?.(popup);
	}, [expose, popup]);
	return (
		<div ref={popup.wrapperRef}>
			<button
				type="button"
				ref={popup.triggerRef}
				onKeyDown={popup.onTriggerKeyDown}
				onClick={() => popup.setIsOpen(true)}
			>
				trigger
			</button>
			{popup.isOpen && (
				<div>
					<input aria-label="filter" onKeyDown={popup.onInputKeyDown} />
					{/* 실제 소비자(Dropdown·Combobox)와 같은 모양 - 스크롤 컨테이너 = listbox */}
					<ul ref={popup.listRef as React.RefObject<HTMLUListElement>} role="listbox">
						{items.map((item, i) => (
							<li
								key={item.value}
								role="option"
								aria-selected={i === popup.activeIndex}
								data-active={i === popup.activeIndex ? "true" : "false"}
							>
								{item.value}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

const activeValue = () =>
	screen.queryAllByRole("option").find((li) => li.dataset.active === "true")?.textContent;

describe("useListboxPopup", () => {
	it("opens on ArrowDown and lands on the first enabled item", () => {
		render(<Probe />);
		const trigger = screen.getByRole("button", { name: "trigger" });

		fireEvent.keyDown(trigger, { key: "ArrowDown" });
		expect(activeValue()).toBe("a");
	});

	it("wraps to the last item when moving up from no active item", () => {
		// -1 에서 위로 갈 때 보정하지 않으면 (-1-1+len)%len = len-2 라 마지막을 건너뛴다.
		render(<Probe />);
		const trigger = screen.getByRole("button", { name: "trigger" });

		fireEvent.click(trigger); // 열되 활성은 첫 항목
		fireEvent.keyDown(trigger, { key: "ArrowUp" });

		expect(activeValue()).toBe("c");
	});

	it("skips disabled items in both directions", () => {
		render(<Probe />);
		const trigger = screen.getByRole("button", { name: "trigger" });
		fireEvent.click(trigger);

		fireEvent.keyDown(trigger, { key: "ArrowDown" });
		expect(activeValue()).toBe("c"); // b 는 disabled

		fireEvent.keyDown(trigger, { key: "ArrowUp" });
		expect(activeValue()).toBe("a");
	});

	it("never commits a disabled item", () => {
		const onCommit = vi.fn();
		render(<Probe items={[{ value: "only", disabled: true }]} onCommit={onCommit} />);
		const trigger = screen.getByRole("button", { name: "trigger" });

		fireEvent.click(trigger);
		fireEvent.keyDown(trigger, { key: "Enter" });

		expect(onCommit).not.toHaveBeenCalled();
	});

	it("returns focus to the trigger on close when asked", () => {
		// 포커스가 패널 안(검색 입력)에 있는 형태에서 필요하다. 안 되돌리면 닫는 순간
		// 포커스가 body 로 유실돼 이후 Tab 이 문서 처음부터 다시 돈다.
		render(<Probe returnFocusOnClose />);
		const trigger = screen.getByRole("button", { name: "trigger" });
		fireEvent.click(trigger);

		const input = screen.getByLabelText("filter");
		input.focus();
		fireEvent.keyDown(input, { key: "Escape" });

		expect(document.activeElement).toBe(trigger);
	});

	it("loses focus to the document when not asked to return it", () => {
		// 이 테스트는 플래그가 무엇을 막는지 고정한다 - 패널이 unmount 되면 그 안에 있던
		// 포커스는 body 로 떨어지고, 이후 Tab 이 문서 처음부터 다시 돈다.
		render(<Probe />);
		fireEvent.click(screen.getByRole("button", { name: "trigger" }));

		const input = screen.getByLabelText("filter");
		input.focus();
		fireEvent.keyDown(input, { key: "Escape" });

		expect(document.activeElement).toBe(document.body);
	});

	// ── 공개 API 직접 호출 ──────────────────────────────────────────────────
	// moveActive·setActiveIndex 는 훅이 내보내는 API 다. Dropdown 은 항상 유효한 인덱스를
	// 유지하지만, 다른 소비자가 그러리라는 보장은 없다.

	it("wraps to the last item when moveActive runs with no active index", () => {
		// -1 에서 위로 갈 때 보정하지 않으면 (-1-1+len)%len = len-2 라 마지막을 건너뛴다.
		let api: ReturnType<typeof useListboxPopup<Item>> | undefined;
		render(
			<Probe
				expose={(p) => {
					api = p;
				}}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		act(() => api?.setActiveIndex(-1));
		act(() => api?.moveActive(-1));

		expect(activeValue()).toBe("c");
	});

	it("refuses to commit when the active index points at a disabled item", () => {
		const onCommit = vi.fn();
		let api: ReturnType<typeof useListboxPopup<Item>> | undefined;
		render(
			<Probe
				onCommit={onCommit}
				expose={(p) => {
					api = p;
				}}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		act(() => api?.setActiveIndex(1)); // ITEMS[1] 은 disabled
		act(() => api?.commitActive());

		expect(onCommit).not.toHaveBeenCalled();
	});

	it("ignores keys while an IME composition is in flight", () => {
		// 조합 중 Enter 는 조합 확정용이다. 여기서 선택하면 한글 입력이 첫 글자에서 끊긴다.
		const onCommit = vi.fn();
		render(<Probe onCommit={onCommit} />);
		const trigger = screen.getByRole("button", { name: "trigger" });
		fireEvent.click(trigger);

		const input = screen.getByLabelText("filter");
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });

		expect(onCommit).not.toHaveBeenCalled();
	});

	it("closes on outside click", () => {
		render(<Probe />);
		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		expect(screen.getByLabelText("filter")).toBeInTheDocument();

		fireEvent.mouseDown(document.body);
		expect(screen.queryByLabelText("filter")).not.toBeInTheDocument();
	});

	it("stops handling input keys once disabled", () => {
		// 열린 채로 런타임에 비활성화될 수 있다(예: 저장 중). 그때 Enter 가 통과하면
		// 사용자가 볼 수 없는 목록의 활성 항목이 커밋된다.
		const onCommit = vi.fn();
		const { rerender } = render(<Probe onCommit={onCommit} />);

		fireEvent.click(screen.getByText("trigger"));
		const input = screen.getByRole("textbox");
		fireEvent.keyDown(input, { key: "ArrowDown" });

		rerender(<Probe onCommit={onCommit} disabled />);
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onCommit).not.toHaveBeenCalled();
	});

	it("scrolls the active item into view", () => {
		// 포커스는 트리거·입력에 남으므로(APG) 브라우저가 알아서 스크롤해 주지 않는다.
		// 옵션이 많은 목록에서 아래로 내려가면 활성 표시가 보이지 않는 채로 움직였다.
		const calls: unknown[] = [];
		const spy = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (
			this: Element,
			arg,
		) {
			calls.push({ text: this.textContent, arg });
		});

		render(<Probe />);
		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowDown" });

		// 마지막 호출이 지금 활성인 항목이어야 한다 (b 는 disabled 라 건너뛰고 c)
		expect(calls.at(-1)).toEqual({ text: "c", arg: { block: "nearest" } });
		spy.mockRestore();
	});

	it("does not require listRef to work", () => {
		// ref 를 붙이지 않은 소비자(스크롤이 없는 짧은 목록)에서도 이동은 그대로다.
		const Bare = () => {
			const popup = useListboxPopup<Item>({ items: ITEMS, onCommit: vi.fn() });
			return (
				<div ref={popup.wrapperRef}>
					<button type="button" ref={popup.triggerRef} onClick={() => popup.setIsOpen(true)}>
						trigger
					</button>
					{popup.isOpen && <input aria-label="filter" onKeyDown={popup.onInputKeyDown} />}
					<span data-testid="active">{popup.activeIndex}</span>
				</div>
			);
		};

		render(<Bare />);
		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowDown" });

		expect(screen.getByTestId("active").textContent).toBe("2");
	});
});
