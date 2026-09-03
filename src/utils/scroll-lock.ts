"use client";

/**
 * 오버레이(Modal / Drawer / Alert) 공용 바디 스크롤 잠금.
 *
 * `document.body` 의 dataset 을 공유 상태로 써서 중첩 오버레이를 카운트한다 - 첫 잠금만 실제로
 * 스타일을 바꾸고 마지막 해제만 원복한다. 카운터를 안 쓰면 Modal 위 Alert 에서 하나만 닫혀도
 * 배경 스크롤이 풀린다.
 *
 * ## 스크롤바 폭 보정
 *
 * `overflow: hidden` 만 걸면 스크롤바가 사라지고 그만큼 콘텐츠 영역이 넓어져 배경이 튄다.
 * 넓어지는 것은 콘텐츠만이 아니다 - **ICB(초기 컨테이닝 블록) 폭이 함께 변해서**
 * `position: fixed; left: 50%` 처럼 폭에 비례하는 값을 쓰는 요소가 절반만큼 움직인다.
 *
 * 그래서 잠금 동안 거터를 **예약**한다(`scrollbar-gutter: stable`). 스크롤바가 사라져도 그 자리가
 * 남아 ICB 폭이 변하지 않으므로, 흐름 안 콘텐츠도 fixed 요소도 움직이지 않고 `padding-right`
 * 보정 자체가 필요 없다.
 *
 * 예전에는 반대로 거터를 놓았다(`auto`). 앱이 `html { scrollbar-gutter: stable }` 을 쓰면 잠금
 * 중에도 거터가 남아 오버레이가 그 띠를 덮지 못했기 때문인데, 그 방법은 ICB 폭을 바꿔 fixed
 * 요소를 스크롤바 폭의 **절반**만큼 이동시켰다(#574). 실측 - 뷰포트 1200·스크롤바 15px 에서
 * ICB 1185 → 1200, `left: 50%` 배지 중심 592.5 → 600.
 *
 * ## 예약된 거터를 어둡게 하는 방법
 *
 * 예약된 거터는 **캔버스**(루트 요소의 배경)가 칠하는 영역이라 `html` 의 자손은 거기에 페인트할
 * 수 없다. 오버레이 dim 에 음수 오프셋을 줘 봤지만(3.17.1) 박스만 넓어지고 페인트는 거터 앞에서
 * 잘렸다 - 실측으로 `getBoundingClientRect().right` 는 1280 인데
 * `elementFromPoint(1266, 250)` 이 `null` 이었다(#580).
 *
 * 루트의 `background-image` 도 거터로 전파되지 않는다(실측). 전파되는 것은 **background-color
 * 하나뿐**이다. 그래서 잠금 동안 딤을 미리 합성해 루트 배경색으로 심는다 - 거터에는 "딤이 덮인
 * 페이지 배경"과 같은 색이 나타난다. 해제 시 인라인 스냅샷으로 원복한다.
 *
 * 잰 폭은 `:root` 의 `--bt-scrollbar-width` 로 계속 노출한다. 소비자가 자기 오버레이를 만들 때
 * 거터 폭을 알아야 하고, 잠금 여부는 `html[data-bt-scroll-locked]` 로 알 수 있다.
 *
 * `scrollbar-gutter` 미지원(Safari 18.2 미만)에서는 예약이 불가능하므로 기존 `padding-right`
 * 보정을 폴백으로 쓴다. 그 브라우저에서는 fixed 요소의 이동이 남는다 - 브라우저가 주는 한계다.
 *
 * **문서가 스크롤되지 않으면 아무것도 하지 않는다.** 앱 셸이 내부 컨테이너를 스크롤 컨테이너로
 * 삼으면 문서에는 애초에 스크롤바가 없다. 그때 폭 보정을 하면 없는 스크롤바를 없애느라 레이아웃을
 * 흔든다 - 예약된 거터를 스크롤바로 오인해 실제로 그렇게 됐다(#574).
 */

