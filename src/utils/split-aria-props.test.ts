import { describe, expect, it } from "vitest";
import { splitAriaProps } from "./split-aria-props";

describe("splitAriaProps", () => {
	it("sends aria-* to the control and everything else to the wrapper", () => {
		const onClick = () => {};
		const { ariaProps, restProps } = splitAriaProps({
			"aria-label": "검색",
			"aria-describedby": "help",
			"data-testid": "box",
			className: "x",
			onClick,
		});
		expect(ariaProps).toEqual({ "aria-label": "검색", "aria-describedby": "help" });
		expect(restProps).toEqual({ "data-testid": "box", className: "x", onClick });
	});
});
