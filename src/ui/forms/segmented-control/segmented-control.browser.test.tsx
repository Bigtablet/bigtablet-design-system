import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { SegmentedControl } from "./index";
import "./style.scss";

const emulateForcedColors = (value: "active" | "none") =>
	cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value }] });

const emulateColorScheme = (value: "dark" | "light") =>
	cdp().send("Emulation.setEmulatedMedia", {
		features: [{ name: "prefers-color-scheme", value }],
	});

/** 시스템 색의 실제 rgb - 고대비 팔레트마다 다르므로 같은 페이지에서 잰다 */
const systemColor = (name: string) => {
	const probe = document.createElement("span");
	probe.style.cssText = `forced-color-adjust: none; color: ${name}`;
	document.body.appendChild(probe);
	const value = getComputedStyle(probe).color;
	probe.remove();
	return value;
};

const items = [
	{ value: "USD", label: "USD" },
	{ value: "KRW", label: "KRW" },
	{ value: "JPY", label: "JPY", disabled: true },
];

describe("SegmentedControl (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(800, 600);
	});

	it("moves and selects with the arrow keys natively, skipping disabled items", async () => {
		render(
			<>
				<button type="button">앞</button>
				<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />
			</>,
		);
		await userEvent.click(screen.getByRole("button", { name: "앞" }));
		await userEvent.keyboard("{Tab}");
		expect(screen.getByRole("radio", { name: "USD" })).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "KRW" })).toBeChecked();
		// 다음 칸 JPY 는 비활성이라 처음으로 돌아간다
		await userEvent.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "USD" })).toBeChecked();
	});

	it("draws the focus ring on the item for keyboard focus only", async () => {
		render(
			<>
				<button type="button">앞</button>
				<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />
			</>,
		);
		const usd = screen.getByRole("radio", { name: "USD" }).closest("label") as HTMLElement;
		const krw = screen.getByRole("radio", { name: "KRW" }).closest("label") as HTMLElement;
		await userEvent.click(krw);
		// box-shadow 전환(200ms)이 끝난 값을 본다
		await expect.poll(() => getComputedStyle(krw).boxShadow).not.toMatch(/0\.\d+px/);
		expect(getComputedStyle(krw).boxShadow).not.toMatch(/0px 0px 0px 4px/);

		await userEvent.click(screen.getByRole("button", { name: "앞" }));
		await userEvent.keyboard("{Tab}");
		// 선택된 칸(KRW)으로 들어온다 - 그림자(elevation) 위에 포커스 링이 겹친다
		await expect.poll(() => getComputedStyle(krw).boxShadow).toMatch(/0px 0px 0px 4px/);
		expect(getComputedStyle(usd).boxShadow).toBe("none");
	});

	it("grows to a touch-sized target on a compact screen", async () => {
		render(<SegmentedControl aria-label="통화" items={items} size="sm" />);
		const item = () => screen.getByRole("radio", { name: "USD" }).closest("label") as HTMLElement;
		expect(item().getBoundingClientRect().height).toBe(32);
		await page.viewport(375, 667);
		expect(item().getBoundingClientRect().height).toBe(40);
	});

	it("splits the width evenly with fullWidth", () => {
		render(
			<div style={{ width: 300 }}>
				<SegmentedControl aria-label="통화" items={items} fullWidth />
			</div>,
		);
		const widths = screen
			.getAllByRole("radio")
			.map((r) => (r.closest("label") as HTMLElement).getBoundingClientRect().width);
		expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
	});

	it("still blocks an empty submit when the first item is disabled", async () => {
		// disabled 칸은 제약 검증에서 빠진다 - 실제 브라우저의 검증으로 본다
		const { container } = render(
			<form>
				<SegmentedControl
					aria-label="통화"
					items={[{ value: "A", label: "A", disabled: true }, ...items.slice(0, 2)]}
					required
				/>
			</form>,
		);
		const form = container.querySelector("form") as HTMLFormElement;
		expect(form.checkValidity()).toBe(false);
		await userEvent.click(
			screen.getByRole("radio", { name: "KRW" }).closest("label") as HTMLElement,
		);
		expect(form.checkValidity()).toBe(true);
	});
});

// 고른 칸을 배경 · 그림자로만 표시한다 - 고대비에서는 시스템 선택색으로 (#1001)
describe("SegmentedControl in forced-colors mode (Chromium)", () => {
	it("paints the selected item with Highlight", async () => {
		await emulateForcedColors("active");
		try {
			render(<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />);
			const item = screen.getByRole("radio", { name: "USD" }).closest(".segmented_control_item");
			expect(getComputedStyle(item as Element).backgroundColor).toBe(systemColor("Highlight"));
		} finally {
			await emulateForcedColors("none");
		}
	});

	// 다크에서 고른 칸이 트랙보다 어둡고 검은 그림자도 안 보여 1.1:1 차이로만 드러났다 (#1057).
	// 안쪽 테두리 색이 트랙 위에서 비텍스트 대비 3:1(WCAG 1.4.11)을 넘는지 잰다
	// 다크는 두 경로로 들어온다 - 명시 테마(data-theme) 와 테마를 안 정했을 때의 시스템 설정
	const darkPaths = [
		[
			"data-theme",
			async () => document.documentElement.setAttribute("data-theme", "dark"),
			async () => document.documentElement.removeAttribute("data-theme"),
		],
		["prefers-color-scheme", () => emulateColorScheme("dark"), () => emulateColorScheme("light")],
	] as const;

	it.each(darkPaths)(
		"marks the selected item with a 3:1 edge on the dark track (%s)",
		async (_path, on, off) => {
			await on();
			try {
				render(<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />);
				const usd = screen.getByRole("radio", { name: "USD" }).closest("label") as HTMLElement;
				const track = usd.parentElement as HTMLElement;
				await expect.poll(() => getComputedStyle(usd).boxShadow).toMatch(/inset/);
				const edge = getComputedStyle(usd).boxShadow.match(/rgba?\([^)]+\)/)?.[0] ?? "";
				expect(contrast(edge, getComputedStyle(track).backgroundColor)).toBeGreaterThanOrEqual(3);
			} finally {
				await off();
			}
		},
	);

	// 키보드 포커스에서도 테두리가 포커스 링에 덮여 사라지지 않는다
	it("keeps the dark edge under the focus ring", async () => {
		document.documentElement.setAttribute("data-theme", "dark");
		try {
			render(
				<>
					<button type="button">앞</button>
					<SegmentedControl aria-label="통화" items={items} defaultValue="USD" />
				</>,
			);
			await userEvent.click(screen.getByRole("button", { name: "앞" }));
			await userEvent.keyboard("{Tab}");
			const usd = screen.getByRole("radio", { name: "USD" }).closest("label") as HTMLElement;
			await expect.poll(() => getComputedStyle(usd).boxShadow).toMatch(/0px 0px 0px 4px/);
			expect(getComputedStyle(usd).boxShadow).toMatch(/inset/);
		} finally {
			document.documentElement.removeAttribute("data-theme");
		}
	});
});

/** WCAG 상대 휘도 대비 - "rgb(r, g, b)" 둘 */
function contrast(a: string, b: string) {
	const lum = (rgb: string) => {
		const [r = 0, g = 0, bl = 0] = (rgb.match(/[\d.]+/g) ?? []).map(Number).map((v) => {
			const c = v / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
	return (hi + 0.05) / (lo + 0.05);
}
