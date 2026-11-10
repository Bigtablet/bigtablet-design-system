"use client";

import * as React from "react";

// 초기 포커스에서만 건너뛸 요소 표시. 스크롤 컨테이너처럼 "탭 순환에는 있어야 하지만
// 열자마자 포커스가 놓일 자리는 아닌" wrapper 를 위한 것 (Modal 의 본문 영역).
const SKIP_AUTOFOCUS_ATTR = "data-focus-trap-skip-autofocus";

const FOCUSABLE_SELECTORS = [
	"a[href]",
	"button:not([disabled])",
	// type=hidden 은 focus() 를 무시한다 - 폼의 _csrf 등이 첫 후보가 되면 초기 포커스가 밖에 남고
	// Tab 트랩의 첫·끝 판정이 어긋난다 (#900, vanilla 는 #898)
	'input:not([disabled]):not([type="hidden"])',
	"select:not([disabled])",
	"textarea:not([disabled])",
	// tabindex 가 붙은 hidden input 도 이 경로로 들어오지 않게
	'[tabindex]:not([tabindex="-1"]):not(input[type="hidden"])',
].join(", ");

/**
 * 지금 실제로 포커스를 받을 수 있는지 - 선택자는 맞아도 `hidden` · `[inert]` · `display:none` 안이면
 * focus() 가 무시된다. 그게 마지막 후보가 되면 Tab 이 트랩을 빠져 body 로 갔다 (#982).
 * `checkVisibility` 가 없는 환경(jsdom)은 속성만 본다.
 */
const isTabbable = (el: HTMLElement) =>
	!el.closest("[hidden], [inert]") && el.checkVisibility?.() !== false;

/** 닫히는 중인 오버레이(퇴출 모션 동안 DOM 에 남는다) - 포커스를 돌려줄 자리가 아니다 */
const CLOSING_OVERLAY = '[aria-modal="true"][data-state="closed"]';

export interface FocusTrapOptions {
	/**
	 * 초기 포커스를 **먼저 찾을** 영역. 여기 안에 포커스 가능한 컨트롤이 있으면 그 첫 번째로
	 * 간다. 없으면 기존 순서(skip 표시가 없는 첫 요소 → 첫 요소 → 컨테이너)로 떨어진다.
	 *
	 * 오버레이의 초기 포커스 규칙이 세 갈래("본문 첫 컨트롤 → 닫기 버튼 → 패널")라 표시
	 * 속성만으로는 표현되지 않는다. 닫기 버튼에 skip 을 붙여 본문을 우선하게 만들면, 본문이
	 * 없는 확인 모달에서는 그다음 후보가 **footer 의 첫 버튼**이 된다 - 그 자리가 destructive
	 * 액션인 패턴이 흔해서 열자마자 삭제에 포커스가 놓인다. 우선 영역을 직접 지정하면 그런
	 * 우회 없이 세 갈래가 그대로 표현된다.
	 */
	preferWithin?: React.RefObject<HTMLElement | null>;
	/**
	 * 초기 포커스를 **이 요소**에 둔다. `preferWithin` 보다 먼저 본다. 컨테이너 안에 붙어 있어야
	 * 하고, 아직 없거나 밖이면 기존 순서(`preferWithin` → skip 없는 첫 요소 → 첫 요소 → 컨테이너)
	 * 로 떨어진다. 기본 순서가 틀린 자리로 가는 화면 - 검색 모달의 검색 입력, 위험 확인 모달의
	 * "취소" - 에서 쓴다.
	 */
	initialFocus?: React.RefObject<HTMLElement | null>;
}

