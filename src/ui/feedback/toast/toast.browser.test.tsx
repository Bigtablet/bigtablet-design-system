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

	it("scrolls inside the list instead of pushing the newest toast off screen (#1000)", async () => {
		await page.viewport(1280, 400);
		const long = "여러 줄로 넘어가는 긴 안내 문구입니다. ".repeat(4);
		function Many() {
			const t = useToast();
			return (
				<button
					type="button"
					onClick={() => {
						for (let i = 0; i < 5; i++)
							t.info(`${i} ${long}`, { duration: Number.POSITIVE_INFINITY });
					}}
				>
					many
				</button>
			);
		}
		render(
			<ToastProvider placement="bottom-right">
				<Many />
			</ToastProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "many" }));
		await expect.poll(() => document.querySelectorAll(".toast_item").length).toBe(5);

		const region = document.querySelector(".toast_container") as HTMLElement;
		const newest = document.querySelector(".toast_item") as Element;
		expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
		expect(newest.getBoundingClientRect().top).toBeGreaterThanOrEqual(16);
		// 상자는 그림자 · 슬라이드용 안쪽 여백(20px)만큼 크다 - 내용 아래끝이 여백 16px 에 남는다
		expect(region.getBoundingClientRect().bottom - 20).toBe(400 - 16);
	});
});
