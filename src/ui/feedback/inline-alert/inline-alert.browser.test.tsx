import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../general/button";
import { InlineAlert, type InlineAlertTone } from "./index";
import "./style.scss";

const TONES: InlineAlertTone[] = ["neutral", "info", "success", "warning", "error"];

/** `rgb(…)`/`rgba(…)` → [r, g, b, a] */
const parse = (c: string) => {
	const [r = 0, g = 0, b = 0, a = 1] = (c.match(/[\d.]+/g) ?? []).map(Number);
	return [r, g, b, a] as const;
};
const luminance = ([r, g, b]: readonly number[]) => {
	const lin = (v: number) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
};
/** 반투명 배경은 페이지 배경 위에 합성해 잰다 */
const over = (top: readonly number[], under: readonly number[]) => {
	const a = top[3] ?? 1;
	return [0, 1, 2].map((i) => top[i]! * a + under[i]! * (1 - a));
};
const contrast = (fg: string, bg: string, page: string) => {
	const base = parse(page);
	const back = over(parse(bg), base);
	const front = over(parse(fg), back);
	const [hi, lo] = [luminance(front), luminance(back)].sort((x, y) => y - x);
	return (hi! + 0.05) / (lo! + 0.05);
};

describe("InlineAlert (Chromium)", () => {
	afterEach(() => {
		document.documentElement.removeAttribute("data-theme");
		document.body.style.background = "";
	});

	for (const theme of ["light", "dark"] as const) {
		it(`keeps every tone readable in the ${theme} theme`, () => {
			document.documentElement.setAttribute("data-theme", theme);
			document.body.style.background = "var(--bt-color-bg-solid)";
			const page = getComputedStyle(document.body).backgroundColor;
			for (const tone of TONES) {
				const { container, unmount } = render(
					<InlineAlert
						tone={tone}
						title="제목"
						action={
							<>
								<Button size="sm" variant="outline">
									Outline
								</Button>
								<Button size="sm" variant="tonal">
									Tonal
								</Button>
							</>
						}
					>
						본문
					</InlineAlert>,
				);
				const root = container.firstChild as HTMLElement;
				const bg = getComputedStyle(root).backgroundColor;
				const title = container.querySelector(".inline_alert_title") as HTMLElement;
				const body = container.querySelector(".inline_alert_description") as HTMLElement;
				const icon = container.querySelector(".inline_alert_icon") as HTMLElement;
				// 텍스트 AA 4.5:1, 아이콘(비텍스트) 3:1
				expect(
					contrast(getComputedStyle(title).color, bg, page),
					`${tone} title`,
				).toBeGreaterThanOrEqual(4.5);
				expect(
					contrast(getComputedStyle(body).color, bg, page),
					`${tone} body`,
				).toBeGreaterThanOrEqual(4.5);
				expect(
					contrast(getComputedStyle(icon).color, bg, page),
					`${tone} icon`,
				).toBeGreaterThanOrEqual(3);
				for (const button of container.querySelectorAll<HTMLElement>(
					".inline_alert_action .button",
				)) {
					const style = getComputedStyle(button);
					expect(style.borderTopStyle, `${tone} ${button.textContent} border`).toBe("solid");
					expect(parseFloat(style.borderTopWidth), `${tone} ${button.textContent} border`).toBe(1);
					expect(
						contrast(style.borderTopColor, bg, page),
						`${tone} ${button.textContent} boundary`,
					).toBeGreaterThanOrEqual(3);
				}
				unmount();
			}
		});
	}

	it("preserves disabled and danger button boundaries", () => {
		render(
			<>
				<div data-testid="baseline">
					<Button size="sm" variant="outline" disabled>
						Disabled
					</Button>
					<Button size="sm" variant="outline" danger>
						Danger
					</Button>
					<Button size="sm" variant="tonal" danger>
						Danger tonal
					</Button>
				</div>
				<InlineAlert
					tone="warning"
					action={
						<>
							<Button size="sm" variant="outline" disabled>
								Disabled
							</Button>
							<Button size="sm" variant="outline" danger>
								Danger
							</Button>
							<Button size="sm" variant="tonal" danger>
								Danger tonal
							</Button>
						</>
					}
				>
					안내
				</InlineAlert>
			</>,
		);

		const baseline = screen.getByTestId("baseline").querySelectorAll<HTMLElement>(".button");
		const actions = document.querySelectorAll<HTMLElement>(".inline_alert_action .button");
		expect(actions).toHaveLength(baseline.length);
		for (const [index, action] of [...actions].entries()) {
			const expected = getComputedStyle(baseline[index]!);
			const actual = getComputedStyle(action);
			expect(actual.borderTopColor).toBe(expected.borderTopColor);
			expect(actual.borderTopStyle).toBe(expected.borderTopStyle);
			expect(actual.borderTopWidth).toBe(expected.borderTopWidth);
		}
	});

	it("shows the focus ring on the dismiss button for keyboard focus", async () => {
		render(
			<>
				<button type="button">앞</button>
				<InlineAlert onDismiss={() => {}}>안내</InlineAlert>
			</>,
		);
		await userEvent.click(screen.getByRole("button", { name: "앞" }));
		await userEvent.keyboard("{Tab}");
		const dismiss = screen.getByRole("button", { name: "알림 닫기" });
		expect(dismiss).toHaveFocus();
		expect(getComputedStyle(dismiss).boxShadow).toMatch(/0px 0px 0px 4px/);
		// 32px 버튼이 블록 높이를 늘리지 않는다 - 한 줄 본문 기준
		const root = dismiss.closest(".inline_alert") as HTMLElement;
		expect(root.getBoundingClientRect().height).toBeLessThan(50);
	});
});
