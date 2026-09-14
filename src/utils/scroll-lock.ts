"use client";

/**
 * 오버레이(Modal / Drawer / Alert) 공용 바디 스크롤 잠금.
 *
 * `document.body` 의 dataset 을 공유 상태로 써서 중첩 오버레이를 카운트한다 - 첫 잠금만 실제로
 * 스타일을 바꾸고 마지막 해제만 원복한다. 카운터를 안 쓰면 Modal 위 Alert 에서 하나만 닫혀도
 * 배경 스크롤이 풀린다.
 *
 * ## 오른쪽 띠를 만들지 않는다
 *
 * 잠금 동안 오른쪽에 **스크롤바도 예약된 거터도 남기지 않는다.** 남으면 그 자리는 캔버스(루트
 * 배경)가 칠하는 영역이라 오버레이 dim 이 덮지 못하고 밝은 띠가 된다.
 *
 * 3.17~3.20 은 그 띠를 루트 배경색에 딤을 합성해 칠하는 방식이었다. 계산은 맞았지만 **문서
 * 배경이 단색일 때만** 성립한다 - 띠 옆에 표·카드(흰색)와 페이지 배경(회색)이 함께 닿으면
 * 한쪽과만 일치해 경계에 세로선이 남았다(#635 실측 - 라이트에서 `0.5×244 = 122` 대 `128`).
 *
 * 그래서 잠금 동안 거터를 **풀고**(`scrollbar-gutter: auto`) 사라지는 폭만큼 `body` 에
 * `padding-right` 를 준다. 흐름 안 콘텐츠는 제자리에 남고, ICB 가 뷰포트 폭으로 넓어져
 * `inset: 0` 오버레이가 그 띠까지 실제로 덮는다. 실측(#635) - 거터 15px 예약 상태에서
 * `elementFromPoint(innerWidth - 5)` 가 `null` → 잠금 후 오버레이.
 *
 * `width: 100vw` 로 넓히는 방법은 되지 않는다. 같은 실측에서 `100vw` 가 거터를 **뺀** 742 로
 * 풀렸고, `calc(100vw + 40px)` 로 박스를 억지로 넓혀도 페인트는 거터 앞에서 잘렸다(#580 과
 * 같은 결과).
 *
 * ## ICB 가 넓어지는 대가
 *
 * 거터를 풀면 ICB 폭이 스크롤바 폭만큼 넓어져, `position: fixed` 로 가운데 정렬한 요소가
 * 그 절반만큼 움직인다(#574). DS 오버레이는 자기 컨테이너에 `padding-right:
 * var(--bt-scrollbar-width)` 를 줘서 상쇄한다 - 패널 중심이 잠금 전후로 같은 자리에 남는다
 * (#635 실측 - 잠금 전 371, 잠금 후 371).
 *
 * 소비자의 fixed 요소는 같은 변수와 `html[data-bt-scroll-locked]` 로 직접 상쇄할 수 있다.
 *
 * **문서가 스크롤되지 않고 거터도 없으면 아무것도 하지 않는다.** 앱 셸이 내부 컨테이너를
 * 스크롤 컨테이너로 삼으면 문서에는 애초에 스크롤바가 없다. 그때 폭 보정을 하면 없는 스크롤바를
 * 없애느라 레이아웃을 흔든다(#574).
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

/**
 * 잠금으로 회수되는 오른쪽 폭(px). 오버레이 스크롤바(macOS 기본)에서는 0.
 *
 * `window.innerWidth - documentElement.clientWidth` 로는 안 된다. 그 값은 "지금 스크롤바가
 * 떠 있는가" 만 재고, `scrollbar-gutter: stable` 이 **예약해 둔** 거터는 잡지 못한다. Chromium
 * 실측 - 거터 15px 이 예약된 상태에서 `innerWidth` 와 `clientWidth` 가 똑같이 1600 을 보고하고
 * (스크롤이 있든 없든), 같은 상황에서 `position: fixed` 박스는 1585px 로 잡힌다.
 *
 * 필요한 값은 "ICB 가 뷰포트보다 몇 px 좁은가" 다. fixed 박스를 하나 띄워 직접 잰다 - 클래식
 * 스크롤바든 예약된 거터든 같은 값으로 잡힌다.
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
 * 잠금 전 인라인 값으로 `--bt-scrollbar-width` 를 되돌린다.
 *
 * 소비자가 직접 잡아둔 값이 있었으면 그대로 살리고, 없었으면 인라인 override 만 지워
 * `theme.scss` 의 기본값 `0px` 으로 돌아가게 한다. 회수 실패 경로와 해제가 같은 규칙을 쓴다.
 */