export function useFocusTrap(
	containerRef: React.RefObject<HTMLElement | null>,
	isActive: boolean,
	options?: FocusTrapOptions,
) {
	const previousActiveElement = React.useRef<HTMLElement | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: preferWithin·initialFocus 는 ref 라 정체가 바뀌지 않는다 - 의존성에 넣으면 소비자가 인라인으로 준 객체에 매번 트랩이 재설치된다
	React.useEffect(() => {
		if (!isActive) return;

		const container = containerRef.current;
		if (!container) return;

		// Store the previously focused element
		previousActiveElement.current = document.activeElement as HTMLElement;

		// Get all focusable elements
		const getFocusableElements = () => {
			return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
				isTabbable,
			);
		};

		// 컨테이너를 늘 포커스 가능하게 둔다 - 패널 안 비포커스 영역(제목 · 메시지)을 누르면 포커스가
		// body 로 가고, 컨테이너에 건 Tab 리스너가 그 키를 받지 못해 다이얼로그 밖으로 나갔다 (#982).
		// 소비자가 이미 tabindex 를 줬으면 그대로 둔다 - 덮어쓰고 "우리가 붙였다" 로 표시하면
		// cleanup 이 소비자 속성을 지운다.
		let wasTabIndexAdded = false;
		if (!container.hasAttribute("tabindex")) {
			container.setAttribute("tabindex", "-1");
			wasTabIndexAdded = true;
		}

		// Focus the first focusable element or the container itself.
		// 스크롤 wrapper 는 건너뛴다 - 안쪽에 실제 컨트롤이 있는데 빈 div 에 포커스가 놓이면
		// 사용자는 자기가 어디 있는지 알 수 없다. 건너뛸 대상뿐이면 그냥 그것을 쓴다.
		const focusableElements = getFocusableElements();
		// 우선 영역 안에서도 skip 표시가 붙은 요소는 건너뛴다 - 아래 폴백과 같은 규칙이어야
		// 중첩된 스크롤 wrapper 같은 것이 초기 포커스를 가로채지 않는다.
		const preferredRoot = options?.preferWithin?.current;
		const preferred = preferredRoot
			? (focusableElements.find(
					(el) => preferredRoot.contains(el) && !el.hasAttribute(SKIP_AUTOFOCUS_ATTR),
				) ?? null)
			: null;
		// 소비자가 자리를 지정했으면 그것이 이긴다 - 단, 이 컨테이너 안에 붙어 있고 지금 포커스
		// 가능할 때만. 밖의 요소로 보내면 트랩이 첫 Tab 에 그것을 못 잡고, disabled 요소는
		// focus() 가 조용히 무시돼 포커스가 트리거(컨테이너 밖)에 남는다 - 둘 다 열리는 순간부터
		// 트랩이 깨진다. 폴백 후보들과 같은 FOCUSABLE_SELECTORS 기준을 적용한다.
		const explicit = options?.initialFocus?.current;
		const explicitTarget =
			explicit &&
			container.contains(explicit) &&
			explicit.matches(FOCUSABLE_SELECTORS) &&
			isTabbable(explicit)
				? explicit
				: null;
		// skip 표시는 **영역**에도 건다 - Modal · Drawer 의 footer 는 초기 포커스 대상이 아니다. 본문 없는 확인
		// 모달에서 footer 첫 자리(흔히 destructive "삭제")로 가지 않고 패널로 간다 (#982). skip 표시가 붙은
		// 요소 자신(본문 스크롤 wrapper)은 그 다음 후보다.
		const initialTarget =
			explicitTarget ??
			preferred ??
			focusableElements.find((el) => !el.closest(`[${SKIP_AUTOFOCUS_ATTR}]`)) ??
			focusableElements.find((el) => el.hasAttribute(SKIP_AUTOFOCUS_ATTR)) ??
			container;
		initialTarget.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const focusableElements = getFocusableElements();
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];
			if (!firstElement || !lastElement) {
				e.preventDefault();
				return;
			}

			// 포커스가 패널 자신이거나(본문 클릭 뒤) 후보 밖에 있으면 양 끝에서처럼 감싼다 - 패널에서 Shift+Tab 은
			// DOM 순서상 패널 앞(트리거 쪽)으로 나갔다 (#982)
			const active = document.activeElement as HTMLElement | null;
			const outside = !active || active === container || !focusableElements.includes(active);
			if (e.shiftKey) {
				if (active === firstElement || outside) {
					e.preventDefault();
					lastElement.focus();
				}
			} else if (active === lastElement || (outside && active !== container)) {
				e.preventDefault();
				firstElement.focus();
			}
		};

		// **컨테이너**에 건다 - document 가 아니다. 오버레이 패널은 Escape 이외의 키를
		// `stopPropagation` 으로 막는데(소비자 단축키 격리), React 는 포탈 컨테이너(body)에서
		// 그 호출을 네이티브 이벤트에 그대로 전달하므로 document 리스너는 Tab 을 받지 못했다 -
		// 실측으로 Modal 마지막 탭 정지에서 Tab 을 치면 포커스가 딤 뒤의 트리거로 나갔다.
		// 컨테이너는 body 보다 안쪽이라 그 호출보다 먼저 받는다. 다른 오버레이의 Tab 을 건드리지
		// 않게 범위도 좁아진다.
		container.addEventListener("keydown", handleKeyDown);

		return () => {
			container.removeEventListener("keydown", handleKeyDown);

			// Remove tabindex if it was added by us
			if (wasTabIndexAdded) {
				container.removeAttribute("tabindex");
			}

			// 열기 전 자리로 돌려준다 - 단 그 자리가 사라졌거나 닫히는 오버레이 안이면 두지 않는다. 대화상자
			// 콜백에서 부모 Modal 을 닫으면(useConfirm) 부모가 먼저 트리거로 돌려준 포커스를 이 cleanup 이
			// 닫히는 Modal 안 버튼으로 다시 끌고 가 body 로 떨어졌다 (#982)
			const previous = previousActiveElement.current;
			if (previous?.isConnected && !previous.closest(CLOSING_OVERLAY)) previous.focus();
		};
	}, [isActive, containerRef]);
}
