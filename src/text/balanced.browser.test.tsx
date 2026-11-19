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

	it("balances with the default span element too", async () => {
		// 기본값 span 은 인라인이라 폭이 0 이었다 - 루트를 블록으로 두어 as 없이도 줄을 고른다 (#1113)
		const { container } = render(
			<BalancedText
				style={{ width: 300, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			>
				{text}
			</BalancedText>,
		);
		const span = container.firstElementChild as HTMLElement;
		expect(span.tagName).toBe("SPAN");
		const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
		ctx.font = "16px sans-serif";
		const upToBody = ctx.measureText("제목이면 heading, 본문이면 body").width;
		const all = ctx.measureText(text).width;
		span.style.width = `${Math.ceil((upToBody + all) / 2)}px`;

		await expect.poll(() => lineTexts(span).length, { timeout: 2000 }).toBeGreaterThan(1);
		expect(lineTexts(span).some((line) => line?.endsWith("body"))).toBe(false);
	});

	it("drops lines chosen for an earlier className when it comes back at a new width", async () => {
		// A(400px 에서 고른 줄) → 숨긴 B → 숨긴 사이 폭 160px → 다시 A. 예전 결과를 그대로 그리면 400px 용 nowrap 줄이
		// 넘치고, 줄이 이미 있다는 이유로 다시 재지도 않았다 (#1113 리뷰)
		const style = document.createElement("style");
		style.textContent = ".bt-test-hidden { display: none; }";
		document.head.appendChild(style);
		const long =
			"미팅은 끝났지만, 실행은 지금부터. AI가 설계하는 완벽한 후속 일정을 확인하고 바로 공유해 보세요.";
		const tree = (className: string) => (
			<div style={{ width: 400 }}>
				<BalancedText
					as="p"
					className={className}
					style={{ font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
				>
					{long}
				</BalancedText>
			</div>
		);
		try {
			const { container, rerender } = render(tree("a"));
			const box = container.firstElementChild as HTMLElement;
			await expect
				.poll(() => box.querySelectorAll(".text_balanced_line").length, { timeout: 2000 })
				.toBeGreaterThan(1);

			rerender(tree("bt-test-hidden"));
			box.style.width = "160px";
			rerender(tree("a"));

			const p = box.firstElementChild as HTMLElement;
			const overflows = () => {
				const right = p.getBoundingClientRect().right;
				return [...p.querySelectorAll(".text_balanced_line")].some(
					(line) => line.getBoundingClientRect().right > right + 1,
				);
			};
			await expect.poll(overflows, { timeout: 2000 }).toBe(false);
			expect(p.textContent).toBe(long);
		} finally {
			style.remove();
		}
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
		// 같은 자리라도 줄로 그린다 - 첫 렌더의 어절 묶음(inline-block)을 걷어 내야 페이지 검색이 이어진다
		await expect
			.poll(() => lineTexts(p), { timeout: 2000 })
			.toEqual(["저장했습니다.", "계속할까요?"]);
		expect(p.querySelector(".sentences_phrase")).toBeNull();
		expect(p.textContent).toBe("저장했습니다. 계속할까요?");
	});

	it("keeps find in page working across words and lines", async () => {
		const { container } = render(
			<BalancedText
				as="p"
				style={{ width: 200, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			>
				{text}
			</BalancedText>,
		);
		const p = container.firstElementChild as HTMLElement;
		await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(1);
		// Chrome 은 inline-block 경계를 건너 찾지 못한다 - 줄 · 어절 묶음이 inline-block 이면 실패한다
		const find = (q: string) => {
			window.getSelection()?.removeAllRanges();
			return (window as unknown as { find: (q: string) => boolean }).find(q);
		};
		expect(find("제목이면 heading")).toBe(true);
		const [first, second] = lineTexts(p);
		expect(find(`${first?.split(" ").at(-1)} ${second?.split(" ")[0]}`)).toBe(true);
	});

	it("measures code inside the text and keeps it whole", async () => {
		const style = { font: "16px/24px sans-serif", wordBreak: "keep-all" as const, margin: 0 };
		const { container } = render(
			<BalancedText as="p" style={{ ...style, width: 2000 }}>
				제목이면{" "}
				<code>
					hea
					<wbr />
					ding
				</code>
				, 본문이면 <code>body</code> 입니다.
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
		// 코드 안 <wbr> 에서 줄이 다시 갈리지 않는다 - 고른 줄 하나는 화면에서도 한 줄
		for (const line of p.querySelectorAll(".text_balanced_line"))
			expect(new Set([...line.getClientRects()].map((r) => Math.round(r.top))).size).toBe(1);
	});

	it("waits for its own web font before choosing lines", async () => {
		// 첫 방문처럼 이 글꼴을 아직 받는 중 - 문서 전체 상태(fonts.status)는 받기 시작 전이면 "loaded" 라 믿지 않는다.
		// 대체 글꼴 폭으로 고르면 폰트가 온 뒤 줄이 한 번 더 바뀌고 nowrap 줄이 넘칠 수 있다
		let loaded!: () => void;
		let ready = false;
		const load = new Promise<FontFace[]>((resolve) => {
			loaded = () => {
				ready = true;
				resolve([]);
			};
		});
		Object.defineProperty(document.fonts, "check", { configurable: true, value: () => ready });
		Object.defineProperty(document.fonts, "load", { configurable: true, value: () => load });
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
			await new Promise((r) => setTimeout(r, 300));
			expect(lineTexts(p)).toHaveLength(0);

			loaded();
			await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(0);
		} finally {
			// 인스턴스에 덮은 값을 지워 원래 메서드로 돌린다
			Reflect.deleteProperty(document.fonts, "check");
			Reflect.deleteProperty(document.fonts, "load");
		}
	});

	it("settles in a box that sizes to its content", async () => {
		// auto 표의 칸은 nowrap 줄이 최소 폭을 키우면 넓어진다 - 그 폭 변화에 다시 계산하면 줄 ↔ 브라우저 줄바꿈을 끝없이 오간다
		const { container } = render(
			<table style={{ width: 520, font: "16px/24px sans-serif", wordBreak: "keep-all" }}>
				<tbody>
					<tr>
						<td>
							<BalancedText as="p" style={{ margin: 0 }}>
								{`${text} 이 아래의 컴포넌트에서 부르고 글자 크기가 아니라 역할로 고릅니다.`}
							</BalancedText>
						</td>
						<td>짧은 칸과 긴 칸이 나란히 있으면 표가 내용에 맞춰 열 폭을 나눕니다</td>
					</tr>
				</tbody>
			</table>,
		);
		const p = container.querySelector("p") as HTMLElement;
		await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(1);
		await new Promise((r) => setTimeout(r, 600));
		const settled = lineTexts(p);
		await new Promise((r) => setTimeout(r, 600));
		expect(lineTexts(p)).toEqual(settled);
		// 줄이 열을 넓히지 않게 inline-block 으로 바꿔 그린다
		expect(p.querySelector(".text_balanced_line_boxed")).not.toBeNull();
	});

	it("never overflows when code with spaces and <wbr> wraps natively", async () => {
		const { container } = render(
			<BalancedText
				as="p"
				style={{ width: 260, font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
			>
				<code>query</code> 에{" "}
				<code>
					{"{ data,"}
					<wbr />
					{" isLoading,"}
					<wbr />
					{" error,"}
					<wbr />
					{" refetch }"}
				</code>{" "}
				를 그대로 넘깁니다. React Query 결과와 모양이 같습니다.
			</BalancedText>,
		);
		const p = container.firstElementChild as HTMLElement;
		await new Promise((r) => setTimeout(r, 400));
		expect(p.scrollWidth).toBeLessThanOrEqual(p.clientWidth + 1);
		for (const line of p.querySelectorAll(".text_balanced_line"))
			expect(line.getBoundingClientRect().right).toBeLessThanOrEqual(
				p.getBoundingClientRect().right + 0.5,
			);
	});

	it("does not mistake an outside resize right after drawing for its own growth", async () => {
		// 줄이 그려지는 바로 그 순간 바깥 상자를 넓힌다 - 예전엔 2프레임 안 넓어짐을 모두 자기 탓으로 봐 inline-block 줄로 굳었다
		const { container } = render(
			<div style={{ width: 300 }}>
				<BalancedText
					as="p"
					style={{ font: "16px/24px sans-serif", wordBreak: "keep-all", margin: 0 }}
				>
					{`${text} 이 아래의 컴포넌트에서 부르고 글자 크기가 아니라 역할로 고릅니다.`}
				</BalancedText>
			</div>,
		);
		const box = container.firstElementChild as HTMLElement;
		const p = box.firstElementChild as HTMLElement;
		// 마운트 때 그리기 전에(layout effect) 줄을 고르므로 render() 가 돌아오면 이미 줄이 있다 - 같은 작업 안, 칠하기 전이다
		expect(p.querySelector(".text_balanced_line")).not.toBeNull();
		box.style.width = "420px";
		await new Promise((r) => setTimeout(r, 500));
		expect(p.querySelector(".text_balanced_line_boxed")).toBeNull();
		await expect.poll(() => lineTexts(p).length, { timeout: 2000 }).toBeGreaterThan(0);
		for (const line of p.querySelectorAll(".text_balanced_line"))
			expect(line.getBoundingClientRect().right).toBeLessThanOrEqual(
				p.getBoundingClientRect().right + 0.5,
			);
	});
});
