import { measureViewportInset } from "./utils.js";

/* ========================================
     Escape 스택 (React overlay-stack 과 같은 규약)
     ======================================== */

/**
 * 열린 오버레이들이 공유하는 Escape 스택. document 리스너는 하나만 두고 **최상단**의
 * 핸들러만 부른다. 오버레이마다 document 에 자기 리스너를 걸면 Modal 위에 Alert 를 띄운 뒤
 * Escape 한 번에 둘이 같이 닫힌다 - 실측으로 그랬다. APG 는 최상단만 닫히길 요구한다.
 */
export const escapeStack = [];

export function onEscapeKeyDown(e) {
	// 자식이 preventDefault 로 "처리했다" 고 알린 Escape 는 넘긴다 - React overlay-stack 과 같은
	// 규약. 안 보면 Modal 안의 Select 목록을 Esc 로 닫는 순간 Modal 까지 닫힌다(#697).
	if (e.key !== "Escape" || e.defaultPrevented) return;
	const top = escapeStack[escapeStack.length - 1];
	if (!top) return;
	e.stopImmediatePropagation();
	top();
}

/** Escape 를 소비만 하고 아무것도 닫지 않는 핸들러. `closeOnEscape: false` 인 모달용. */
export function noop() {}

/** 최상단에 등록하고 해제 함수를 돌려준다. 마지막 항목이 빠지면 리스너도 뗀다. */
export function pushEscape(handler) {
	if (escapeStack.length === 0) document.addEventListener("keydown", onEscapeKeyDown);
	escapeStack.push(handler);
	let done = false;
	return () => {
		if (done) return;
		done = true;
		const i = escapeStack.lastIndexOf(handler);
		if (i !== -1) escapeStack.splice(i, 1);
		if (escapeStack.length === 0) document.removeEventListener("keydown", onEscapeKeyDown);
	};
}

/**
 * 잠금 전 인라인 값으로 `--bt-scrollbar-width` 를 되돌린다 (React 쪽과 같은 규칙).
 * 소비자가 잡아둔 값이 있었으면 살리고, 없었으면 인라인 override 만 지운다.
 */
export function restoreScrollbarWidthVar(html, body) {
	const prev = body.dataset.btOriginalScrollbarWidthVar;
	if (prev) {
		html.style.setProperty("--bt-scrollbar-width", prev);
	} else {
		html.style.removeProperty("--bt-scrollbar-width");
	}
}

export function lockScroll() {
	const body = document.body;
	const html = document.documentElement;
	const n = parseInt(body.dataset.btOpenModals || "0", 10);
	if (n === 0) {
		// overflow 를 건드리기 전에 재야 한다 - 잠근 뒤엔 스크롤바가 사라져 0 이 나온다.
		const inset = measureViewportInset();

		// 소비자가 인라인으로 지정해둔 값들을 저장했다가 마지막 unlock 때 복원
		// (React 쪽 utils/scroll-lock.ts 와 동일 동작).
		// shorthand 와 축을 **함께** 저장한다. 브라우저 CSSOM 은 두 축이 모두 인라인일 때만
		// shorthand(`style.overflow`)를 되읽어 주므로 `html.style.overflowX` 만 잡아 둔 앱은
		// shorthand 가 `""` 로 읽히고, 그것만 되쓰면 그 축이 사라진다. jsdom 은 반대로
		// shorthand 와 축이 독립 슬롯이라 축만으로는 부족하다 (React 쪽과 같은 처리).
		body.dataset.btOriginalOverflow = body.style.overflow;
		body.dataset.btOriginalOverflowX = body.style.overflowX;
		body.dataset.btOriginalOverflowY = body.style.overflowY;
		body.dataset.btOriginalHtmlOverflow = html.style.overflow;
		body.dataset.btOriginalHtmlOverflowX = html.style.overflowX;
		body.dataset.btOriginalHtmlOverflowY = html.style.overflowY;
		body.dataset.btOriginalGutter = html.style.scrollbarGutter;
		body.dataset.btOriginalPaddingRight = body.style.paddingRight;
		// 소비자가 이 변수를 직접 인라인으로 잡아둔 경우 잠금 한 번에 지워지지 않도록 함께 스냅샷.
		body.dataset.btOriginalScrollbarWidthVar = html.style.getPropertyValue("--bt-scrollbar-width");

		// 폭은 스크롤 여부와 무관하게 노출한다 - 오버레이가 자기 정렬을 상쇄하는 데 쓰고,
		// 소비자도 자기 fixed 요소에 같은 보정을 건다 (React 쪽과 동일).
		if (inset > 0) {
			html.style.setProperty("--bt-scrollbar-width", `${inset}px`);
		}

		body.style.overflow = "hidden";
		// `html` 에도 건다 - body 의 overflow 는 html 이 `visible` 일 때만 뷰포트로 전파된다.
		// `html { overflow-x: hidden }` 같은 리셋이 있으면 body 만 잠가도 문서가 스크롤된다
		// (React 쪽과 같은 실측).
		html.style.overflow = "hidden";

		if (inset > 0) {
			// 앱이 예약해 둔 거터까지 풀어야 오버레이가 그 자리를 덮는다.
			html.style.scrollbarGutter = "auto";
			const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
			body.style.paddingRight = `${current + inset}px`;

			// 실제로 회수됐는지 확인한다. 앱이 `html { overflow-y: scroll }` 로 스크롤바를
			// 못박아 두면 그 자리가 남는데, 그때 padding 까지 주면 콘텐츠만 밀린다.
			// 회수되지 않았으면 **변수까지** 되돌린다 - 오버레이·Toast·소비자 고정 요소가
			// 그 값을 읽어 보정하므로, 남겨 두면 ICB 가 그대로인데 그것들만 밀린다.
			if (measureViewportInset() > 0) {
				body.style.paddingRight = body.dataset.btOriginalPaddingRight || "";
				restoreScrollbarWidthVar(html, body);
			}
		}

		// 잠금 여부를 CSS 로 알 수 있게 표식을 남긴다 (React 쪽과 같은 속성).
		html.setAttribute("data-bt-scroll-locked", "");
	}
	body.dataset.btOpenModals = String(n + 1);
}

