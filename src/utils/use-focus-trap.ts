"use client";

import * as React from "react";

// 초기 포커스에서만 건너뛸 요소 표시. 스크롤 컨테이너처럼 "탭 순환에는 있어야 하지만
// 열자마자 포커스가 놓일 자리는 아닌" wrapper 를 위한 것 (Modal 의 본문 영역).
const SKIP_AUTOFOCUS_ATTR = "data-focus-trap-skip-autofocus";

const FOCUSABLE_SELECTORS = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
	const previousActiveElement = React.useRef<HTMLElement | null>(null);

	React.useEffect(() => {
		if (!isActive) return;

		const container = containerRef.current;
		if (!container) return;

		// Store the previously focused element
		previousActiveElement.current = document.activeElement as HTMLElement;

		// Get all focusable elements
		const getFocusableElements = () => {
			return container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
		};

		let wasTabIndexAdded = false;

		// Focus the first focusable element or the container itself.
		// 스크롤 wrapper 는 건너뛴다 - 안쪽에 실제 컨트롤이 있는데 빈 div 에 포커스가 놓이면
		// 사용자는 자기가 어디 있는지 알 수 없다. 건너뛸 대상뿐이면 그냥 그것을 쓴다.
		const focusableElements = getFocusableElements();
		const initialTarget =
			Array.from(focusableElements).find((el) => !el.hasAttribute(SKIP_AUTOFOCUS_ATTR)) ??
			focusableElements[0];
		if (initialTarget) {
			initialTarget.focus();
		} else {
			container.setAttribute("tabindex", "-1");
			wasTabIndexAdded = true;
			container.focus();
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const focusableElements = getFocusableElements();
			if (focusableElements.length === 0) {
				e.preventDefault();
				return;
			}

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				}
			} else {
				// Tab
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
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

			// Restore focus to the previously focused element
			previousActiveElement.current?.focus();
		};
	}, [isActive, containerRef]);
}
