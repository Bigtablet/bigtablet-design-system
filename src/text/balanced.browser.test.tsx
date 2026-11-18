import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BalancedText } from "./balanced";

const text = "제목이면 heading, 본문이면 body 입니다.";

// 실제 Chromium 에서 마운트 뒤 줄을 계산해 바꾸는지, 바꿔도 원문이 그대로인지 (#1083)
describe("BalancedText (Chromium)", () => {
	const lineTexts = (el: HTMLElement) =>
		[...el.querySelectorAll(".text_balanced_line")].map((line) => line.textContent);

	it("moves a lone copula back so no line ends right before it", async () => {
		// 폭을 "…본문이면 body" 까지 한 줄에 들어가고 "입니다." 는 넘치게 - 브라우저는 "body / 입니다." 로 끊는다
		const { container } = render(
			<BalancedText
				as="p"
				style={{ width: 300, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			>
				{text}
			</BalancedText>,
		);
		const p = container.firstElementChild as HTMLElement;
		const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
		ctx.font = "16px sans-serif";
		const upToBody = ctx.measureText("제목이면 heading, 본문이면 body").width;
		const all = ctx.measureText(text).width;
		p.style.width = `${Math.ceil((upToBody + all) / 2)}px`;

		await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(1);
		const lines = lineTexts(p);
		expect(lines.some((line) => line?.endsWith("body"))).toBe(false);
		// 복사 · 접근성 이름은 원문 그대로
		expect(p.textContent).toBe(text);
		const tops = new Set(
			[...p.querySelectorAll(".text_balanced_line")].map((l) =>
				Math.round(l.getBoundingClientRect().top),
			),
		);
		expect(tops.size).toBe(lines.length);
	});

	it("keeps the browser wrapping when it already breaks in good places", async () => {
		const { container } = render(
			<BalancedText
				as="p"
				style={{ width: 120, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			>
				저장했습니다. 계속할까요?
			</BalancedText>,
		);
		const p = container.firstElementChild as HTMLElement;
		await new Promise((r) => setTimeout(r, 300));
		expect(p.querySelector(".text_balanced_line")).toBeNull();
		expect(p.textContent).toBe("저장했습니다. 계속할까요?");
	});

	it("measures code inside the text and keeps it whole", async () => {
		const style = { font: "16px/24px sans-serif", wordBreak: "keep-all" as const, margin: 0 };
		const { container } = render(
			<BalancedText as="p" style={{ ...style, width: 2000 }}>
				제목이면 <code>heading</code>, 본문이면 <code>body</code> 입니다.
			</BalancedText>,
		);
		const p = container.firstElementChild as HTMLElement;
		// 한 줄일 때 잰 폭으로 "…body" 까지는 들어가고 "입니다." 는 넘치게 - 코드 글꼴이라 canvas 로는 못 잰다
		const words = [...p.querySelectorAll(".text_balanced_word")];
		const left = (words[0] as Element).getBoundingClientRect().left;
		const upToBody = (words.at(-2) as Element).getBoundingClientRect().right - left;
		const all = (words.at(-1) as Element).getBoundingClientRect().right - left;
		p.style.width = `${Math.ceil((upToBody + all) / 2)}px`;

		await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(1);
		expect(lineTexts(p).some((line) => line?.endsWith("body"))).toBe(false);
		expect(p.querySelectorAll("code")).toHaveLength(2);
		expect(p.textContent).toBe("제목이면 heading, 본문이면 body 입니다.");
	});

	it("waits for web fonts before choosing lines", async () => {
		// 첫 방문처럼 폰트를 받는 중 - 대체 글꼴 폭으로 고르면 폰트가 온 뒤 줄이 한 번 더 바뀐다
		let loaded!: () => void;
		const ready = new Promise<FontFaceSet>((resolve) => {
			loaded = () => resolve(document.fonts);
		});
		Object.defineProperty(document.fonts, "status", { configurable: true, get: () => "loading" });
		Object.defineProperty(document.fonts, "ready", { configurable: true, get: () => ready });
		try {
			const { container } = render(
				<BalancedText
					as="p"
					style={{ width: 300, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
				>
					{text}
				</BalancedText>,
			);
			const p = container.firstElementChild as HTMLElement;
			const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
			ctx.font = "16px sans-serif";
			const upToBody = ctx.measureText("제목이면 heading, 본문이면 body").width;
			p.style.width = `${Math.ceil((upToBody + ctx.measureText(text).width) / 2)}px`;
			await new Promise((r) => setTimeout(r, 300));
			expect(lineTexts(p)).toHaveLength(0);

			Object.defineProperty(document.fonts, "status", { configurable: true, get: () => "loaded" });
			loaded();
			await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(1);
		} finally {
			// 인스턴스에 덮은 값을 지워 원래 getter 로 돌린다
			Reflect.deleteProperty(document.fonts, "status");
			Reflect.deleteProperty(document.fonts, "ready");
		}
	});
});