/** 중첩 카운터. 기존 공개 동작이라 이름 유지 (`body.dataset.openModals`). */
const COUNTER = "openModals";
/** 원복용 스냅샷 - 전부 **인라인** 값을 저장한다. 계산값을 저장해 되쓰면 원래 없던 인라인
 *  스타일이 생겨 소비자 스타일시트 규칙을 덮어버린다. */
const PREV_OVERFLOW = "originalOverflow";
const PREV_GUTTER = "originalScrollbarGutter";
const PREV_PADDING_RIGHT = "originalPaddingRight";
/** 소비자가 이 변수를 직접 인라인으로 잡아둔 경우가 있으므로 그 값도 스냅샷한다 - 잠금 한 번에
 *  조용히 지워지면 안 된다. 미설정이면 `""` 이고, 그때만 해제 시 `removeProperty` 로 제거한다. */
const PREV_SCROLLBAR_WIDTH_VAR = "originalScrollbarWidthVar";

const SCROLLBAR_WIDTH_VAR = "--bt-scrollbar-width";

/** 잠금 중 루트에 남기는 표식. 소비자가 잠금 상태를 CSS 로 알 수 있게 공개한다. */
const LOCKED_ATTR = "data-bt-scroll-locked";
/** 딤 색 토큰. 커스텀 프로퍼티라 계산값이 아닌 저작 텍스트로 읽히므로 정규화가 필요하다. */
const DIM_VAR = "--bt-color-bg-overlay";
/** 소비자가 `style.css` 를 넣지 않은 경우의 기본값 - light 테마 딤과 같다. */
const DIM_FALLBACK = "rgba(0, 0, 0, 0.5)";
/** 원복용 인라인 스냅샷 - 거터를 칠하려고 루트 배경색을 건드리므로 함께 저장한다. */
const PREV_BACKGROUND_COLOR = "originalBackgroundColor";

type Rgba = [number, number, number, number];

const WHITE: Rgba = [255, 255, 255, 1];

const parseRgb = (value: string): Rgba | null => {
	const match = value.trim().match(/^rgba?\(([^)]+)\)$/i);
	if (!match) return null;
	const parts = match[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.map(Number);
	if (parts.length < 3 || parts.some(Number.isNaN)) return null;
	return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
};

/** 커스텀 프로퍼티 값은 정규화되지 않은 저작 텍스트(`#000`, `hsl(...)`, `oklch(...)`)일 수
 *  있으므로 요소에 한 번 태워 브라우저가 계산한 `rgb()` 로 받는다. */
const normalizeColor = (value: string): Rgba | null => {
	const direct = parseRgb(value);
	if (direct) return direct;

	const probe = document.createElement("div");
	probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden";
	probe.style.color = value;
	document.documentElement.appendChild(probe);
	const computed = window.getComputedStyle(probe).color;
	probe.remove();

	return parseRgb(computed);
};

/** `top` 을 `bottom` 위에 알파 합성한다. 결과는 항상 불투명하다. */
const over = (top: Rgba, bottom: Rgba): Rgba => [
	Math.round(top[0] * top[3] + bottom[0] * (1 - top[3])),
	Math.round(top[1] * top[3] + bottom[1] * (1 - top[3])),
	Math.round(top[2] * top[3] + bottom[2] * (1 - top[3])),
	1,
];

/**
 * 거터에 심을 루트 배경색. 딤을 지금 보이는 캔버스 색 위에 합성한 값이다.
 *
 * 캔버스 색은 루트 배경색이고, 루트가 투명하면 `body` 배경색이 전파된다 - 그 순서로 찾는다.
 * 둘 다 투명하면 브라우저 기본 배경(흰색)이 바닥이다.
 */
const measureCanvasColors = (html: HTMLElement, body: HTMLElement): [Rgba, Rgba] | null => {
	const raw = window.getComputedStyle(html).getPropertyValue(DIM_VAR).trim() || DIM_FALLBACK;
	const dim = normalizeColor(raw);
	if (!dim || dim[3] <= 0) return null;

	const candidates = [
		parseRgb(window.getComputedStyle(html).backgroundColor),
		parseRgb(window.getComputedStyle(body).backgroundColor),
	];
	const base = candidates.find((color): color is Rgba => color !== null && color[3] > 0) ?? WHITE;

	return [dim, over(base, WHITE)];
};

