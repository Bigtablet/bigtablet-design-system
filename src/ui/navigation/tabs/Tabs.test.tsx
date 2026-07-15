import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./index";

function Wrapper() {
	const [value, setValue] = React.useState("a");
	return (
		<Tabs value={value} onValueChange={setValue}>
			<TabList ariaLabel="Test tabs">
				<Tab value="a">A</Tab>
				<Tab value="b">B</Tab>
				<Tab value="c">C</Tab>
			</TabList>
			<TabPanel value="a">Panel A</TabPanel>
			<TabPanel value="b">Panel B</TabPanel>
			<TabPanel value="c">Panel C</TabPanel>
		</Tabs>
	);
}

describe("Tabs", () => {
	it("renders tabs and active panel", () => {
		render(<Wrapper />);
		expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByText("Panel A")).toBeInTheDocument();
		expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
	});

	it("changes panel on tab click", () => {
		render(<Wrapper />);
		fireEvent.click(screen.getByRole("tab", { name: "B" }));
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByText("Panel B")).toBeInTheDocument();
	});

	it("supports ArrowRight keyboard navigation", () => {
		render(<Wrapper />);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "ArrowRight" });
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
	});

	it("supports Home/End keys", () => {
		render(<Wrapper />);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "End" });
		expect(screen.getByRole("tab", { name: "C" })).toHaveAttribute("aria-selected", "true");
	});

	it("throws when Tab is used outside Tabs", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<Tab value="a">A</Tab>)).toThrow("[Bigtablet DS]");
		consoleError.mockRestore();
	});

	it("applies aria-label on tablist", () => {
		render(<Wrapper />);
		expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Test tabs");
	});

	it("keeps tabs keyboard-reachable when no tab is selected", () => {
		// 회귀: 선택 탭이 없으면 전부 tabIndex=-1 이 되어 tablist 진입 자체가 불가능했음
		render(
			<Tabs>
				<TabList ariaLabel="t">
					<Tab value="a">A</Tab>
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>,
		);
		expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("tabindex", "0");
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("tabindex", "0");
	});

	it("runs consumer onKeyDown AND keeps arrow navigation ({...props} must not replace it)", () => {
		const onKeyDown = vi.fn();
		render(
			<Tabs defaultValue="a">
				<TabList ariaLabel="t">
					<Tab value="a" onKeyDown={onKeyDown}>
						A
					</Tab>
					<Tab value="b">B</Tab>
				</TabList>
			</Tabs>,
		);
		const tabA = screen.getByRole("tab", { name: "A" });
		tabA.focus();
		fireEvent.keyDown(tabA, { key: "ArrowRight" });

		expect(onKeyDown).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
	});
});
