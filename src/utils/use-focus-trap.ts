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

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);

			// Remove tabindex if it was added by us
			if (wasTabIndexAdded) {
				container.removeAttribute("tabindex");
			}

			// Restore focus to the previously focused element
			previousActiveElement.current?.focus();
		};
	}, [isActive, containerRef]);
}