export function unlockScroll() {
	const body = document.body;
	const html = document.documentElement;
	const n = parseInt(body.dataset.btOpenModals || "1", 10) - 1;
	if (n <= 0) {
		// shorthand → 축 순서로 되쓴다 (React 쪽과 동일).
		body.style.overflow = body.dataset.btOriginalOverflow || "";
		body.style.overflowX = body.dataset.btOriginalOverflowX || "";
		body.style.overflowY = body.dataset.btOriginalOverflowY || "";
		html.style.overflow = body.dataset.btOriginalHtmlOverflow || "";
		html.style.overflowX = body.dataset.btOriginalHtmlOverflowX || "";
		html.style.overflowY = body.dataset.btOriginalHtmlOverflowY || "";
		body.style.paddingRight = body.dataset.btOriginalPaddingRight || "";
		html.style.scrollbarGutter = body.dataset.btOriginalGutter || "";
		html.removeAttribute("data-bt-scroll-locked");
		restoreScrollbarWidthVar(html, body);
		delete body.dataset.btOpenModals;
		delete body.dataset.btOriginalOverflow;
		delete body.dataset.btOriginalOverflowX;
		delete body.dataset.btOriginalOverflowY;
		delete body.dataset.btOriginalHtmlOverflow;
		delete body.dataset.btOriginalHtmlOverflowX;
		delete body.dataset.btOriginalHtmlOverflowY;
		delete body.dataset.btOriginalGutter;
		delete body.dataset.btOriginalPaddingRight;
		delete body.dataset.btOriginalScrollbarWidthVar;
	} else {
		body.dataset.btOpenModals = String(n);
	}
}

/**
 * 퇴출 모션이 끝나면 done 을 부른다 - React `usePresence` 와 같은 판정 (#909).
 * 닫힘 상태(클래스·data-state)를 건 **뒤에** 부른다 - getAnimations() 가 대기 중인 스타일을 먼저 반영해
 * 방금 시작된 퇴출 애니메이션·transition 이 잡힌다. 돌고 있는 것이 없으면(reduced-motion, jsdom)
 * 바로 부른다 - animationend 를 기다리면 오지 않아 요소가 남는다. 자식은 훑지 않는다(본문의
 * Spinner 같은 무한 애니메이션을 기다리면 영영 끝나지 않는다).
 */
export function afterExit(elements, done) {
	const animations = elements.flatMap((el) => el?.getAnimations?.() ?? []);
	if (animations.length === 0) done();
	// allSettled - 진입 도중 닫혀 취소된 애니메이션(finished reject)도 끝난 것으로 본다.
	else void Promise.allSettled(animations.map((a) => a.finished)).then(done);
}
