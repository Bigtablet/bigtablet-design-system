import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { BalancedText } from "./balanced";
import { PREHYDRATE_STYLE_ID } from "./dom";
import { prehydrate } from "./prehydrate";

// SSR 앱의 흐름 (#1085) - 서버 HTML → 하이드레이션 전 스크립트(prehydrate)가 CSS 로 줄을 고름 → 하이드레이션 뒤 BalancedText 가
// 같은 줄을 진짜 줄로 넘겨받음. 넘겨받을 때 줄이 바뀌거나 하이드레이션이 어긋나면 SSR 첫 화면이 다시 튄다
const style = {
	width: 320,
	font: "16px/24px sans-serif",
	wordBreak: "keep-all" as const,
	margin: 0,
};
const App = () => (
	<div>
		<BalancedText as="p" style={style}>
			제목이면 <code>heading</code>, 본문이면 <code>body</code> 입니다. 이 아래의 컴포넌트에서
			부르고 글자 크기가 아니라 역할로 고릅니다.
		</BalancedText>
		<BalancedText as="p" style={style}>
			패키지를 설치하기 전이거나 웹에서 읽는 에이전트에게는 이 사이트의 <code>llms.txt</code> 를
			알려 줍니다.
		</BalancedText>
	</div>
);

/** 화면에 그려진 줄 - 어절 span 의 top 으로 묶는다(CSS 로 끊은 줄 · 진짜 줄 모두) */
const drawnLines = (root: HTMLElement) =>
	[...root.querySelectorAll("p")].map((p) => {
		const lines: string[][] = [];
		let top: number | null = null;
		for (const w of p.querySelectorAll(".text_balanced_word")) {
			const t = Math.round(w.getClientRects()[0]?.top ?? 0);
			if (top === null || Math.abs(t - top) > 3) lines.push([]);
			top = t;
			lines.at(-1)?.push(w.textContent ?? "");
		}
		return lines.map((l) => l.join(" "));
	});
const rules = () =>
	(document.getElementById(PREHYDRATE_STYLE_ID) as HTMLStyleElement | null)?.sheet?.cssRules
		.length ?? 0;

afterEach(() => {
	document.body.innerHTML = "";
	document.getElementById(PREHYDRATE_STYLE_ID)?.remove();
});

describe("BalancedTextScript (SSR)", () => {
	it("draws the same lines before hydration that BalancedText keeps after it", async () => {
		const container = document.createElement("div");
		container.innerHTML = renderToString(<App />);
		document.body.appendChild(container);

		prehydrate();
		expect(rules()).toBeGreaterThan(0);
		const before = drawnLines(container);
		expect(before.some((lines) => lines.length > 1)).toBe(true);

		// act 로 하이드레이션을 끝까지 돌린다 - 이 환경 표시가 없으면 React 가 경고를 남긴다
		(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		const errors: unknown[] = [];
		const original = console.error;
		console.error = (...args: unknown[]) => errors.push(args);
		try {
			await act(async () => {
				hydrateRoot(container, <App />, { onRecoverableError: (e) => errors.push(e) });
			});
		} finally {
			console.error = original;
		}

		expect(errors).toHaveLength(0);
		// 넘겨받은 뒤: 규칙은 걷히고 진짜 줄이 같은 자리에 있다
		expect(rules()).toBe(0);
		expect(container.querySelectorAll(".text_balanced_line").length).toBeGreaterThan(0);
		expect(drawnLines(container)).toEqual(before);
	});

	it("leaves the server HTML alone while the font is still loading", () => {
		const container = document.createElement("div");
		container.innerHTML = renderToString(<App />);
		document.body.appendChild(container);
		Object.defineProperty(document.fonts, "check", { configurable: true, value: () => false });
		Object.defineProperty(document.fonts, "load", {
			configurable: true,
			value: () => new Promise(() => {}),
		});
		try {
			prehydrate();
			// 받은 뒤 고르면 이미 칠한 어절을 옮겨 레이아웃 이동(CLS)이 된다 - 하이드레이션에 맡긴다
			expect(rules()).toBe(0);
		} finally {
			Reflect.deleteProperty(document.fonts, "check");
			Reflect.deleteProperty(document.fonts, "load");
		}
	});
});
