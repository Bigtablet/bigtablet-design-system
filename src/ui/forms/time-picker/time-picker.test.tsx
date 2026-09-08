import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./index";

// Dropdown 트리거는 button 이다 (role=combobox 는 searchable 입력 쪽). 순서로 고른다 - 시, 분.
const hourTrigger = () => screen.getAllByRole("button")[0];
const minuteTrigger = () => screen.getAllByRole("button")[1];

/** Dropdown 을 열고 보이는 옵션 라벨을 읽는다 */
const openAndRead = (trigger: HTMLElement) => {
	fireEvent.click(trigger);
	return screen.getAllByRole("option").map((o) => o.textContent);
};

describe("TimePicker", () => {
	it("emits HH:mm", () => {
		const onValueChange = vi.fn();
		render(<TimePicker value="09:00" onValueChange={onValueChange} minuteStep={30} />);

		fireEvent.click(minuteTrigger());
		fireEvent.click(screen.getByRole("option", { name: "30" }));

		expect(onValueChange).toHaveBeenCalledWith("09:30");
	});

	it("steps the minutes", () => {
		// 60개를 다 그리면 고르기 어렵다. 예약·근무는 5분·30분 단위다.
		render(<TimePicker value="09:00" onValueChange={vi.fn()} minuteStep={15} />);

		expect(openAndRead(minuteTrigger())).toEqual(["00", "15", "30", "45"]);
	});

	it("narrows the hours to the allowed range", () => {
		// 분만 걸러 두면 09:00 이 최소인데 08시를 고를 수 있고, 그때 분 목록이 비어 막힌다.
		render(<TimePicker value="10:00" onValueChange={vi.fn()} minTime="09:00" maxTime="11:00" />);

		expect(openAndRead(hourTrigger())).toEqual(["09", "10", "11"]);
	});

	it("narrows the minutes at the boundary hour", () => {
		// 최소가 09:30 이면 09시의 분은 30분부터 시작한다.
		render(<TimePicker value="09:30" onValueChange={vi.fn()} minuteStep={15} minTime="09:30" />);

		expect(openAndRead(minuteTrigger())).toEqual(["30", "45"]);
	});

	it("moves the minute into range when the hour changes", () => {
		// 09:00~ 인데 분이 00 인 상태로 09시를 고르면 범위 밖 값이 남는다.
		const onValueChange = vi.fn();
		render(
			<TimePicker value="10:00" onValueChange={onValueChange} minuteStep={30} minTime="09:30" />,
		);

		fireEvent.click(hourTrigger());
		fireEvent.click(screen.getByRole("option", { name: "09" }));

		expect(onValueChange).toHaveBeenCalledWith("09:30");
	});

	it("keeps the minute when it is still allowed", () => {
		const onValueChange = vi.fn();
		render(<TimePicker value="10:30" onValueChange={onValueChange} minuteStep={30} />);

		fireEvent.click(hourTrigger());
		fireEvent.click(screen.getByRole("option", { name: "14" }));

		expect(onValueChange).toHaveBeenCalledWith("14:30");
	});

	it("locks the minutes until an hour is chosen", () => {
		render(<TimePicker onValueChange={vi.fn()} />);

		expect(minuteTrigger()).toBeDisabled();
	});

	it("ignores a malformed value instead of rendering NaN", () => {
		render(<TimePicker value="아무거나" onValueChange={vi.fn()} />);

		expect(minuteTrigger()).toBeDisabled();
		expect(screen.queryByText("NaN")).not.toBeInTheDocument();
	});

	it("announces the allowed range to screen readers", () => {
		const { container } = render(
			<TimePicker value="09:00" onValueChange={vi.fn()} minTime="09:00" maxTime="18:00" />,
		);

		const sr = container.querySelector(".time_picker_sr_only");
		expect(sr).toHaveTextContent("09:00 부터 18:00 까지 선택 가능");
		expect(screen.getByRole("group")).toHaveAttribute(
			"aria-describedby",
			expect.stringContaining(sr?.id ?? ""),
		);
	});
});
