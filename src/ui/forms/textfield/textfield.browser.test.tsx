import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import "../../../vanilla/scss/_text-field.scss";
import { TextField } from "./index";
import "./style.scss";

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

// 아이콘 칸이 40px 고정이던 동안 sm · md 상자(테두리 안 38px)가 42px 로 부풀었다 - 검색 칸이 로딩
// 스피너를 trailingIcon 으로 넣었다 뺄 때마다 2px 씩 출렁였다 (#1151)
describe("TextField icon slot height (Chromium)", () => {
	// 모바일 폭은 상자가 48px 라 40px 칸이 들어가 결함이 안 드러난다 - 데스크톱 폭에서 잰다
	beforeEach(async () => {
		await page.viewport(1280, 800);
	});

	const heightOf = (node: React.ReactElement) => {
		const { container, unmount } = render(node);
		const h = (
			container.querySelector(".text_field_container") as HTMLElement
		).getBoundingClientRect().height;
		unmount();
		return h;
	};

	it.each(["sm", "md", "lg"] as const)(
		"keeps the %s box height with an icon, action or clear button",
		(size) => {
			const plain = heightOf(<TextField aria-label="검색" size={size} />);
			expect(heightOf(<TextField aria-label="검색" size={size} trailingIcon={<svg />} />)).toBe(
				plain,
			);
			expect(heightOf(<TextField aria-label="검색" size={size} leadingIcon={<svg />} />)).toBe(
				plain,
			);
			expect(
				heightOf(
					<TextField
						aria-label="검색"
						size={size}
						trailingAction={<button type="button">x</button>}
					/>,
				),
			).toBe(plain);
			expect(
				heightOf(<TextField aria-label="검색" size={size} clearable defaultValue="값" />),
			).toBe(plain);
		},
	);
});
