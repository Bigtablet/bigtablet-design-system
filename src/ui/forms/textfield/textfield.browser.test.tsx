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
// 결함은 데스크톱 폭에서만 드러난다(모바일은 상자가 48px 이상이라 40px 칸이 들어간다). 모바일은
// 칸이 늘어난 상자를 따라가도 높이가 그대로인지를 본다.
describe.each([
	["desktop", 1280, 800],
	["mobile", 375, 667],
] as const)("TextField icon slot height at %s width (Chromium)", (_, width, height) => {
	beforeEach(async () => {
		await page.viewport(width, height);
	});

	const measure = (node: React.ReactElement) => {
		const { container, unmount } = render(node);
		const box = (
			container.querySelector(".text_field_container") as HTMLElement
		).getBoundingClientRect();
		const button = container.querySelector("button")?.getBoundingClientRect();
		unmount();
		return { box: box.height, button };
	};

	it.each(["sm", "md", "lg"] as const)(
		"keeps the %s box height with an icon, action or clear button",
		(size) => {
			const plain = measure(<TextField aria-label="검색" size={size} />).box;
			expect(measure(<TextField aria-label="검색" size={size} trailingIcon={<svg />} />).box).toBe(
				plain,
			);
			expect(measure(<TextField aria-label="검색" size={size} leadingIcon={<svg />} />).box).toBe(
				plain,
			);
			for (const slotted of [
				<TextField
					key="action"
					aria-label="검색"
					size={size}
					trailingAction={<button type="button">x</button>}
				/>,
				<TextField key="clear" aria-label="검색" size={size} clearable defaultValue="값" />,
			]) {
				const { box, button } = measure(slotted);
				expect(box).toBe(plain);
				// 늘어난 칸을 누름 영역으로 쓴다 - WCAG 2.5.8 의 24×24 를 넘어야 한다
				expect(button?.width).toBeGreaterThanOrEqual(24);
				expect(button?.height).toBeGreaterThanOrEqual(24);
			}
		},
	);
});
