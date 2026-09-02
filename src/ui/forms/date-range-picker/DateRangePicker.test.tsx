import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { DateRangePicker } from "./index";

// DatePicker 는 Dropdown 3개(연·월·일)를 그린다. 두 벌이니 버튼 6개.
const triggers = () => screen.getAllByRole("button");
const pick = (index: number, label: string) => {
	fireEvent.click(triggers()[index]);
	fireEvent.click(screen.getByRole("option", { name: label }));
};

describe("DateRangePicker", () => {
	it("renders a start and an end picker", () => {
		render(<DateRangePicker value={{ start: "2026-05-01" }} onValueChange={vi.fn()} />);

		expect(screen.getByText("시작일")).toBeInTheDocument();
		expect(screen.getByText("종료일")).toBeInTheDocument();
		expect(triggers()).toHaveLength(6);
	});

	it("locks the end picker until a start is chosen", () => {
		// 순서가 뒤집힌 입력을 애초에 막는다.
		const { rerender } = render(<DateRangePicker onValueChange={vi.fn()} />);
		// 종료일 쪽 세 개(index 3~5)가 잠긴다.
		expect(triggers()[3]).toBeDisabled();

		rerender(<DateRangePicker value={{ start: "2026-05-01" }} onValueChange={vi.fn()} />);
		expect(triggers()[3]).not.toBeDisabled();
	});

	it("keeps dates before the start out of the end options", () => {
		// 거꾸로 된 범위는 목록에 아예 없어야 한다.
		render(<DateRangePicker value={{ start: "2026-05-10" }} onValueChange={vi.fn()} />);

		// 종료일의 연 목록을 열면 2026 이 첫 항목이다 (그 이전 연도가 없다).
		fireEvent.click(triggers()[3]);
		const years = screen.getAllByRole("option").map((o) => o.textContent);
		expect(years[0]).toBe("2026");
	});

	it("clears the end date when the start moves past it", () => {
		// 시작일로 맞춰 버리면 사용자가 고르지 않은 날짜가 그대로 조회·저장된다.
		const onValueChange = vi.fn();
		render(
			<DateRangePicker
				value={{ start: "2026-05-01", end: "2026-05-10" }}
				onValueChange={onValueChange}
			/>,
		);

		// 시작일의 월을 6월로 → 2026-06-01 > 2026-05-10
		pick(1, "06");

		expect(onValueChange).toHaveBeenCalledWith({ start: "2026-06-01", end: undefined });
	});

	it("keeps the end date when it is still after the start", () => {
		const onValueChange = vi.fn();
		render(
			<DateRangePicker
				value={{ start: "2026-05-01", end: "2026-08-10" }}
				onValueChange={onValueChange}
			/>,
		);

		pick(1, "06");

		expect(onValueChange).toHaveBeenCalledWith({ start: "2026-06-01", end: "2026-08-10" });
	});

	it("reports the end date without touching the start", () => {
		// 종료일의 일 목록은 연·월이 정해진 뒤에 열린다 (DatePicker 규약) - 값을 준 상태에서 고른다.
		const onValueChange = vi.fn();
		render(
			<DateRangePicker
				value={{ start: "2026-05-01", end: "2026-05-01" }}
				onValueChange={onValueChange}
			/>,
		);

		pick(5, "20");

		expect(onValueChange).toHaveBeenCalledWith({ start: "2026-05-01", end: "2026-05-20" });
	});

	it("nests the two pickers in an outer group", () => {
		// 바깥 그룹 하나 + 안쪽 DatePicker 둘. 구분자("~")는 두지 않는다 - 라벨이 이미 어느
		// 쪽인지 말하고, 좁은 칸에서 줄바꿈되면 구분자만 어중간한 자리에 남는다.
		const { container } = render(<DateRangePicker onValueChange={vi.fn()} />);

		expect(screen.getAllByRole("group")).toHaveLength(3);
		expect(container.querySelector(".date_range_picker_separator")).toBeNull();
	});

	it("points aria-labelledby only at a label that exists", () => {
		// Field 밖에서는 이름 소유자가 없다. 없는 id 를 가리키면 보조기술이 존재하지 않는
		// 요소를 참조한다 (#556 의 aria-controls 와 같은 유형).
		const { container } = render(<DateRangePicker onValueChange={vi.fn()} />);

		const group = container.querySelector(".date_range_picker_fields");
		expect(group).not.toHaveAttribute("aria-labelledby");
	});

	it("takes its group name from a surrounding Field", () => {
		render(
			<Field name="period" label="조회 기간">
				<DateRangePicker onValueChange={vi.fn()} />
			</Field>,
		);

		expect(screen.getAllByRole("group")[0]).toHaveAccessibleName("조회 기간");
	});
});
