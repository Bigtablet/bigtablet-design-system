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

	it("hides on mouseLeave", () => {
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
