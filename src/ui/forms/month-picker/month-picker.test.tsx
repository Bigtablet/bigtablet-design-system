import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonthPicker } from "./index";

const triggers = () => screen.getAllByRole("combobox");
const openAndRead = (index: number) => {
	fireEvent.click(triggers()[index]!);
	return screen.getAllByRole("option").map((o) => o.textContent);
};

describe("MonthPicker", () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date(2026, 8, 15));
	});
	afterEach(() => vi.useRealTimers());

	it("연 · 월 두 칸만 그리고 YYYY-MM 을 내보낸다", () => {
		const onValueChange = vi.fn();
		render(<MonthPicker value="2026-03" onValueChange={onValueChange} />);

		expect(triggers()).toHaveLength(2);
		fireEvent.click(triggers()[1]!);
		fireEvent.click(screen.getByRole("option", { name: "05" }));
		expect(onValueChange).toHaveBeenCalledWith("2026-05");
	});

	it("min · max 를 YYYY-MM 으로 받는다", () => {
		render(<MonthPicker value="2025-01" min="2024-11" max="2025-02" onValueChange={vi.fn()} />);

		expect(openAndRead(0)).toEqual(["2024", "2025"]);
	});

	it("경계 해에서는 월도 좁힌다", () => {
		render(<MonthPicker value="2025-01" min="2024-11" max="2025-02" onValueChange={vi.fn()} />);

		expect(openAndRead(1)).toEqual(["01", "02"]);
	});

	it('max="today" 면 이번 달까지다', () => {
		render(<MonthPicker value="2026-01" max="today" onValueChange={vi.fn()} />);

		expect(openAndRead(1).at(-1)).toBe("09");
	});
});
