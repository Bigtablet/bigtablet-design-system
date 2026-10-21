import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "./index";
import "./style.scss";

const WIDTHS = [375, 800];
const STEP_SETS = [
	["입력", "완료"],
	["업로드", "매핑·검증", "등록 완료"],
];

describe("Stepper horizontal layout (Chromium)", () => {
	for (const width of WIDTHS) {
		for (const labels of STEP_SETS) {
			it(`puts the last of ${labels.length} steps at the right edge without wrapping at ${width}px`, () => {
				const { container, unmount } = render(
					<div style={{ width }}>
						<Stepper steps={labels.map((label) => ({ id: label, label }))} current={0} />
					</div>,
				);
				const list = container.querySelector("ol")!.getBoundingClientRect();
				const last = container.querySelector("li:last-child")!;
				// li 박스가 아니라 내용 - li 는 1/N 폭이라 원래도 끝까지 가고, 비는 건 그 안이다
				const content = last.querySelector(".stepper_content")!.getBoundingClientRect();
				const label = last.querySelector(".stepper_label")!;
				const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);

				expect(Math.abs(content.right - list.right)).toBeLessThan(1);
				expect(label.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5);
				unmount();
			});
		}
	}
});
