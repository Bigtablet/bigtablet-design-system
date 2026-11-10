/// <reference types="@vitest/browser-playwright" />
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { type ToastPlacement, ToastProvider } from "./index";
import { useToast } from "./use-toast";

function Trigger() {
	const t = useToast();
	return (
		<button type="button" onClick={() => t.success("저장했습니다")}>
			show
		</button>
	);
}

const toastRect = async (placement?: ToastPlacement) => {
	render(
		<ToastProvider placement={placement}>
			<Trigger />
		</ToastProvider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "show" }));
	return (await screen.findByText("저장했습니다", { selector: ".toast_message" }))
		.closest(".toast_item")
		?.getBoundingClientRect();
};

describe("Toast placement (Chromium, #998)", () => {
	it("sits 16px from the top right by default", async () => {
		await page.viewport(1280, 800);
		const r = await toastRect();
		expect(1280 - (r?.right ?? 0)).toBe(16);
		expect(r?.top).toBe(16);
	});

	it("sits 16px from the bottom right with placement=bottom-right", async () => {
		await page.viewport(1280, 800);
		const r = await toastRect("bottom-right");
		expect(1280 - (r?.right ?? 0)).toBe(16);
		expect(800 - (r?.bottom ?? 0)).toBe(16);
	});
});
