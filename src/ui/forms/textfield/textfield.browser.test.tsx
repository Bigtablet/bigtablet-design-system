import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import "../../../vanilla/scss/_text-field.scss";

// Vanilla TextField 는 React 처럼 테두리색으로만 포커스를 보인다 - 텍스트 입력은 마우스로 눌러도
// :focus-visible 이라 링이면 클릭할 때마다 두꺼운 링이 떴다 (#936)
describe("Vanilla TextField focus (Chromium)", () => {
	const mount = (modifier: string) => {
		const { container } = render(<span />);
		container.insertAdjacentHTML(
			"beforeend",
			`<input aria-label="이름" class="bt-text-field__input bt-text-field__input--md ${modifier}">`,
		);
		return container.querySelector("input") as HTMLInputElement;
	};

	it.each([
		["bt-text-field__input--outline", "rgb(18, 18, 18)"],
		["bt-text-field__input--filled", "rgb(18, 18, 18)"],
		["bt-text-field__input--outline bt-text-field__input--error", null],
	])("shows %s focus with the border colour and no ring", async (modifier, border) => {
		const input = mount(modifier);
		const before = getComputedStyle(input).borderColor;
		await userEvent.click(input);
		expect(input).toHaveFocus();
		expect(getComputedStyle(input).boxShadow).toBe("none");
		// 오류 칸은 포커스 때도 상태색 테두리를 지킨다
		expect(getComputedStyle(input).borderColor).toBe(border ?? before);
	});
});
