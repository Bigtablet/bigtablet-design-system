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

// WCAG 상대 휘도 대비. 반투명 배경(다크 soft 의 container)은 페이지 바탕(bg-solid) 위에 섞은 색으로 잰다.
const channels = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
const over = (top: string, base: string) => {
	const [r = 0, g = 0, b = 0, a = 1] = channels(top);
	const [br = 0, bg = 0, bb = 0] = channels(base);
	const mix = (x: number, y: number) => Math.round(x * a + y * (1 - a));
	return `rgb(${mix(r, br)}, ${mix(g, bg)}, ${mix(b, bb)})`;
};
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
					const page = rgb(cssVar("--bt-color-bg-solid"));
					const shown = over(s.backgroundColor, page);
					expect(contrast(s.color, shown), label).toBeGreaterThanOrEqual(4.5);
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

// 자손에 둔 data-theme="dark" 안에서도 accent 가 반전된다 - :root 에서만 별칭을 풀면 밝은 값이 상속됐다 (#976)
describe("Badge accent inside a nested dark theme", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("flips the accent fill to the dark theme value", () => {
		const scope = document.createElement("div");
		scope.dataset.theme = "dark";
		document.body.appendChild(scope);
		const badge = document.createElement("span");
		badge.className = "bt-badge";
		badge.textContent = "사용 중";
		scope.appendChild(badge);
		const darkAccent = getComputedStyle(scope).getPropertyValue("--bt-color-accent-default").trim();
		expect(getComputedStyle(badge).backgroundColor).toBe(rgb(darkAccent));
		expect(getComputedStyle(badge).backgroundColor).not.toBe(
			rgb(cssVar("--bt-color-accent-default")),
		);
	});
});
