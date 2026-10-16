import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { SegmentedControl } from "./index";

const currencies = [
	{ value: "USD", label: "USD" },
	{ value: "KRW", label: "KRW" },
	{ value: "JPY", label: "JPY" },
];

describe("SegmentedControl", () => {
	it("is a radiogroup of radios with the selected one checked", () => {
		render(<SegmentedControl aria-label="통화" items={currencies} value="KRW" />);
		const group = screen.getByRole("radiogroup", { name: "통화" });
		const radios = screen.getAllByRole("radio");
		expect(group).toContainElement(radios[0]!);
		expect(radios.map((r) => (r as HTMLInputElement).checked)).toEqual([false, true, false]);
		expect(screen.getByRole("radio", { name: "KRW" }).closest("label")).toHaveClass(
			"segmented_control_item_selected",
		);
	});

	it("reports the picked value and stays controlled", () => {
		const onValueChange = vi.fn();
		render(
			<SegmentedControl
				aria-label="통화"
				items={currencies}
				value="USD"
				onValueChange={onValueChange}
			/>,
		);
		fireEvent.click(screen.getByRole("radio", { name: "JPY" }));
		expect(onValueChange).toHaveBeenCalledWith("JPY");
		// 부모가 value 를 바꾸지 않았으니 USD 그대로
		expect(screen.getByRole("radio", { name: "USD" })).toBeChecked();
	});

	it("tracks its own value when uncontrolled", () => {
		render(<SegmentedControl aria-label="통화" items={currencies} defaultValue="USD" />);
		fireEvent.click(screen.getByRole("radio", { name: "KRW" }));
		expect(screen.getByRole("radio", { name: "KRW" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "USD" })).not.toBeChecked();
	});

	it("jumps to the first and last enabled item with Home and End", () => {
		const onValueChange = vi.fn();
		render(
			<SegmentedControl
				aria-label="통화"
				items={[{ value: "A", label: "A", disabled: true }, ...currencies]}
				defaultValue="KRW"
				onValueChange={onValueChange}
			/>,
		);
		const krw = screen.getByRole("radio", { name: "KRW" });
		krw.focus();
		fireEvent.keyDown(krw, { key: "End" });
		expect(onValueChange).toHaveBeenLastCalledWith("JPY");
		expect(screen.getByRole("radio", { name: "JPY" })).toHaveFocus();
		fireEvent.keyDown(document.activeElement as Element, { key: "Home" });
		// 비활성 A 를 건너뛴다
		expect(onValueChange).toHaveBeenLastCalledWith("USD");
		expect(screen.getByRole("radio", { name: "USD" })).toHaveFocus();
	});

	it("ignores other keys", () => {
		const onValueChange = vi.fn();
		render(<SegmentedControl aria-label="통화" items={currencies} onValueChange={onValueChange} />);
		fireEvent.keyDown(screen.getAllByRole("radio")[0]!, { key: "a" });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("disables every item, or just one", () => {
		const { rerender } = render(<SegmentedControl aria-label="통화" items={currencies} disabled />);
		for (const r of screen.getAllByRole("radio")) expect(r).toBeDisabled();
		expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");

		rerender(
			<SegmentedControl
				aria-label="통화"
				items={[currencies[0]!, { ...currencies[1]!, disabled: true }]}
			/>,
		);
		expect(screen.getByRole("radio", { name: "USD" })).toBeEnabled();
		expect(screen.getByRole("radio", { name: "KRW" })).toBeDisabled();
		expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-disabled");
	});

	it("names icon-only items from ariaLabel and hides the icon", () => {
		render(
			<SegmentedControl
				aria-label="보기"
				items={[
					{ value: "list", icon: <svg data-testid="i" />, ariaLabel: "목록" },
					{ value: "grid", icon: <svg />, ariaLabel: "격자" },
				]}
			/>,
		);
		expect(screen.getByRole("radio", { name: "목록" })).toBeInTheDocument();
		expect(screen.getByTestId("i").parentElement).toHaveAttribute("aria-hidden", "true");
	});

	it("submits its value under a shared name and marks the group required", () => {
		const { container } = render(
			<form>
				<SegmentedControl
					aria-label="통화"
					items={currencies}
					name="currency"
					defaultValue="KRW"
					required
				/>
			</form>,
		);
		const form = container.querySelector("form") as HTMLFormElement;
		expect(new FormData(form).get("currency")).toBe("KRW");
		expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
		const radios = screen.getAllByRole("radio") as HTMLInputElement[];
		expect(radios.map((r) => r.name)).toEqual(["currency", "currency", "currency"]);
		expect(radios[0]).toBeRequired();
	});

	it("takes its name, description, error and required state from Field", () => {
		render(
			<Field name="currency" label="통화" help="결제 통화" error="고르세요" required>
				<SegmentedControl items={currencies} />
			</Field>,
		);
		const group = screen.getByRole("radiogroup", { name: "통화" });
		expect(group).toHaveAttribute("aria-invalid", "true");
		expect(group).toHaveAttribute("aria-required", "true");
		expect(group.getAttribute("aria-describedby")).toBeTruthy();
	});

	it("applies size and fullWidth classes and forwards className", () => {
		const { container, rerender } = render(
			<SegmentedControl aria-label="통화" items={currencies} className="x" />,
		);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("segmented_control", "segmented_control_size_md", "x");
		expect(root).not.toHaveClass("segmented_control_full_width");
		rerender(<SegmentedControl aria-label="통화" items={currencies} size="sm" fullWidth />);
		expect(root).toHaveClass("segmented_control_size_sm", "segmented_control_full_width");
	});

	it("keeps the generic value type", () => {
		type Locale = "ko" | "en";
		const Demo = () => {
			const [v, setV] = React.useState<Locale>("ko");
			return (
				<SegmentedControl<Locale>
					aria-label="언어"
					value={v}
					onValueChange={setV}
					items={[
						{ value: "ko", label: "KO" },
						{ value: "en", label: "EN" },
					]}
				/>
			);
		};
		render(<Demo />);
		fireEvent.click(screen.getByRole("radio", { name: "EN" }));
		expect(screen.getByRole("radio", { name: "EN" })).toBeChecked();
	});
});
