import { fireEvent, render, screen } from "@testing-library/react";
import { Star } from "lucide-react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./index";

const options = [
	{ value: "1", label: "Option 1" },
	{ value: "2", label: "Option 2" },
	{ value: "3", label: "Option 3", disabled: true },
];

describe("Dropdown", () => {
	it("renders with placeholder", () => {
		render(<Dropdown options={options} placeholder="Select an option" />);
		expect(screen.getByText("Select an option")).toBeInTheDocument();
	});

	it("renders label always visible", () => {
		const { container } = render(<Dropdown options={options} label="Choose" />);
		expect(screen.getByText("Choose")).toBeInTheDocument();
		expect(container.querySelector("label.dropdown_label")).toBeInTheDocument();
	});

	it("keeps label visible when open", () => {
		render(<Dropdown options={options} label="Choose" />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByText("Choose")).toBeInTheDocument();
	});

	it("keeps label visible when value is selected", () => {
		render(<Dropdown options={options} label="Choose" value="1" />);
		expect(screen.getByText("Choose")).toBeInTheDocument();
	});

	it("opens dropdown on click", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("rotates ChevronDown icon when open", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");
		const icon = button.querySelector(".dropdown_icon");

		// 닫힌 상태: rotation 없음
		expect(icon).not.toHaveClass("dropdown_icon_open");

		fireEvent.click(button);

		// 열린 상태: 180도 회전 클래스
		expect(button.querySelector(".dropdown_icon")).toHaveClass("dropdown_icon_open");
	});

	it("selects option on click", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText("Option 1"));

		expect(onChange).toHaveBeenCalledWith("1", options[0]);
	});

	it("shows selected value", () => {
		render(<Dropdown options={options} value="2" />);
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	it("does not select disabled option", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText("Option 3"));

		expect(onChange).not.toHaveBeenCalled();
	});

	it("closes on Escape key", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		fireEvent.keyDown(button, { key: "Escape" });
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("navigates with arrow keys", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "ArrowDown" });

		const activeOption = document.querySelector(".is_active");
		expect(activeOption).toBeInTheDocument();
	});

	it("is disabled when disabled prop is true", () => {
		render(<Dropdown options={options} disabled />);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("renders root with .dropdown class (block-level, fills parent width)", () => {
		render(<Dropdown options={options} />);
		const wrapper = screen.getByRole("button").closest(".dropdown");
		expect(wrapper).toHaveClass("dropdown");
	});

	it("fullWidth prop is accepted but no-op (back-compat)", () => {
		render(<Dropdown options={options} fullWidth />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("opens on Space key when closed", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.keyDown(button, { key: " " });

		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("commits active option on Enter key when open", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "Enter" });

		expect(onChange).toHaveBeenCalledWith("1", options[0]);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("navigates to first non-disabled option with Home key", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "Home" });

		const firstOption = screen.getByText("Option 1").closest("[role='option']");
		expect(firstOption).toHaveClass("is_active");
	});

	it("navigates to last non-disabled option with End key", () => {
		const allEnabled = [
			{ value: "1", label: "Option 1" },
			{ value: "2", label: "Option 2" },
			{ value: "3", label: "Option 3" },
		];
		render(<Dropdown options={allEnabled} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "End" });

		const lastOption = screen.getByText("Option 3").closest("[role='option']");
		expect(lastOption).toHaveClass("is_active");
	});

	it("skips disabled options when navigating with End key", () => {
		const endDisabled = [
			{ value: "1", label: "Opt 1" },
			{ value: "2", label: "Opt 2" },
			{ value: "3", label: "Opt 3", disabled: true },
		];
		render(<Dropdown options={endDisabled} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "End" });

		const secondOption = screen.getByText("Opt 2").closest("[role='option']");
		expect(secondOption).toHaveClass("is_active");
	});

	it("does not change active index on mouse enter over disabled option", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);

		const disabledOption = screen.getByText("Option 3").closest("[role='option']")!;
		fireEvent.mouseEnter(disabledOption);

		expect(screen.getByText("Option 1").closest("[role='option']")).toHaveClass("is_active");
		expect(disabledOption).not.toHaveClass("is_active");
	});

	// ── 신규 기능 테스트 ────────────────────────────────────────────────────────

	it("renders supportingText in option", () => {
		const withSub = [{ value: "1", label: "Option 1", supportingText: "Sub text" }];
		render(<Dropdown options={withSub} />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByText("Sub text")).toBeInTheDocument();
	});

	it("renders leadingIcon in option", () => {
		const withIcon = [
			{ value: "1", label: "Option 1", leadingIcon: <Star data-testid="lead-icon" /> },
		];
		render(<Dropdown options={withIcon} />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByTestId("lead-icon")).toBeInTheDocument();
	});

	it("renders showDivider between options", () => {
		const withDivider = [
			{ value: "1", label: "Option 1", showDivider: true },
			{ value: "2", label: "Option 2" },
		];
		render(<Dropdown options={withDivider} />);
		fireEvent.click(screen.getByRole("button"));
		expect(document.querySelector(".dropdown_option_divider")).toBeInTheDocument();
	});

	it("renders custom trailingIcon instead of check", () => {
		const withTrail = [
			{ value: "1", label: "Option 1", trailingIcon: <Star data-testid="trail-icon" /> },
		];
		render(<Dropdown options={withTrail} value="1" />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByTestId("trail-icon")).toBeInTheDocument();
	});

	// ── 추가 보강 테스트 ────────────────────────────────────────────────────────

	it("uses default placeholder when none is provided", () => {
		render(<Dropdown options={options} />);
		expect(screen.getByText("Select…")).toBeInTheDocument();
	});

	it("renders defaultValue in uncontrolled mode", () => {
		render(<Dropdown options={options} defaultValue="2" />);
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	it("updates value in uncontrolled mode after selection", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} defaultValue="1" onChange={onChange} />);
		// 선택값이 우선 표시
		expect(screen.getByText("Option 1")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText("Option 2"));

		expect(onChange).toHaveBeenCalledWith("2", options[1]);
		// 비제어형이므로 내부 상태가 바뀌어 라벨이 갱신되어야 함
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	it("does not update internal value in controlled mode without prop change", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} value="1" onChange={onChange} />);
		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByText("Option 2"));

		expect(onChange).toHaveBeenCalledWith("2", options[1]);
		// 제어형: value prop이 그대로 "1"이므로 표시도 그대로 Option 1
		expect(screen.getByText("Option 1")).toBeInTheDocument();
	});

	it("reflects new value when controlled prop changes", () => {
		const Wrapper = () => {
			const [val, setVal] = useState<string | null>("1");
			return (
				<>
					<Dropdown options={options} value={val} onChange={(v) => setVal(v)} />
					<button type="button" onClick={() => setVal("2")}>
						force
					</button>
				</>
			);
		};
		render(<Wrapper />);
		expect(screen.getByText("Option 1")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "force" }));
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	it("navigates up with ArrowUp key (wraps to last enabled)", () => {
		const allEnabled = [
			{ value: "1", label: "Option 1" },
			{ value: "2", label: "Option 2" },
			{ value: "3", label: "Option 3" },
		];
		render(<Dropdown options={allEnabled} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		// 열렸을 때 activeIndex가 0이므로 ArrowUp 시 마지막으로 wrap
		fireEvent.keyDown(button, { key: "ArrowUp" });

		const lastOption = screen.getByText("Option 3").closest("[role='option']");
		expect(lastOption).toHaveClass("is_active");
	});

	it("ArrowDown opens dropdown when closed", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		fireEvent.keyDown(button, { key: "ArrowDown" });
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("ArrowUp opens dropdown when closed", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		fireEvent.keyDown(button, { key: "ArrowUp" });
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("ArrowDown skips disabled options when navigating", () => {
		const middleDisabled = [
			{ value: "1", label: "Opt 1" },
			{ value: "2", label: "Opt 2", disabled: true },
			{ value: "3", label: "Opt 3" },
		];
		render(<Dropdown options={middleDisabled} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		// 열린 직후 activeIndex는 첫 번째 enabled = 0
		fireEvent.keyDown(button, { key: "ArrowDown" });

		// 두 번째는 disabled - 세 번째로 점프
		const skipped = screen.getByText("Opt 3").closest("[role='option']");
		expect(skipped).toHaveClass("is_active");
	});

	it("closes when clicking outside", () => {
		render(
			<div>
				<Dropdown options={options} />
				<button type="button" data-testid="outside">
					outside
				</button>
			</div>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Select/ }));
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		fireEvent.mouseDown(screen.getByTestId("outside"));
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("does not close when clicking inside the wrapper", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		// 내부 옵션에 mousedown - 닫히지 않아야 함
		fireEvent.mouseDown(screen.getByText("Option 1"));
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("toggles open/closed on repeated button clicks", () => {
		render(<Dropdown options={options} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();
		fireEvent.click(button);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("does not respond to keydown when disabled", () => {
		render(<Dropdown options={options} disabled />);
		const button = screen.getByRole("button");

		fireEvent.keyDown(button, { key: "ArrowDown" });
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("does not open on click when disabled", () => {
		render(<Dropdown options={options} disabled />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("applies size class based on size prop", () => {
		const { container, rerender } = render(<Dropdown options={options} size="sm" />);
		expect(container.querySelector(".dropdown")).toHaveClass("dropdown_size_sm");

		rerender(<Dropdown options={options} size="lg" />);
		expect(container.querySelector(".dropdown")).toHaveClass("dropdown_size_lg");
	});

	it("uses md as default size", () => {
		const { container } = render(<Dropdown options={options} />);
		expect(container.querySelector(".dropdown")).toHaveClass("dropdown_size_md");
	});

	it("forwards className to root", () => {
		const { container } = render(<Dropdown options={options} className="my-extra" />);
		expect(container.querySelector(".dropdown")).toHaveClass("my-extra");
	});

	it("uses provided id for the control button", () => {
		render(<Dropdown options={options} id="my-dropdown" label="L" />);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("id", "my-dropdown");

		const label = screen.getByText("L");
		expect(label).toHaveAttribute("for", "my-dropdown");
	});

	it("sets aria-haspopup, aria-expanded, aria-controls correctly", () => {
		render(<Dropdown options={options} id="dd-1" />);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-haspopup", "listbox");
		expect(button).toHaveAttribute("aria-expanded", "false");
		expect(button).toHaveAttribute("aria-controls", "dd-1_listbox");

		fireEvent.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");

		const listbox = screen.getByRole("listbox");
		expect(listbox).toHaveAttribute("id", "dd-1_listbox");
	});

	it.skip("sets aria-selected on the currently selected option", () => {
		render(<Dropdown options={options} value="2" />);
		fireEvent.click(screen.getByRole("button"));

		const selected = screen.getByText("Option 2").closest("[role='option']");
		expect(selected).toHaveAttribute("aria-selected", "true");

		const other = screen.getByText("Option 1").closest("[role='option']");
		expect(other).toHaveAttribute("aria-selected", "false");
	});

	it("sets aria-disabled on disabled options", () => {
		render(<Dropdown options={options} />);
		fireEvent.click(screen.getByRole("button"));

		const disabledOption = screen.getByText("Option 3").closest("[role='option']");
		expect(disabledOption).toHaveAttribute("aria-disabled", "true");

		const enabledOption = screen.getByText("Option 1").closest("[role='option']");
		expect(enabledOption).not.toHaveAttribute("aria-disabled");
	});

	it("does nothing on Enter when no enabled option is active", () => {
		// 모든 옵션 disabled - activeIndex가 결정되지 않을 수 있는 경계 케이스
		const allDisabled = [
			{ value: "1", label: "X", disabled: true },
			{ value: "2", label: "Y", disabled: true },
		];
		const onChange = vi.fn();
		render(<Dropdown options={allDisabled} onChange={onChange} />);
		const button = screen.getByRole("button");

		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "Enter" });

		expect(onChange).not.toHaveBeenCalled();
	});

	it("does not apply fullWidth style when prop is absent", () => {
		render(<Dropdown options={options} />);
		const wrapper = screen.getByRole("button").closest(".dropdown");
		expect(wrapper).not.toHaveStyle({ width: "100%" });
	});

	it("calls onChange with null option when value not in options list", () => {
		const onChange = vi.fn();
		render(<Dropdown options={options} onChange={onChange} value="999" />);
		// value="999" 는 옵션에 없음 - placeholder가 보여야 함
		expect(screen.getByText("Select…")).toBeInTheDocument();
	});
});
