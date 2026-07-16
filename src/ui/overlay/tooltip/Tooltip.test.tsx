import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./index";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("Tooltip", () => {
	it("does not show tooltip initially", () => {
		render(
			<Tooltip content="hint">
				<button type="button">btn</button>
			</Tooltip>,
		);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("shows tooltip after delay on mouseEnter", () => {
		render(
			<Tooltip content="hint" delay={100}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(150);
		});
		expect(screen.getByRole("tooltip")).toHaveTextContent("hint");
	});

	it("hides on mouseLeave (after the hoverable grace period)", () => {
		render(
			<Tooltip content="hint" delay={0}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		act(() => {
			vi.advanceTimersByTime(10);
		});
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
		fireEvent.mouseLeave(screen.getByRole("button"));
		// WCAG 1.4.13 Hoverable - 포인터가 툴팁으로 건너갈 유예(120ms) 동안은 유지
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(150);
		});
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("stays open while the pointer is over the tooltip itself (WCAG 1.4.13 Hoverable)", () => {
		render(
			<Tooltip content="hint" delay={0}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		act(() => {
			vi.advanceTimersByTime(10);
		});
		fireEvent.mouseLeave(screen.getByRole("button"));
		// 유예 시간 안에 툴팁 위로 포인터 이동 → 열림 유지
		const positionWrap = screen.getByRole("tooltip").parentElement as HTMLElement;
		fireEvent.mouseEnter(positionWrap);
		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
		// 툴팁에서 떠나면 유예 후 닫힘
		fireEvent.mouseLeave(positionWrap);
		act(() => {
			vi.advanceTimersByTime(150);
		});
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("dismisses with Escape without moving the pointer (WCAG 1.4.13 Dismissable)", () => {
		render(
			<Tooltip content="hint" delay={0}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		act(() => {
			vi.advanceTimersByTime(10);
		});
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();

		fireEvent.keyDown(document.body, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("disabled=true: never shows tooltip", () => {
		render(
			<Tooltip content="hint" disabled>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("applies placement class", () => {
		render(
			<Tooltip content="hint" delay={0} placement="bottom">
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		act(() => {
			vi.advanceTimersByTime(10);
		});
		expect(screen.getByRole("tooltip")).toHaveClass("tooltip_placement_bottom");
	});
});
