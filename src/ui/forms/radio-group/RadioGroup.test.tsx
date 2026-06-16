import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "../radio";
import { RadioGroup } from "./index";

describe("RadioGroup", () => {
	it("renders radiogroup role + label", () => {
		render(
			<RadioGroup label="크기">
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		const group = screen.getByRole("radiogroup", { name: "크기" });
		expect(group).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("shares a name across child radios", () => {
		render(
			<RadioGroup label="g">
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
		expect(a.name).toBeTruthy();
		expect(a.name).toBe(b.name);
	});

	it("uncontrolled: defaultValue selects the matching radio", () => {
		render(
			<RadioGroup label="g" defaultValue="b">
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
		expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
	});

	it("uncontrolled: clicking a radio updates selection + fires onValueChange", () => {
		const onValueChange = vi.fn();
		render(
			<RadioGroup label="g" defaultValue="a" onValueChange={onValueChange}>
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		fireEvent.click(screen.getByRole("radio", { name: "B" }));
		expect(onValueChange).toHaveBeenCalledWith("b");
		expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
	});

	it("controlled: value prop drives selection, click only fires callback", () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<RadioGroup label="g" value="a" onValueChange={onValueChange}>
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		fireEvent.click(screen.getByRole("radio", { name: "B" }));
		expect(onValueChange).toHaveBeenCalledWith("b");
		// controlled — value 그대로면 선택 안 바뀜
		expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
		// 부모가 value 갱신하면 반영
		rerender(
			<RadioGroup label="g" value="b" onValueChange={onValueChange}>
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
	});

	it("propagates size to child radios", () => {
		render(
			<RadioGroup label="g" size="lg">
				<Radio value="a" label="A" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio").closest("label")).toHaveClass("radio_size_lg");
	});

	it("child can override group size", () => {
		render(
			<RadioGroup label="g" size="lg">
				<Radio value="a" label="A" size="sm" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio").closest("label")).toHaveClass("radio_size_sm");
	});

	it("disabled group disables all child radios", () => {
		render(
			<RadioGroup label="g" disabled>
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		for (const r of screen.getAllByRole("radio")) expect(r).toBeDisabled();
	});

	it("error: sets aria-invalid + links supportingText", () => {
		render(
			<RadioGroup label="g" error supportingText="필수 항목">
				<Radio value="a" label="A" />
			</RadioGroup>,
		);
		const group = screen.getByRole("radiogroup");
		expect(group).toHaveAttribute("aria-invalid", "true");
		const helpId = group.getAttribute("aria-describedby");
		expect(helpId).toBeTruthy();
		expect(screen.getByText("필수 항목")).toHaveAttribute("id", helpId as string);
	});

	it("horizontal orientation class", () => {
		const { container } = render(
			<RadioGroup label="g" orientation="horizontal">
				<Radio value="a" label="A" />
			</RadioGroup>,
		);
		expect(container.firstChild).toHaveClass("radio_group_orientation_horizontal");
	});

	it("custom name overrides generated one", () => {
		render(
			<RadioGroup label="g" name="custom">
				<Radio value="a" label="A" />
			</RadioGroup>,
		);
		expect((screen.getByRole("radio") as HTMLInputElement).name).toBe("custom");
	});
});

describe("Radio standalone (no RadioGroup) — 기존 동작 보존", () => {
	it("works with name + defaultChecked outside a group", () => {
		render(<Radio name="t" defaultChecked label="A" />);
		expect(screen.getByRole("radio")).toBeChecked();
	});

	it("fires its own onChange outside a group", () => {
		const onChange = vi.fn();
		render(<Radio name="t" onChange={onChange} label="A" />);
		fireEvent.click(screen.getByRole("radio"));
		expect(onChange).toHaveBeenCalled();
	});
});
