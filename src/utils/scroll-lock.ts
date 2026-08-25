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
 * `overflow: hidden` 만 걸면 스크롤바가 사라지면서 콘텐츠가 그 폭만큼 넓어져 배경이 튄다.
 * 그래서 잠글 때 스크롤바 폭을 재서 `body` 의 `padding-right` 로 되돌려준다.
 *
 * 앱이 `html { scrollbar-gutter: stable }`(라우트 전환 시 가로 시프트 방지)을 쓰면 문제가 하나 더
 * 있다. 잠금 중에도 거터가 예약된 채 남고, `position: fixed` 의 컨테이닝 블록은 그 거터를 제외한
 * 콘텐츠 영역이라 오버레이가 거터에 닿지 못한다 - dim 옆에 밝은 띠가 남고 `100vw`/`100dvw`/`100lvw`
 * 로도 넘을 수 없다. 그래서 잠금 동안에는 `scrollbar-gutter: auto` 로 거터를 놓아 컨테이닝 블록을
 * 전폭으로 만들고, 놓은 만큼을 위의 `padding-right` 가 대신 잡아 콘텐츠 폭을 유지한다.
 *
 * 잰 폭은 `:root` 의 `--bt-scrollbar-width` 로도 노출한다. 앱의 `right: 0` 계열 고정 요소는
 * 잠금 중 그만큼 오른쪽으로 밀리므로, 그 변수로 자체 보정할 수 있다. 잠금 밖에서는 `theme.scss`
 * 의 기본값 `0px` 이라 `var()` 가 항상 유효하다.
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

		body.dataset[PREV_OVERFLOW] = body.style.overflow;
		body.dataset[PREV_GUTTER] = html.style.scrollbarGutter;
		body.dataset[PREV_PADDING_RIGHT] = body.style.paddingRight;
		body.dataset[PREV_SCROLLBAR_WIDTH_VAR] = html.style.getPropertyValue(SCROLLBAR_WIDTH_VAR);

		if (scrollbarWidth > 0) {
			html.style.setProperty(SCROLLBAR_WIDTH_VAR, `${scrollbarWidth}px`);
			html.style.scrollbarGutter = "auto";
			// 소비자가 이미 준 padding-right 에 더한다 - 덮어쓰면 그만큼 콘텐츠가 되레 움직인다.
			const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
			body.style.paddingRight = `${current + scrollbarWidth}px`;
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