/**
 * 잠금으로 회수되는 오른쪽 폭(px). 오버레이 스크롤바(macOS 기본)에서는 0.
 *
 * `window.innerWidth - documentElement.clientWidth` 로는 안 된다. 그 값은 "지금 스크롤바가
 * 떠 있는가" 만 재고, `scrollbar-gutter: stable` 이 **예약해 둔** 거터는 잡지 못한다. Chromium
 * 실측 - 거터 15px 이 예약된 상태에서 `innerWidth` 와 `clientWidth` 가 똑같이 1600 을 보고하고
 * (스크롤이 있든 없든), 같은 상황에서 `position: fixed` 박스는 1585px 로 잡힌다. 그래서 잠금이
 * 거터를 놓지 못하고 오버레이 옆에 거터 폭만큼 빈 띠가 남았다.
 *
 * 필요한 값은 "ICB 가 뷰포트보다 몇 px 좁은가" 다. fixed 박스를 하나 띄워 직접 잰다 - 클래식
 * 스크롤바든 예약된 거터든 같은 값으로 잡히므로 기존 `> 0` 분기는 그대로 쓸 수 있다.
 */
const measureViewportInset = () => {
	const probe = document.createElement("div");
	probe.style.cssText =
		"position:fixed;top:0;left:0;right:0;height:0;visibility:hidden;pointer-events:none";
	// body 가 아니라 html 에 붙인다 - 소비자가 body 에 transform/filter/contain 을 걸어두면
	// 그것이 fixed 의 컨테이닝 블록이 되어 뷰포트가 아닌 값을 재게 된다.
	document.documentElement.appendChild(probe);
	const width = probe.getBoundingClientRect().width;
	probe.remove();

	// 레이아웃하지 않는 환경(jsdom)에서는 0 이 나온다. 그때 innerWidth 를 그대로 보정폭으로
	// 쓰면 body 에 뷰포트 폭만큼 padding 이 붙는다 - 보정하지 않는 쪽이 맞다.
	if (width <= 0) return 0;

	return Math.max(0, window.innerWidth - width);
};

/**
 * 딤 진행도 보고자들. 오버레이의 딤 스프링이 프레임마다 자기 opacity 를 보고하고, 거터 색은
 * 그 합성값을 따른다 - 잠금 순간 최종색으로 점프하면 딤이 페이드 인하는 동안(~350ms) 거터만
 * 먼저 어두워져 오른쪽에 어두운 띠가 보인다(#583).
 *
 * 아무도 보고하지 않으면(`lockBodyScroll` 을 직접 부르는 소비자) 진행도 1 로 본다 - 예전 동작.
 */
const dimProgress = new Map<object, number>();
/** 잠금 시점에 잰 값들. 프레임마다 다시 재지 않는다 - 잠금 중에는 변하지 않고, 재면 비싸다. */
let canvasBase: Rgba | null = null;
let canvasDim: Rgba | null = null;

/** 보고된 진행도들을 겹쳐 실제 딤 두께를 만든다. 중첩 오버레이는 딤이 실제로 겹쳐 보인다. */
const combinedDimAlpha = (alpha: number): number => {
	if (dimProgress.size === 0) return alpha;
	let transmitted = 1;
	for (const progress of dimProgress.values()) {
		transmitted *= 1 - alpha * progress;
	}
	return 1 - transmitted;
};

const paintCanvas = (html: HTMLElement): void => {
	if (!canvasBase || !canvasDim) return;
	const alpha = combinedDimAlpha(canvasDim[3]);
	const [r, g, b] = over([canvasDim[0], canvasDim[1], canvasDim[2], alpha], canvasBase);
	html.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
};

/**
 * 딤의 현재 진행도(0~1)를 보고한다. 오버레이가 자기 딤 스프링의 `onChange` 에서 부른다.
 *
 * `owner` 는 오버레이 인스턴스마다 고유한 아무 객체면 된다(보통 `useRef({}).current`) - 중첩
 * 오버레이의 진행도를 각각 추적하기 위한 키다. 잠금이 완전히 풀릴 때 전부 비워진다.
 */
