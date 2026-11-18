import { afterEach, describe, expect, it } from "vitest";
import { chooseBreaks, layoutNative, toWords } from "./layout";
import { createCanvasMeasurer, fontOf } from "./measure";

// 엔진의 "브라우저라면 여기서 끊는다" 가 실제 Chromium 줄바꿈과 같은지 (#1083).
// 이 예측이 틀리면 고른 줄바꿈도 실제 화면에서 다르게 놓인다.
const TEXTS = [
	"글자 크기가 아니라 역할로 고릅니다. 제목이면 heading, 본문이면 body 입니다. SCSS 믹스인 하나가 크기 · 굵기 · 줄 높이를 함께 정합니다.",
	"pnpm build 가 이 사이트와 같은 원본(페이지 데이터 · 예제 파일 · 타입)에서 만들어 패키지에 싣습니다. 사이트와 내용이 갈라지지 않습니다.",
	"Bigtablet 제품 화면을 만드는 컴포넌트와 디자인 토큰입니다. React와 서버 템플릿(Thymeleaf · JSP · PHP)에서 같은 모양으로 씁니다.",
	"고객의 신뢰를 먼저 얻은 다음에 더 많은 데이터를 요청하세요",
	'결제 금액 12,000원이 2026. 5. 21. 에 빠져나갑니다. "저장" 을 누르면 바로 반영되고, 취소는 7일 안에 할 수 있습니다!',
	"Write headlines for readers not for internal approval, then ship the docs site to GitHub Pages.",
	"`useToast` · `useAlert` 는 이 아래의 컴포넌트에서 부릅니다. ToastProvider 는 앱 최상위(app/layout.tsx)에서 한 번 감쌉니다.",
];
const WIDTHS = Array.from({ length: 15 }, (_, i) => 140 + i * 25);

const box = (text: string, width: number) => {
	const p = document.createElement("p");
	p.style.cssText = `width:${width}px;font:16px/24px sans-serif;word-break:keep-all;margin:0`;
	p.textContent = text;
	document.body.appendChild(p);
	return p;
};

/** DOM 이 실제로 그린 줄 - 어절마다 첫 글자의 top 으로 같은 줄을 묶는다 */
const domLines = (p: HTMLElement) => {
	const node = p.firstChild as Text;
	const tops: number[] = [];
	for (const w of toWords(node.data)) {
		const range = document.createRange();
		range.setStart(node, w.start);
		range.setEnd(node, w.start + 1);
		tops.push(Math.round(range.getBoundingClientRect().top));
	}
	return tops.flatMap((top, i) => (i > 0 && top !== tops[i - 1] ? [i - 1] : []));
};

afterEach(() => {
	document.body.innerHTML = "";
});

describe("layoutNative matches Chromium keep-all wrapping", () => {
	for (const text of TEXTS) {
		for (const width of WIDTHS) {
			it(`${width}px · ${text.slice(0, 14)}…`, () => {
				const p = box(text, width);
				const { font, letterSpacing } = fontOf(p);
				const measure = createCanvasMeasurer(font, letterSpacing);
				if (!measure) throw new Error("canvas 없음");
				expect(layoutNative(toWords(text), measure, width)).toEqual(domLines(p));
			});
		}
	}
});

describe("chosen breaks hold in the real layout", () => {
	// 고른 줄을 inline-block 으로 그렸을 때 실제로 그 줄 수 · 그 자리에서 끊기는지
	for (const text of TEXTS) {
		for (const width of WIDTHS) {
			it(`${width}px · ${text.slice(0, 14)}…`, () => {
				const probe = box(text, width);
				const { font, letterSpacing } = fontOf(probe);
				const measure = createCanvasMeasurer(font, letterSpacing);
				if (!measure) throw new Error("canvas 없음");
				const { breaks } = chooseBreaks(text, measure, width);
				probe.remove();

				const words = toWords(text);
				const p = document.createElement("p");
				p.style.cssText = `width:${width}px;font:16px/24px sans-serif;word-break:keep-all;margin:0`;
				let from = 0;
				for (const end of [...breaks, words.length - 1]) {
					const line = document.createElement("span");
					line.style.cssText = "display:inline-block";
					line.textContent = text.slice(words[from]?.start, words[end]?.end);
					if (from > 0 && words[from]?.spaceBefore) p.append(" ");
					p.append(line);
					from = end + 1;
				}
				document.body.appendChild(p);
				const spans = [...p.querySelectorAll("span")];
				const tops = new Set(spans.map((s) => Math.round(s.getBoundingClientRect().top)));
				expect(tops.size).toBe(breaks.length + 1);
				for (const s of spans) expect(s.getBoundingClientRect().height).toBe(24);
			});
		}
	}
});
