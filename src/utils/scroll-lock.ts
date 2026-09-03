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
 * 띠는 오버레이가 넘어가서 덮는다. 예약된 거터는 fixed 의 컨테이닝 블록 밖이라 `inset: 0` 이나
 * `100vw` 로는 닿지 않지만(둘 다 1185 로 잼) **음수 오프셋은 닿는다**(`right: -15px` → 1200).
 * 그래서 잰 폭을 `:root` 의 `--bt-scrollbar-width` 로 노출하고, 오버레이 dim 이
 * `right: calc(-1 * var(--bt-scrollbar-width, 0px))` 로 그만큼 넘어간다.
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
		const documentScrolls = html.scrollHeight > html.clientHeight;
		const canReserveGutter =
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("scrollbar-gutter: stable");

		body.dataset[PREV_OVERFLOW] = body.style.overflow;
		body.dataset[PREV_GUTTER] = html.style.scrollbarGutter;
		body.dataset[PREV_PADDING_RIGHT] = body.style.paddingRight;
		body.dataset[PREV_SCROLLBAR_WIDTH_VAR] = html.style.getPropertyValue(SCROLLBAR_WIDTH_VAR);

		if (documentScrolls && scrollbarWidth > 0) {
			// 오버레이가 거터를 넘어가 덮을 수 있게 잰 폭을 노출한다.
			html.style.setProperty(SCROLLBAR_WIDTH_VAR, `${scrollbarWidth}px`);

			if (canReserveGutter) {
				// 거터를 예약해 ICB 폭을 유지한다 - padding 보정이 필요 없다.
				html.style.scrollbarGutter = "stable";
			} else {
				// 폴백 - 소비자가 이미 준 padding-right 에 더한다. 덮어쓰면 그만큼 콘텐츠가 되레 움직인다.
				const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
				body.style.paddingRight = `${current + scrollbarWidth}px`;
			}
		}

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
	} else {
		body.dataset[COUNTER] = String(remaining);
	}
}