export function reportOverlayDim(owner: object, progress: number): void {
	if (typeof document === "undefined") return;

	dimProgress.set(owner, Math.min(1, Math.max(0, progress)));
	paintCanvas(document.documentElement);
}

/**
 * 오버레이가 사라질 때 자기 보고를 뺀다. 부모 잠금이 남아 있으면 `dimProgress.clear()` 가 돌지
 * 않아 닫힌 자식의 키가 남는데, 부모 잠금 아래서 자식을 반복해 열고 닫으면 그만큼 쌓이고
 * 합성이 매번 그 죽은 항목까지 순회한다.
 */
export function unregisterOverlayDim(owner: object): void {
	if (typeof document === "undefined") return;
	if (!dimProgress.delete(owner)) return;

	// 남은 오버레이만의 두께로 다시 칠한다 - 마지막 해제 뒤라면 측정값이 없어 no-op 다.
	paintCanvas(document.documentElement);
}

/** 오버레이 하나가 열릴 때 호출. 중첩되면 카운터만 올린다. */
export function lockBodyScroll(): void {
	if (typeof document === "undefined") return;

	const body = document.body;
	const html = document.documentElement;
	const open = Number.parseInt(body.dataset[COUNTER] || "0", 10);

	if (open === 0) {
		// overflow 를 건드리기 전에 재야 한다 - 잠근 뒤엔 스크롤바가 사라져 0 이 나온다.
		const scrollbarWidth = measureViewportInset();
		// 문서가 스크롤되지 않으면 없앨 스크롤바도 없다. 예약된 거터만 있는 앱이 이 경로로
		// 들어와 레이아웃이 흔들렸다.
		// 스크롤 요소는 보통 `documentElement` 지만, 앱이 `html` 에 overflow 를 걸면 `body` 가
		// 실제 스크롤 요소가 된다. 브라우저가 알려주는 값을 쓴다.
		const scroller = document.scrollingElement ?? html;
		const documentScrolls = scroller.scrollHeight > scroller.clientHeight;
		const canReserveGutter =
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("scrollbar-gutter: stable");

		body.dataset[PREV_OVERFLOW] = body.style.overflow;
		body.dataset[PREV_GUTTER] = html.style.scrollbarGutter;
		body.dataset[PREV_PADDING_RIGHT] = body.style.paddingRight;
		body.dataset[PREV_SCROLLBAR_WIDTH_VAR] = html.style.getPropertyValue(SCROLLBAR_WIDTH_VAR);
		body.dataset[PREV_BACKGROUND_COLOR] = html.style.backgroundColor;

		// 폭 노출은 스크롤 여부와 무관하다. 앱이 이미 거터를 예약해 둔 채 문서가 스크롤되지
		// 않는 구성에서도 그 거터는 화면에 남아 있고, 오버레이가 넘어가 덮어야 한다 - 이 값이
		// 없으면 dim 옆에 밝은 띠가 그대로 남는다.
		if (scrollbarWidth > 0) {
			html.style.setProperty(SCROLLBAR_WIDTH_VAR, `${scrollbarWidth}px`);
		}

		// 폭 보정(거터 예약·padding)은 실제로 스크롤바가 사라질 때만 필요하다.
		if (documentScrolls && scrollbarWidth > 0) {
			if (canReserveGutter) {
				// 거터를 예약해 ICB 폭을 유지한다 - padding 보정이 필요 없다.
				html.style.scrollbarGutter = "stable";
			} else {
				// 폴백 - 소비자가 이미 준 padding-right 에 더한다. 덮어쓰면 그만큼 콘텐츠가 되레 움직인다.
				const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
				body.style.paddingRight = `${current + scrollbarWidth}px`;
			}
		}

		// 잠금 중 거터가 남는 모든 경로에서 그 띠를 어둡게 한다 (#580) - 우리가 방금 예약한
		// 경우든, 앱이 이미 예약해 둔 경우(문서가 스크롤되지 않아 위 분기를 타지 않는다)든.
		// padding 폴백 경로는 거터가 아예 없으므로 제외된다.
		if (scrollbarWidth > 0 && canReserveGutter) {
			const measured = measureCanvasColors(html, body);
			if (measured) {
				[canvasDim, canvasBase] = measured;
				paintCanvas(html);
			}
		}

		// 잠금 여부를 CSS 로 알 수 있게 표식을 남긴다 - 소비자가 자기 고정 요소나 자기 오버레이를
		// 이 선택자로 조정할 수 있다.
		html.setAttribute(LOCKED_ATTR, "");

		body.style.overflow = "hidden";
	}

	body.dataset[COUNTER] = String(open + 1);
}

