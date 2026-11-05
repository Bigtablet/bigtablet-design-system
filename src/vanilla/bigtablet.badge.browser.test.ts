import { afterEach, describe, expect, it } from "vitest";
// 번들 CSS 만 본다 - Badge 는 스크립트 없이 CSS 로 동작한다 (#917).
import "./bigtablet.scss";

const TONES = ["accent", "neutral", "info", "success", "warning", "error"] as const;

const mount = (cls: string) => {
	const el = document.createElement("span");
	el.className = cls;
	el.textContent = "사용 중";
	document.body.appendChild(el);
	return getComputedStyle(el);
};

const cssVar = (name: string) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const rgb = (color: string) => {
	const probe = document.createElement("span");
	probe.style.color = color;
	document.body.appendChild(probe);
	const out = getComputedStyle(probe).color;
	probe.remove();
	return out;
};

// WCAG 상대 휘도 대비 - 배지 배경이 불투명하다는 전제(투명이면 바탕을 섞어야 한다)
const channels = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
const luminance = (c: string) => {
	const [r = 0, g = 0, b = 0] = channels(c).map((v) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
	return (hi + 0.05) / (lo + 0.05);
};

describe("Vanilla Badge (Chromium, #917)", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		document.documentElement.removeAttribute("data-theme");
	});

	for (const theme of ["light", "dark"]) {
		it(`colors every tone × appearance from the same tokens as React (${theme})`, () => {
			if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
			for (const tone of TONES) {
				for (const soft of [false, true]) {
					const s = mount(`bt-badge bt-badge--${tone}${soft ? " bt-badge--soft" : ""}`);
					const [bg, fg] =
						tone === "neutral"
							? ["--bt-color-bg-solid-dim", "--bt-color-text-body"]
							: tone === "accent"
								? soft
									? ["--bt-color-accent-subtle", "--bt-color-accent"]
									: ["--bt-color-accent", "--bt-color-accent-on-surface"]
								: soft
									? [
											`--bt-color-status-${tone}-container`,
											`--bt-color-status-${tone}-on-container`,
										]
									: [`--bt-color-status-${tone}`, `--bt-color-status-${tone}-on-default`];
					const label = `${tone}${soft ? " soft" : ""}`;
					expect(s.backgroundColor, label).toBe(rgb(cssVar(bg)));
					expect(s.color, label).toBe(rgb(cssVar(fg)));
					// 반투명 배경(다크 container)은 바탕 위에서 재야 해 여기서는 불투명한 것만 잰다
					if (channels(s.backgroundColor).length === 3) {
						expect(contrast(s.color, s.backgroundColor), label).toBeGreaterThanOrEqual(4.5);
					}
				}
			}
		});
	}

	it("defaults to accent solid like React, and soft alone is accent soft", () => {
		const plain = mount("bt-badge");
		const accent = mount("bt-badge bt-badge--accent");
		expect(plain.backgroundColor).toBe(accent.backgroundColor);
		expect(plain.color).toBe(accent.color);
		const soft = mount("bt-badge bt-badge--soft");
		const accentSoft = mount("bt-badge bt-badge--accent bt-badge--soft");
		expect(soft.backgroundColor).toBe(accentSoft.backgroundColor);
	});

	it("is a single-line full-radius pill at 12px", () => {
		const s = mount("bt-badge bt-badge--success bt-badge--soft");
		expect(s.whiteSpace).toBe("nowrap");
		expect(s.fontSize).toBe("12px");
		expect(Number.parseFloat(s.borderTopLeftRadius)).toBeGreaterThan(100);
	});
});
