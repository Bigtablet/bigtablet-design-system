import { afterEach, describe, expect, it } from "vitest";
import "./bigtablet.scss";

const mount = (css: string) => {
	const style = document.createElement("style");
	style.textContent = css;
	document.head.appendChild(style);
	const el = document.createElement("div");
	el.setAttribute("data-theme", "dark");
	document.body.appendChild(el);
	return { style, el, read: (name: string) => getComputedStyle(el).getPropertyValue(name).trim() };
};

describe("Vanilla CSS 변수 범위 (Chromium)", () => {
	let cleanup: (() => void) | null = null;
	afterEach(() => cleanup?.());

	// 테마와 무관한 별칭은 [data-theme] 에서 다시 선언하지 않는다 - :root 에 준 값이 그 구역 안에서도 이긴다 (#981)
	it("keeps a consumer :root override of theme-independent aliases inside data-theme", () => {
		const { style, el, read } = mount(
			":root { --bt-transition-fast: 1s linear; --bt-spacing-xs: 9px; }",
		);
		cleanup = () => {
			style.remove();
			el.remove();
		};
		expect(read("--bt-transition-fast")).toBe("1s linear");
		expect(read("--bt-spacing-xs")).toBe("9px");
	});

	// 색 별칭은 그 구역의 테마 값으로 다시 푼다 - 문서대로 [data-theme] 에도 주면 소비자 값이 이긴다 (#976 · #981)
	it("re-resolves color aliases per theme and honours the documented accent override", () => {
		const root = getComputedStyle(document.documentElement)
			.getPropertyValue("--bt-color-accent")
			.trim();
		const plain = mount("");
		expect(plain.read("--bt-color-accent")).not.toBe(root);
		plain.style.remove();
		plain.el.remove();

		const { style, el, read } = mount(":root, [data-theme] { --bt-color-accent: #2563eb; }");
		cleanup = () => {
			style.remove();
			el.remove();
		};
		expect(read("--bt-color-accent")).toBe("#2563eb");
	});
});