/** 오버레이 하나가 닫힐 때 호출. 마지막 해제에서만 원복한다. */
export function unlockBodyScroll(): void {
	if (typeof document === "undefined") return;

	const body = document.body;
	const html = document.documentElement;
	const remaining = Number.parseInt(body.dataset[COUNTER] || "1", 10) - 1;

	// `<= 0` - 중복 해제(퇴출 애니메이션 중 unmount 가 두 번 도는 경우 등)에도 카운터가
	// 음수로 새지 않게 한다.
	if (remaining <= 0) {
		body.style.overflow = body.dataset[PREV_OVERFLOW] || "";
		body.style.paddingRight = body.dataset[PREV_PADDING_RIGHT] || "";
		html.style.scrollbarGutter = body.dataset[PREV_GUTTER] || "";
		html.style.backgroundColor = body.dataset[PREV_BACKGROUND_COLOR] || "";
		html.removeAttribute(LOCKED_ATTR);
		// 소비자가 잡아둔 인라인 값이 있었으면 그대로 되돌리고, 없었으면 인라인 override 만 지워
		// theme.scss 의 기본값 `0px` 으로 되돌아가게 한다.
		const prevVar = body.dataset[PREV_SCROLLBAR_WIDTH_VAR];
		if (prevVar) {
			html.style.setProperty(SCROLLBAR_WIDTH_VAR, prevVar);
		} else {
			html.style.removeProperty(SCROLLBAR_WIDTH_VAR);
		}

		delete body.dataset[COUNTER];
		delete body.dataset[PREV_OVERFLOW];
		delete body.dataset[PREV_GUTTER];
		delete body.dataset[PREV_PADDING_RIGHT];
		delete body.dataset[PREV_SCROLLBAR_WIDTH_VAR];
		delete body.dataset[PREV_BACKGROUND_COLOR];

		// 다음 잠금은 그 시점의 색으로 다시 잰다. 보고자도 전부 비운다 - 남겨두면 다음 잠금이
		// 남의 진행도로 시작한다.
		dimProgress.clear();
		canvasBase = null;
		canvasDim = null;
	} else {
		// 중첩 해제 - 카운터만 내린다. **여기서 다시 칠하지 않는 것이 맞다**: 딤 두께는 카운터가
		// 아니라 보고된 진행도에서 나오고, 그 진행도는 이 함수가 건드리지 않으므로 재계산해도
		// 같은 색이다. 닫히는 오버레이의 몫은 두 곳에서 빠진다 - 퇴출 스프링이 0 까지 보고하고
		// (컨트롤드 경로), cleanup 이 `unregisterOverlayDim` 으로 항목을 지운다(강제 unmount
		// 포함). 그래서 Vanilla 의 대응 분기와 달라 보이는데, 그쪽은 두께를 **카운터로** 세므로
		// 카운터가 줄면 반드시 다시 칠해야 한다 - 같은 목적의 다른 구현이다.
		//
		// 이 판단은 단정이 아니라 테스트로 고정돼 있다 - "keeps the gutter color when a
		// non-reporting lock is released mid-chain"(보고 없는 잠금이 풀려도 색 불변),
		// "recovers the gutter when a nested overlay is force-unmounted"(실제 중첩
		// 컴포넌트를 열린 채 떼어내도 색 복귀). 잠금 API 는 공개 표면이 아니라 이 저장소의
		// 오버레이 3종만 쓰고, 셋 다 보고와 해제를 짝지었는지 `check:geometry` 가 지킨다.
		body.dataset[COUNTER] = String(remaining);
	}
}
