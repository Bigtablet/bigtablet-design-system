import { afterEach, describe, expect, it } from "vitest";
// 번들 CSS 만 본다 - InlineAlert 는 스크립트 없이 CSS 로 동작한다 (#916).
import "./bigtablet.scss";

const TONES = ["neutral", "info", "success", "warning", "error"] as const;

const mount = (tone?: string) => {
	const el = document.createElement("div");
	el.className = `bt-inline-alert${tone ? ` bt-inline-alert--${tone}` : ""}`;
	el.innerHTML = `<span class="bt-inline-alert__icon" aria-hidden="true"></span>
		<div class="bt-inline-alert__content">
			<div class="bt-inline-alert__title">제목</div>
			<div class="bt-inline-alert__message">본문</div>
		</div>`;
	document.body.appendChild(el);
	const q = (s: string) => el.querySelector(s) as HTMLElement;
	return {
		el,
		icon: q(".bt-inline-alert__icon"),
		title: q(".bt-inline-alert__title"),
		message: q(".bt-inline-alert__message"),
	};
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

describe("Vanilla InlineAlert (Chromium, #916)", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		document.documentElement.removeAttribute("data-theme");
	});

	for (const theme of ["light", "dark"]) {
		it(`colors each tone from its status container / on-container pair (${theme})`, () => {
			if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
			const icons = new Set<string>();
			for (const tone of TONES) {
				const { el, icon, title, message } = mount(tone);
				const bg =
					tone === "neutral" ? "--bt-color-bg-solid-dim" : `--bt-color-status-${tone}-container`;
				const fg =
					tone === "neutral" ? "--bt-color-text-heading" : `--bt-color-status-${tone}-on-container`;
				expect(getComputedStyle(el).backgroundColor).toBe(rgb(cssVar(bg)));
				expect(getComputedStyle(title).color).toBe(rgb(cssVar(fg)));
				// 아이콘은 currentColor 로 칠한 mask - 톤마다 다른 모양
				expect(getComputedStyle(icon).backgroundColor).toBe(rgb(cssVar(fg)));
				expect(getComputedStyle(icon).width).toBe("18px");
				icons.add(getComputedStyle(icon).maskImage);
				// 본문은 톤 색이 아니라 일반 텍스트 색
				expect(getComputedStyle(message).color).toBe(rgb(cssVar("--bt-color-text-body")));
			}
			// neutral 은 info 아이콘을 같이 쓴다 (React 와 같음)
			expect(icons.size).toBe(4);
		});
	}

	it("looks like the info tone without a modifier (React default)", () => {
		const plain = mount();
		const info = mount("info");
		expect(getComputedStyle(plain.el).backgroundColor).toBe(
			getComputedStyle(info.el).backgroundColor,
		);
		expect(getComputedStyle(plain.title).color).toBe(getComputedStyle(info.title).color);
		expect(getComputedStyle(plain.icon).maskImage).toBe(getComputedStyle(info.icon).maskImage);
	});

	it("stays hidden with the hidden attribute until a script reveals it", () => {
		const { el } = mount("error");
		el.hidden = true;
		expect(getComputedStyle(el).display).toBe("none");
		el.hidden = false;
		expect(getComputedStyle(el).display).toBe("flex");
	});
});
