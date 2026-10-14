import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./index";

function Wrapper() {
	const [value, setValue] = React.useState("a");
	return (
		<Tabs value={value} onValueChange={setValue}>
			<TabList ariaLabel="Test tabs">
				<Tab value="a">A</Tab>
				<Tab value="b">B</Tab>
				<Tab value="c">C</Tab>
			</TabList>
			<TabPanel value="a">Panel A</TabPanel>
			<TabPanel value="b">Panel B</TabPanel>
			<TabPanel value="c">Panel C</TabPanel>
		</Tabs>
	);
}

describe("Tabs", () => {
	it("renders tabs and active panel", () => {
		render(<Wrapper />);
		expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByText("Panel A")).toBeInTheDocument();
		expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
	});

	it("changes panel on tab click", () => {
		render(<Wrapper />);
		fireEvent.click(screen.getByRole("tab", { name: "B" }));
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByText("Panel B")).toBeInTheDocument();
	});

	it("supports ArrowRight keyboard navigation", () => {
		render(<Wrapper />);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "ArrowRight" });
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
	});

	it("selects a tab whose value is an empty string via keyboard, same as click", () => {
		const onValueChange = vi.fn();
		render(
			<Tabs defaultValue="a" onValueChange={onValueChange}>
				<TabList>
					<Tab value="a">A</Tab>
					<Tab value="">전체</Tab>
				</TabList>
			</Tabs>,
		);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "ArrowRight" });
		expect(onValueChange).toHaveBeenCalledWith("");
		expect(screen.getByRole("tab", { name: "전체" })).toHaveFocus();
	});

	it("supports Home/End keys", () => {
		render(<Wrapper />);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "End" });
		expect(screen.getByRole("tab", { name: "C" })).toHaveAttribute("aria-selected", "true");
	});

	it("throws when Tab is used outside Tabs", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<Tab value="a">A</Tab>)).toThrow("[Bigtablet DS]");
		consoleError.mockRestore();
	});

	it("applies aria-label on tablist", () => {
		render(<Wrapper />);
		expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Test tabs");
	});

	it("keeps only the first tab as the tab stop when no tab is selected (roving tabindex)", () => {
		// 회귀: 선택 탭이 없으면 전부 tabIndex=-1 이 되어 tablist 진입 불가였음.
		// 수정 후엔 첫 탭만 tab stop(0), 나머지는 -1 (WAI-ARIA roving tabindex).
		render(
			<Tabs>
				<TabList ariaLabel="t">
					<Tab value="a">A</Tab>
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>,
		);
		expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("tabindex", "0");
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("tabindex", "-1");
	});

	it("runs consumer onKeyDown AND keeps arrow navigation ({...props} must not replace it)", () => {
		const onKeyDown = vi.fn();
		render(
			<Tabs defaultValue="a">
				<TabList ariaLabel="t">
					<Tab value="a" onKeyDown={onKeyDown}>
						A
					</Tab>
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>,
		);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "ArrowRight" });

		expect(onKeyDown).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
	});
	it("moves the indicator when a tab is inserted before the active one", async () => {
		// 인디케이터는 활성 탭의 offsetLeft 를 따라간다. 선택 표시(aria-selected)만 관찰하면
		// 탭이 나중에 끼어들 때(권한·조건부 탭) 활성 탭이 옆으로 밀려도 아무 옵저버가 안 돈다.
		// `line` variant 의 목록은 폭이 100% 라 ResizeObserver 도 발화하지 않는다.
		const offsetLeft = vi
			.spyOn(HTMLElement.prototype, "offsetLeft", "get")
			.mockImplementation(function (this: HTMLElement) {
				const siblings = Array.from(this.parentElement?.querySelectorAll('[role="tab"]') ?? []);
				const index = siblings.indexOf(this);
				return index < 0 ? 0 : index * 100;
			});
		const offsetWidth = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100);

		try {
			const Variable = ({ withDraft }: { withDraft: boolean }) => (
				<Tabs value="done" onValueChange={() => {}}>
					<TabList ariaLabel="상태">
						<Tab value="all">전체</Tab>
						{withDraft ? <Tab value="draft">임시저장</Tab> : null}
						<Tab value="done">완료</Tab>
					</TabList>
					<TabPanel value="done">완료 패널</TabPanel>
				</Tabs>
			);

			const { container, rerender } = render(<Variable withDraft={false} />);
			const indicator = () => container.querySelector<HTMLElement>(".tabs_indicator");
			expect(indicator()?.style.left).toBe("100px");

			rerender(<Variable withDraft={true} />);

			await waitFor(() => expect(indicator()?.style.left).toBe("200px"));
		} finally {
			offsetLeft.mockRestore();
			offsetWidth.mockRestore();
		}
	});

	it("selects on click when uncontrolled", () => {
		render(
			<Tabs defaultValue="a">
				<TabList>
					<Tab value="a">A</Tab>
					<Tab value="b">B</Tab>
				</TabList>
				<TabPanel value="b">Panel B</TabPanel>
			</Tabs>,
		);
		fireEvent.click(screen.getByRole("tab", { name: "B" }));
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("tab", { name: "B" })).toHaveClass("tabs_tab_active");
		expect(screen.getByRole("tab", { name: "A" })).not.toHaveClass("tabs_tab_active");
		expect(screen.getByText("Panel B")).toBeInTheDocument();
	});

	it("calls the latest onValueChange after it changes", () => {
		const first = vi.fn();
		const second = vi.fn();
		const ui = (onValueChange: (v: string) => void) => (
			<Tabs value="a" onValueChange={onValueChange}>
				<TabList>
					<Tab value="a">A</Tab>
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>
		);
		const { rerender } = render(ui(first));
		rerender(ui(second));
		fireEvent.click(screen.getByRole("tab", { name: "B" }));
		expect(second).toHaveBeenCalledWith("b");
		expect(first).not.toHaveBeenCalled();
	});

	it("hands the tab stop to the next tab when the first one unmounts with nothing selected", () => {
		const ui = (withFirst: boolean) => (
			<Tabs>
				<TabList>
					{withFirst ? <Tab value="a">A</Tab> : null}
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>
		);
		const { rerender } = render(ui(true));
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("tabindex", "-1");
		rerender(ui(false));
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("tabindex", "0");
	});

	it("ArrowLeft moves back and wraps from the first tab to the last, End/Home jump to the ends", () => {
		render(<Wrapper />);
		const tab = (name: string) => screen.getByRole("tab", { name });
		tab("A").focus();

		expect(fireEvent.keyDown(tab("A"), { key: "ArrowLeft" })).toBe(false);
		expect(tab("C")).toHaveAttribute("aria-selected", "true");
		expect(tab("C")).toHaveFocus();

		fireEvent.keyDown(tab("C"), { key: "ArrowLeft" });
		expect(tab("B")).toHaveAttribute("aria-selected", "true");

		// 가운데서 눌러 화살표 이동과 구분한다 - 끝에서 누르면 ← 와 Home 결과가 같다
		fireEvent.keyDown(tab("B"), { key: "End" });
		expect(tab("C")).toHaveAttribute("aria-selected", "true");

		fireEvent.keyDown(tab("C"), { key: "Home" });
		expect(tab("A")).toHaveAttribute("aria-selected", "true");
		expect(tab("A")).toHaveFocus();
	});

	it("ArrowRight wraps from the last tab and skips disabled tabs", () => {
		render(
			<Tabs defaultValue="c">
				<TabList>
					<Tab value="a">A</Tab>
					<Tab value="b" disabled>
						B
					</Tab>
					<Tab value="c">C</Tab>
				</TabList>
			</Tabs>,
		);
		const tab = (name: string) => screen.getByRole("tab", { name });
		fireEvent.keyDown(tab("C"), { key: "ArrowRight" });
		expect(tab("A")).toHaveAttribute("aria-selected", "true");
		fireEvent.keyDown(tab("A"), { key: "ArrowRight" });
		expect(tab("C")).toHaveAttribute("aria-selected", "true");
	});

	it("leaves other keys and consumer-prevented arrows alone", () => {
		render(
			<Tabs defaultValue="a">
				<TabList>
					<Tab value="a" onKeyDown={(e) => e.key === "ArrowRight" && e.preventDefault()}>
						A
					</Tab>
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>,
		);
		const tabA = screen.getByRole("tab", { name: "A" });
		expect(fireEvent.keyDown(tabA, { key: "Enter" })).toBe(true);
		expect(fireEvent.keyDown(tabA, { key: "ArrowDown" })).toBe(true);
		fireEvent.keyDown(tabA, { key: "ArrowRight" });
		expect(tabA).toHaveAttribute("aria-selected", "true");
	});

	it("keeps an inactive panel in the DOM but hidden when unmountInactive is false", () => {
		render(
			<Tabs defaultValue="a">
				<TabList>
					<Tab value="a">A</Tab>
					<Tab value="b">B</Tab>
				</TabList>
				<TabPanel value="a" unmountInactive={false}>
					Panel A
				</TabPanel>
				<TabPanel value="b" unmountInactive={false}>
					Panel B
				</TabPanel>
			</Tabs>,
		);
		expect(screen.getByText("Panel A")).not.toHaveAttribute("hidden");
		expect(screen.getByText("Panel B")).toHaveAttribute("hidden");
	});

	it("animates the indicator only after mount and drops it when nothing is selected", () => {
		vi.useFakeTimers();
		try {
			const ui = (value: string) => (
				<Tabs value={value} onValueChange={() => {}}>
					<TabList>
						<Tab value="a">A</Tab>
						<Tab value="b">B</Tab>
					</TabList>
				</Tabs>
			);
			const { container, rerender } = render(ui("a"));
			const indicator = () => container.querySelector(".tabs_indicator");
			expect(indicator()).not.toHaveClass("tabs_indicator_animated");
			act(() => {
				vi.advanceTimersByTime(50);
			});
			expect(indicator()).toHaveClass("tabs_indicator_animated");

			rerender(ui("none"));
			act(() => {
				vi.runOnlyPendingTimers();
			});
			// MutationObserver 콜백은 마이크로태스크 - 직접 resize 로 update 를 부른다
			act(() => {
				window.dispatchEvent(new Event("resize"));
			});
			expect(indicator()).toBeNull();
		} finally {
			vi.useRealTimers();
		}
	});

	it("follows window resize and stops listening after unmount", () => {
		let left = 0;
		const offsetLeft = vi
			.spyOn(HTMLElement.prototype, "offsetLeft", "get")
			.mockImplementation(() => left);
		const removeListener = vi.spyOn(window, "removeEventListener");
		try {
			const { container, unmount } = render(<Wrapper />);
			left = 40;
			act(() => {
				window.dispatchEvent(new Event("resize"));
			});
			expect(container.querySelector<HTMLElement>(".tabs_indicator")?.style.left).toBe("40px");
			unmount();
			expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
		} finally {
			offsetLeft.mockRestore();
			removeListener.mockRestore();
		}
	});
});
