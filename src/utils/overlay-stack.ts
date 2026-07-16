"use client";

import * as React from "react";

/**
 * 공유 오버레이 Escape 스택 (WAI-ARIA APG "최상단 오버레이만 닫힘").
 *
 * Tooltip / Popover / Modal / Drawer / Alert 가 각자 다른 방식(document capture 리스너,
 * wrapper onKeyDown, overlay div React onKeyDown)으로 Escape 를 처리하면 동시에 열렸을 때
 * "가장 위 오버레이만 닫힘"이 일관되게 보장되지 않는다. 이 모듈은 모든 오버레이가 공유하는
 * 단일 keydown 리스너로 그 규칙을 일원화한다.
 *
 * ## 설계 결정: bubble 단계 + 단일 document 리스너
 *
 * 리스너는 **bubble** 단계(`capture: false`)로 등록한다. 이유:
 *
 * 1. **자식 우선 처리(critical)** — 이벤트는 target(오버레이 내부 input/select 등)에서 위로
 *    올라오며(target → bubble), 자식이 먼저 처리할 기회를 갖는다. 자식이 자체 Escape(예: IME
 *    조합 취소, native `<select>` 드롭다운 닫기)를 처리하고 `stopPropagation` 하면 이벤트는
 *    document 까지 오지 않아 이 리스너가 아예 실행되지 않는다 → 오버레이가 닫히지 않는다.
 *    capture 단계로 등록하면 자식보다 먼저 가로채 자식의 Escape 를 마비시키는 회귀(이전 리뷰
 *    critical 지적)가 재발하므로 반드시 bubble 이어야 한다.
 * 2. **오버레이 간 최상단만 닫힘** — 모든 오버레이가 이 단일 리스너 하나를 공유하므로, document
 *    까지 도달한 Escape 는 스택 최상단(가장 최근에 등록/열린 오버레이)의 onEscape 만 호출한다.
 *    즉 "우리 오버레이들 사이"에서는 최상단 하나만 반응하는 것이 순서와 무관하게 보장된다.
 * 3. **오버레이가 없으면 리스너도 없음** — 스택이 비면 리스너를 완전히 제거해, 오버레이가 하나도
 *    열려있지 않을 때 소비자 앱의 전역 Escape 핸들러를 삼키지 않는다.
 *
 * ### `stopImmediatePropagation` 의 실제 보장 범위 (주의)
 *
 * Escape 처리 후 `stopImmediatePropagation()` 을 호출하지만, 이는 같은 document 노드에 **나중에**
 * 등록된 리스너와 window 로의 전파만 막는다. 오버레이가 열리기 **전에** 소비자 앱이 이미 document
 * 에 Escape 리스너를 걸어 두었다면(우리 리스너보다 앞 순서) 그 리스너는 여전히 실행된다. 따라서
 * 이 모듈은 "우리 오버레이들 사이의 최상단만 닫힘"을 보장할 뿐, 소비자 앱의 선등록 Escape 핸들러
 * 까지 완전히 차단한다고 보장하지는 않는다.
 *
 * ### LIFO 한계 (동시-open 마운트)
 *
 * 스택은 등록 순서 LIFO 다. 실제 앱에서 오버레이는 순차적으로 열리므로(예: Modal 을 연 뒤 그 안의
 * Popover 를 클릭으로 열기) 등록 순서 = 열린 순서 = 시각적 stacking 순서가 되어 최상단이 정확히
 * 결정된다. 단, React 는 effect 를 **자식 → 부모** 순서로 커밋하므로, 부모/자식 오버레이가 **동시에
 * 마운트되며 둘 다 이미 open**(예: `<Modal><Popover defaultOpen /></Modal>`, 중첩 Drawer 동시 open)
 * 인 경우 자식이 먼저·부모가 나중에 등록되어 부모가 최상단이 된다 → 첫 Escape 가 자식(위에 있어야
 * 할 오버레이) 대신 부모를 닫는다. 흔치 않은 degenerate 케이스이며, z-order 기반 topmost 판정으로
 * 개선 가능하나(별도) 순차 open 조합에는 영향 없다.
 */

type EscapeHandler = () => void;

/** 모듈 스코프 스택. 마지막 원소 = 최상단(가장 최근에 등록된) 오버레이. */
const stack: EscapeHandler[] = [];

const handleKeyDown = (e: KeyboardEvent) => {
	if (e.key !== "Escape") return;
	const top = stack[stack.length - 1];
	if (!top) return;
	// 여기까지 왔다는 건 자식(input/select/IME 등)이 이벤트를 소비하지 않았다는 뜻.
	// 최상단만 닫고, document 에 나중 등록된 리스너 + window 로의 전파를 끊는다.
	// (선등록된 소비자 리스너는 못 막음 - 파일 상단 주석 참고.)
	e.stopImmediatePropagation();
	top();
};

/**
 * 오버레이를 Escape 스택 최상단에 등록한다.
 *
 * @param onEscape 이 오버레이가 최상단일 때 Escape 로 호출될 콜백 (보통 close)
 * @returns 등록 해제 함수. 스택에서 제거하고, 마지막 항목이면 document 리스너까지 정리한다.
 */
export function registerOverlay(onEscape: EscapeHandler): () => void {
	// SSR 가드 - 서버에는 document 가 없다. no-op unregister 반환.
	if (typeof document === "undefined") {
		return () => {};
	}

	// 스택이 비어 있다가 첫 항목이 들어올 때만 리스너를 붙인다 (단 하나의 리스너 유지).
	if (stack.length === 0) {
		document.addEventListener("keydown", handleKeyDown);
	}
	stack.push(onEscape);

	let done = false;
	return () => {
		if (done) return;
		done = true;
		const index = stack.lastIndexOf(onEscape);
		if (index !== -1) stack.splice(index, 1);
		// 마지막 항목이 빠지면 리스너를 제거해 스택이 빈 동안 전역 Escape 를 삼키지 않게 한다.
		if (stack.length === 0) {
			document.removeEventListener("keydown", handleKeyDown);
		}
	};
}

/**
 * 오버레이 컴포넌트가 Escape 스택에 참여하도록 하는 훅.
 *
 * `active` 가 true 인 동안 스택에 등록되고, false 가 되거나 unmount 되면 등록 해제된다.
 * 최상단일 때만 Escape 에 반응하므로 각 오버레이는 `useOverlayEscape(open, close)` 만 쓰면 된다.
 *
 * @param active 오버레이 열림 여부
 * @param onEscape Escape 시 호출할 콜백 (매 렌더 새 참조여도 재등록되지 않도록 ref 로 잡는다)
 */
export function useOverlayEscape(active: boolean, onEscape: EscapeHandler): void {
	// 최신 onEscape 를 ref 로 유지 - register/unregister 를 active 변화에만 묶어
	// (콜백이 매 렌더 바뀌어도) 불필요한 재등록/스택 순서 교란을 막는다.
	// ref 갱신은 effect 안에서 - 렌더 단계에서 ref.current 를 수정하면 concurrent 렌더링에서
	// 문제가 될 수 있다. Escape 콜백은 항상 커밋(=이 effect) 이후 이벤트 시점에 호출되므로
	// effect 로 갱신해도 최신 값이 보장된다.
	const handlerRef = React.useRef(onEscape);
	React.useEffect(() => {
		handlerRef.current = onEscape;
	});

	React.useEffect(() => {
		if (!active) return;
		return registerOverlay(() => handlerRef.current());
	}, [active]);
}
