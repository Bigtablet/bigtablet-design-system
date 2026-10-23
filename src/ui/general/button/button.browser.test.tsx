/// <reference types="@vitest/browser-playwright" />
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cdp, userEvent } from "vitest/browser";
import { Button } from "./index";
import "./style.scss";

const emulateForcedColors = (value: "active" | "none") =>
	cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value }] });

const focusButtonByKeyboard = async () => {
	render(
		<>
			<button type="button">앞</button>
			<Button>저장</Button>
		</>,
	);
	await userEvent.click(screen.getByRole("button", { name: "앞" }));
	await userEvent.keyboard("{Tab}");
	const button = screen.getByRole("button", { name: "저장" });
	expect(button).toHaveFocus();
	expect(button.matches(":focus-visible")).toBe(true);
	return getComputedStyle(button);
};

describe("Button focus in forced-colors mode (Chromium)", () => {
	afterEach(() => emulateForcedColors("none"));

	// forced-colors 는 box-shadow 포커스 링을 지운다 - theme.scss 의 전역 outline 이 대신 보여야 한다.
	it("draws an outline on keyboard focus when forced-colors is active", async () => {
		await emulateForcedColors("active");
		expect(matchMedia("(forced-colors: active)").matches).toBe(true);

		const style = await focusButtonByKeyboard();
		expect(style.outlineStyle).toBe("solid");
		expect(style.outlineWidth).toBe("2px");
	});

	// 일반 모드 렌더는 그대로 - 링은 box-shadow 로만 그린다.
	it("keeps outline none and the box-shadow ring in normal mode", async () => {
		const style = await focusButtonByKeyboard();
		expect(style.outlineStyle).toBe("none");
		expect(style.boxShadow).not.toBe("none");
	});
});
