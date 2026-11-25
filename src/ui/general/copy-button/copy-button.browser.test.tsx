import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "../button/style.scss";
import { CopyButton } from "./index";

const setWriteText = (writeText: () => Promise<void>) =>
	Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

// 복사됨 · 실패를 모양으로도 보인다 (#1158) - 색 · 아이콘이 바뀌고 단추 폭은 그대로다
describe("CopyButton states (Chromium, #1158)", () => {
	afterEach(() => {
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
	});

	it.each([
		["copied", () => Promise.resolve()],
		["failed", () => Promise.reject(new Error("denied"))],
	] as const)(
		"shows the %s state in colour without changing the width",
		async (state, writeText) => {
			setWriteText(writeText);
			render(<CopyButton text="x" label="설정 복사" copiedLabel="복사됨" />);
			const button = screen.getByRole("button");
			const idle = {
				width: button.getBoundingClientRect().width,
				color: getComputedStyle(button).color,
			};

			await act(async () => {
				fireEvent.click(button);
			});
			expect(button).toHaveClass(`copy_button_${state}`);
			expect(button.getBoundingClientRect().width).toBe(idle.width);
			expect(getComputedStyle(button).color).not.toBe(idle.color);
		},
	);

	it("reserves the longer label so a short label does not jump when it reads 복사됨", async () => {
		setWriteText(() => Promise.resolve());
		render(<CopyButton text="x" label="복사" copiedLabel="복사했습니다" />);
		const button = screen.getByRole("button");
		const before = button.getBoundingClientRect().width;
		await act(async () => {
			fireEvent.click(button);
		});
		expect(button.getBoundingClientRect().width).toBe(before);
	});
});
