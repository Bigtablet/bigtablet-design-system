import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cdp } from "vitest/browser";
import { Toggle } from "./index";
import "./style.scss";
import "../../../vanilla/scss/_toggle.scss";

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

/** 손잡이의 트랙 안 여백(왼쪽·위·오른쪽)을 잰다. */
const insets = (track: HTMLElement) => {
	const t = track.getBoundingClientRect();
	const h = (track.firstElementChild as HTMLElement).getBoundingClientRect();
	return { left: h.left - t.left, top: h.top - t.top, right: t.right - h.right };
};

// 꺼짐: 작은 손잡이가 위·옆 6px. 켜짐: 큰 손잡이가 위·오른쪽 2px (두 크기 모두)
const OFF = { left: 6, top: 6 };
const ON = { top: 2, right: 2 };

describe("Toggle thumb position (Chromium)", () => {
	it.each(["sm", "md"] as const)("centers the React %s thumb with equal insets", async (size) => {
		const { rerender } = render(<Toggle ariaLabel="알림" size={size} checked={false} />);
		const track = screen.getByRole("switch");
		await expect.poll(() => insets(track)).toMatchObject(OFF);

		rerender(<Toggle ariaLabel="알림" size={size} checked />);
		await expect.poll(() => insets(track)).toMatchObject(ON);
	});

	it.each(["sm", "md"] as const)("places the Vanilla %s thumb like React", async (size) => {
		render(
			<button
				type="button"
				className={`bt-toggle bt-toggle--${size}`}
				role="switch"
				aria-checked="false"
			>
				<span className="bt-toggle__thumb" />
			</button>,
		);
		const track = screen.getByRole("switch");
		await expect.poll(() => insets(track)).toMatchObject(OFF);

		track.classList.add("bt-toggle--on");
		await expect.poll(() => insets(track)).toMatchObject(ON);
	});
});

// 손잡이 · 켜진 트랙을 배경으로만 그린다 - 고대비에서도 켬/끔이 보여야 한다 (#1001)
describe("Toggle in forced-colors mode (Chromium)", () => {
	it("draws the thumb in CanvasText and the on track in Highlight, React and Vanilla", async () => {
		await emulateForcedColors("active");
		try {
			render(
				<>
					<Toggle ariaLabel="끔" />
					<Toggle ariaLabel="켬" defaultChecked />
				</>,
			);
			const host = document.createElement("div");
			host.innerHTML =
				'<button class="bt-toggle" aria-label="v끔"><span class="bt-toggle__thumb"></span></button>' +
				'<button class="bt-toggle bt-toggle--on" aria-label="v켬"><span class="bt-toggle__thumb"></span></button>';
			document.body.appendChild(host);

			const thumb = (name: string) =>
				getComputedStyle(
					screen.getByRole(name.startsWith("v") ? "button" : "switch", { name })
						.firstElementChild as Element,
				).backgroundColor;
			const track = (name: string) =>
				getComputedStyle(screen.getByRole(name.startsWith("v") ? "button" : "switch", { name }))
					.backgroundColor;
			for (const off of ["끔", "v끔"]) expect(thumb(off)).toBe(systemColor("CanvasText"));
			for (const on of ["켬", "v켬"]) {
				expect(track(on)).toBe(systemColor("Highlight"));
				expect(thumb(on)).toBe(systemColor("HighlightText"));
			}
			host.remove();
		} finally {
			await emulateForcedColors("none");
		}
	});
});