const restoreScrollbarWidthVar = (html: HTMLElement, body: HTMLElement): void => {
	const prev = body.dataset[PREV_SCROLLBAR_WIDTH_VAR];
	if (prev) {
		html.style.setProperty(SCROLLBAR_WIDTH_VAR, prev);
	} else {
		html.style.removeProperty(SCROLLBAR_WIDTH_VAR);
	}
};

/** 오버레이 하나가 열릴 때 호출. 중첩되면 카운터만 올린다. */
export function lockBodyScroll(): void {
	if (typeof document === "undefined") return;

	const body = document.body;
	const html = document.documentElement;
	const open = Number.parseInt(body.dataset[COUNTER] || "0", 10);

	if (open === 0) {
		// overflow 를 건드리기 전에 재야 한다 - 잠근 뒤엔 스크롤바가 사라져 0 이 나온다.
		const inset = measureViewportInset();

		body.dataset[PREV_OVERFLOW] = body.style.overflow;
		body.dataset[PREV_GUTTER] = html.style.scrollbarGutter;
		body.dataset[PREV_PADDING_RIGHT] = body.style.paddingRight;
		body.dataset[PREV_SCROLLBAR_WIDTH_VAR] = html.style.getPropertyValue(SCROLLBAR_WIDTH_VAR);

		// 폭은 스크롤 여부와 무관하게 노출한다. 오버레이가 자기 정렬을 상쇄하는 데 쓰고,
		// 소비자도 자기 fixed 요소에 같은 보정을 걸 수 있다.
		if (inset > 0) {
			html.style.setProperty(SCROLLBAR_WIDTH_VAR, `${inset}px`);
		}

		body.style.overflow = "hidden";

		if (inset > 0) {
			// 앱이 예약해 둔 거터까지 풀어야 오버레이가 그 자리를 덮는다. 인라인이라
			// 스타일시트의 `stable` 을 이긴다.
			html.style.scrollbarGutter = "auto";
			// 회수한 폭만큼 콘텐츠 자리를 지킨다. 소비자가 이미 준 padding 에 **더한다** -
			// 덮어쓰면 그만큼 콘텐츠가 되레 움직인다.
			const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
			body.style.paddingRight = `${current + inset}px`;

			// 실제로 회수됐는지 확인한다. 앱이 `html { overflow-y: scroll }` 로 스크롤바를
			// 못박아 두면 잠금 뒤에도 그 자리가 남는데, 그때 padding 까지 주면 콘텐츠만 안쪽으로
			// 밀린다. 회수되지 않았으면 보정을 통째로 되돌린다 - **변수까지**. 이 변수는
			// "회수된 폭" 이라 오버레이·Toast·소비자 고정 요소가 전부 읽는다. 남겨 두면 ICB 가
			// 그대로인데 그것들만 스크롤바 폭만큼 밀린다.
			if (measureViewportInset() > 0) {
				body.style.paddingRight = body.dataset[PREV_PADDING_RIGHT] || "";
				restoreScrollbarWidthVar(html, body);
			}
		}

		// 잠금 여부를 CSS 로 알 수 있게 표식을 남긴다 - 소비자가 자기 고정 요소나 자기 오버레이를
		// 이 선택자로 조정할 수 있다.
		html.setAttribute(LOCKED_ATTR, "");
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
		html.removeAttribute(LOCKED_ATTR);
		restoreScrollbarWidthVar(html, body);

		delete body.dataset[COUNTER];
		delete body.dataset[PREV_OVERFLOW];
		delete body.dataset[PREV_GUTTER];
		delete body.dataset[PREV_PADDING_RIGHT];
		delete body.dataset[PREV_SCROLLBAR_WIDTH_VAR];
	} else {
		body.dataset[COUNTER] = String(remaining);
	}
}
