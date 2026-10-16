import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../../system/locale-provider";
import { TextField } from "../textfield";
import { FilterBar } from "./index";

const setup = (props: Partial<React.ComponentProps<typeof FilterBar>> = {}) => {
	const onSubmit = vi.fn();
	const utils = render(
		<FilterBar onSubmit={onSubmit} {...props}>
			<TextField label="이름" />
		</FilterBar>,
	);
	return { onSubmit, ...utils };
};

describe("FilterBar", () => {
	it("is a search landmark form that submits on Enter without navigating", () => {
		const { onSubmit } = setup();
		const form = screen.getByRole("search");
		expect(form.tagName).toBe("FORM");
		const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
		form.dispatchEvent(submitEvent);
		expect(submitEvent.defaultPrevented).toBe(true);
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("submits from the search button", () => {
		const { onSubmit } = setup();
		fireEvent.click(screen.getByRole("button", { name: "검색" }));
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("blocks Enter and the button when canSubmit is false or disabled", () => {
		for (const blocked of [{ canSubmit: false }, { disabled: true }]) {
			const { onSubmit, unmount } = setup(blocked);
			expect(screen.getByRole("button", { name: "검색" })).toBeDisabled();
			fireEvent.submit(screen.getByRole("search"));
			expect(onSubmit).not.toHaveBeenCalled();
			unmount();
		}
	});

	it("keeps the button focusable while loading but blocks submitting", () => {
		const { onSubmit } = setup({ loading: true });
		const button = screen.getByRole("button", { name: "검색" });
		button.focus();
		// disabled 로 바꾸면 포커스가 body 로 빠진다 - aria-disabled 로 막는다
		expect(button).toBeEnabled();
		expect(button).toHaveAttribute("aria-disabled", "true");
		expect(button).toHaveFocus();
		fireEvent.click(button);
		fireEvent.submit(screen.getByRole("search"));
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("marks the form busy and shows a decorative spinner while loading", () => {
		setup({ loading: true });
		expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "true");
		// 이름이 "검색" 그대로 - 스피너 라벨이 붙어 "검색 검색" 이 되지 않는다
		const button = screen.getByRole("button", { name: "검색" });
		expect(button.querySelector("[aria-hidden='true'] [role='status']")).not.toBeNull();
		expect(screen.queryByRole("status")).toBeNull();
	});

	it("shows a reset button only with onReset and keeps it apart from submit", () => {
		const { rerender, onSubmit } = setup();
		expect(screen.queryByRole("button", { name: "초기화" })).toBeNull();

		const onReset = vi.fn();
		rerender(
			<FilterBar onSubmit={onSubmit} onReset={onReset}>
				<TextField label="이름" />
			</FilterBar>,
		);
		const reset = screen.getByRole("button", { name: "초기화" });
		expect(reset).toHaveAttribute("type", "button");
		fireEvent.click(reset);
		expect(onReset).toHaveBeenCalledTimes(1);
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("disables reset on its own with canReset=false, and both with disabled", () => {
		const { rerender, onSubmit } = setup({ onReset: () => {}, canReset: false });
		expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "검색" })).toBeEnabled();

		rerender(
			<FilterBar onSubmit={onSubmit} onReset={() => {}} disabled>
				<TextField label="이름" />
			</FilterBar>,
		);
		expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "검색" })).toBeDisabled();
	});

	it("takes button labels from props or the locale catalog", () => {
		const { unmount } = setup({ onReset: () => {}, submitLabel: "조회", resetLabel: "비우기" });
		expect(screen.getByRole("button", { name: "조회" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "비우기" })).toBeInTheDocument();
		unmount();

		render(
			<LocaleProvider locale="en">
				<FilterBar onSubmit={() => {}} onReset={() => {}}>
					<TextField label="Name" />
				</FilterBar>
			</LocaleProvider>,
		);
		expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
	});

	it("sets the field minimum width and forwards className, style and attributes", () => {
		const { rerender, onSubmit } = setup({
			className: "x",
			style: { color: "red" },
			"aria-label": "회원 필터",
		});
		const form = screen.getByRole("search", { name: "회원 필터" });
		expect(form).toHaveClass("filter_bar", "x");
		expect(form.style.getPropertyValue("--filter-bar-field-min")).toBe("200px");
		expect(form.style.color).toBe("red");

		rerender(
			<FilterBar onSubmit={onSubmit} fieldMinWidth="12rem">
				<TextField label="이름" />
			</FilterBar>,
		);
		expect(screen.getByRole("search").style.getPropertyValue("--filter-bar-field-min")).toBe(
			"12rem",
		);
	});
});
