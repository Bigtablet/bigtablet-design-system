import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toggle } from "./index";
import "./style.scss";
import "../../../vanilla/scss/_toggle.scss";

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
