import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./index";
import "./style.scss";

// 폭이 줄면 줄바꿈이 늘어난다 - 내용 변화에만 다시 재면 높이가 그대로라 글이 잘렸다 (#986)
describe("Textarea auto-grow (Chromium)", () => {
	it("grows again when its width shrinks", async () => {
		render(
			<div data-testid="box" style={{ width: 600 }}>
				<Textarea
					aria-label="메모"
					minRows={1}
					maxRows={20}
					defaultValue={"가나다라마바사 ".repeat(8)}
				/>
			</div>,
		);
		const box = screen.getByTestId("box");
		const area = screen.getByRole("textbox") as HTMLTextAreaElement;
		const before = area.getBoundingClientRect().height;
		box.style.width = "150px";
		await new Promise((r) =>
			requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))),
		);
		expect(area.getBoundingClientRect().height).toBeGreaterThan(before);
		expect(area.scrollHeight).toBeLessThanOrEqual(area.clientHeight + 1);
	});
});
