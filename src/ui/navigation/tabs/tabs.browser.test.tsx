/// <reference types="@vitest/browser-playwright" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";
import { Tab, TabList, Tabs, type TabsProps } from "./index";
import "./style.scss";

const emulateForcedColors = (value: "active" | "none") =>
	cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value }] });

/** 시스템 색의 실제 rgb - 고대비 팔레트마다 다르므로 같은 페이지에서 잰다 */
const systemColor = (name: string) => {
	const probe = document.createElement("span");
	probe.style.cssText = `forced-color-adjust: none; color: ${name}`;
	document.body.appendChild(probe);
	const value = getComputedStyle(probe).color;
	probe.remove();
	return value;
};

// 현재 탭을 배경을 칠한 표시기로만 그린다 - 고대비에서는 시스템 선택색으로 (#1001)
describe("Tabs in forced-colors mode (Chromium)", () => {
	it.each<TabsProps["variant"]>(["line", "fills"])(
		"keeps the %s indicator visible",
		async (variant) => {
			await emulateForcedColors("active");
			try {
				render(
					<Tabs defaultValue="a" variant={variant}>
						<TabList ariaLabel="탭">
							<Tab value="a">A</Tab>
							<Tab value="b">B</Tab>
						</TabList>
					</Tabs>,
				);
				await expect.poll(() => document.querySelector(".tabs_indicator")).not.toBeNull();
				const indicator = document.querySelector(".tabs_indicator") as Element;
				expect(getComputedStyle(indicator).backgroundColor).toBe(systemColor("Highlight"));
				if (variant === "fills") {
					expect(getComputedStyle(screen.getByRole("tab", { name: "A" })).color).toBe(
						systemColor("HighlightText"),
					);
				}
			} finally {
				await emulateForcedColors("none");
			}
		},
	);
});
