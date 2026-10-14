import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { TimePicker } from "./index";

// Dropdown 트리거는 `combobox` 다(#632 - `button` role 로는 aria-required 를 못 붙인다).
// 이름이 라벨 + 현재 값이라 값에 따라 바뀌므로, 순서로 고른다 - 시, 분.
const hourTrigger = () => screen.getAllByRole("combobox")[0]!;
const minuteTrigger = () => screen.getAllByRole("combobox")[1]!;

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

	it("passes the Field's required state down to the hour and minute dropdowns", () => {
		render(
			<Field name="start" label="시작 시각" required>
				<TimePicker onValueChange={vi.fn()} />
			</Field>,
		);

		const controls = screen.getAllByRole("combobox");
		expect(controls).toHaveLength(2);
		for (const control of controls) {
			expect(control).toHaveAttribute("aria-required", "true");
		}
		expect(screen.getByRole("group")).not.toHaveAttribute("aria-required");
	});

	// ── 뮤테이션 테스트(`pnpm test:mutation`)에서 살아남은 분기 ──────────────────────

	it("treats out-of-range or partial values as no value", () => {
		for (const bad of ["24:00", "-1:30", "10:60", "10:-5", "10", "aa:10", "10:5.5"]) {
			const { unmount } = render(<TimePicker value={bad} onValueChange={vi.fn()} />);
			expect(minuteTrigger()).toBeDisabled();
			expect(hourTrigger()).toHaveTextContent("시");
			unmount();
		}
	});

	it("accepts the boundary values 00:00, 23:00 and 10:59", () => {
		for (const [value, h, m] of [
			["00:00", "00", "00"],
			["23:00", "23", "00"],
			["10:59", "10", "59"],
		] as const) {
			const { unmount } = render(
				<TimePicker value={value} minuteStep={1} onValueChange={vi.fn()} />,
			);
			expect(hourTrigger()).toHaveTextContent(h);
			expect(minuteTrigger()).toHaveTextContent(m);
			expect(minuteTrigger()).toBeEnabled();
			unmount();
		}
	});

	it("shows the default labels as placeholders and the default range up to 23:59", () => {
		render(<TimePicker value="23:00" minuteStep={1} onValueChange={vi.fn()} />);
		expect(openAndRead(hourTrigger()).at(-1)).toBe("23");
		fireEvent.keyDown(hourTrigger(), { key: "Escape" });
		expect(openAndRead(minuteTrigger()).at(-1)).toBe("59");
	});

	it("shows placeholders without a value", () => {
		render(<TimePicker onValueChange={vi.fn()} />);
		expect(hourTrigger()).toHaveTextContent("시");
		expect(minuteTrigger()).toHaveTextContent("분");
	});

	it("includes the maximum minute at the boundary hour", () => {
		render(<TimePicker value="10:00" minuteStep={15} maxTime="10:30" onValueChange={vi.fn()} />);
		expect(openAndRead(minuteTrigger())).toEqual(["00", "15", "30"]);
	});

	it("snaps to the first stepped minute inside minTime when the hour changes", () => {
		const onValueChange = vi.fn();
		render(
			<TimePicker value="10:00" minuteStep={15} minTime="09:20" onValueChange={onValueChange} />,
		);
		fireEvent.click(hourTrigger());
		fireEvent.click(screen.getByRole("option", { name: "09" }));
		expect(onValueChange).toHaveBeenCalledWith("09:30");
	});

	it("keeps a minute that sits exactly on maxTime when the hour changes", () => {
		const onValueChange = vi.fn();
		render(
			<TimePicker value="10:15" minuteStep={15} maxTime="14:15" onValueChange={onValueChange} />,
		);
		fireEvent.click(hourTrigger());
		fireEvent.click(screen.getByRole("option", { name: "14" }));
		expect(onValueChange).toHaveBeenCalledWith("14:15");
	});

	it("emits nothing for an hour that has no stepped minute in range", () => {
		// 09:50 이 최소인데 30분 간격이면 09시에 고를 분이 없다
		const onValueChange = vi.fn();
		render(
			<TimePicker value="10:00" minuteStep={30} minTime="09:50" onValueChange={onValueChange} />,
		);
		fireEvent.click(hourTrigger());
		fireEvent.click(screen.getByRole("option", { name: "09" }));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("starts at the first minute when an hour is picked with no value yet", () => {
		const onValueChange = vi.fn();
		render(<TimePicker onValueChange={onValueChange} />);
		fireEvent.click(hourTrigger());
		fireEvent.click(screen.getByRole("option", { name: "10" }));
		expect(onValueChange).toHaveBeenCalledWith("10:00");
	});

	it("announces a one-sided range and nothing without a range", () => {
		const { container, rerender } = render(
			<TimePicker value="10:00" minTime="09:00" onValueChange={vi.fn()} />,
		);
		const sr = () => container.querySelector(".time_picker_sr_only");
		expect(sr()).toHaveTextContent("09:00 부터 23:59 까지 선택 가능");
		expect(screen.getByRole("group").getAttribute("aria-describedby")).toBe(sr()?.id);

		rerender(<TimePicker value="10:00" onValueChange={vi.fn()} />);
		expect(sr()).toBeNull();
		expect(screen.getByRole("group")).not.toHaveAttribute("aria-describedby");
	});

	it("names the group from its label and drops full width when asked", () => {
		const { container, rerender } = render(<TimePicker label="픽업" onValueChange={vi.fn()} />);
		const label = container.querySelector(".time_picker_label") as HTMLElement;
		expect(label).toHaveTextContent("픽업");
		expect(screen.getByRole("group")).toHaveAttribute("aria-labelledby", label.id);
		expect(container.firstChild).toHaveClass("time_picker_full_width");

		rerender(<TimePicker onValueChange={vi.fn()} fullWidth={false} />);
		expect(container.querySelector(".time_picker_label")).toBeNull();
		expect(screen.getByRole("group")).not.toHaveAttribute("aria-labelledby");
		expect(container.firstChild).not.toHaveClass("time_picker_full_width");
	});

	it("marks required from the prop and invalid only inside an invalid Field", () => {
		const { rerender } = render(<TimePicker onValueChange={vi.fn()} />);
		expect(hourTrigger()).not.toHaveAttribute("aria-required");
		expect(screen.getByRole("group")).not.toHaveAttribute("aria-invalid");

		rerender(<TimePicker onValueChange={vi.fn()} required />);
		expect(hourTrigger()).toHaveAttribute("aria-required", "true");

		rerender(
			<Field name="t" label="시각" error="필수">
				<TimePicker onValueChange={vi.fn()} />
			</Field>,
		);
		expect(screen.getByRole("group")).toHaveAttribute("aria-invalid", "true");
		const labelledBy = screen.getByRole("group").getAttribute("aria-labelledby") ?? "";
		expect(document.getElementById(labelledBy)).toHaveTextContent("시각");
	});
});
