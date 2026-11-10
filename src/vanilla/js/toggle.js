import { $, on, parseBoolAttr } from "./utils.js";

/* ========================================
     Toggle Component
     ======================================== */

/**
 * Initialize Toggle component
 * @param {HTMLElement|string} element - Toggle element or selector
 * @param {Object} options - Configuration options
 */
export function Toggle(element, options = {}) {
	const toggleEl = typeof element === "string" ? $(element) : element;
	if (!toggleEl) return null;
	// 같은 요소에 두 번 만들면 앞 인스턴스를 풀고 교체한다 - 클릭 리스너가 둘이면 한 번 누를 때
	// 두 번 뒤집혀 상태·aria-checked·hidden 값이 갈라진다. 상태는 DOM(클래스·hidden 값)에서 다시 읽는다.
	toggleEl._btToggle?.destroy();

	const config = {
		defaultChecked: false,
		disabled: false,
		// React Toggle 과 동일한 체크 변경 콜백.
		onCheckedChange: null,
		...options,
	};
	// 제어 모드 (#920) - React 의 `checked` + `onCheckedChange` 와 같은 모델. 클릭은
	// onCheckedChange(next) 만 부르고 상태는 소비자가 setChecked() 로 정한다 - 권한 · 저장 ·
	// 확인 대화상자 뒤에 바뀌는 토글. 실패하면 setChecked 를 안 부르면 그대로 남는다.
	const controlled = config.controlled ?? parseBoolAttr(toggleEl.dataset.controlled) ?? false;
	// 제어 모드 콜백이 돌려준 Promise 가 끝나기 전 - 그동안 클릭은 무시한다(연타로 두 번 등록 방지)
	let pending = false;

	const state = {
		checked: config.defaultChecked || toggleEl.classList.contains("bt-toggle--on"),
	};

	// 초기 비활성 상태 흡수 - config.disabled 또는 native disabled 를 native `disabled` 로 통일
	// (React Toggle 과 동일하게 native disabled 사용 → 포커스 제외·:disabled 스타일 적용).
	if (toggleEl.disabled) config.disabled = true;
	toggleEl.disabled = config.disabled;

	// Switch 시맨틱 (React Toggle 과 패리티): role + aria-checked 를 항상 유지
	if (!toggleEl.hasAttribute("role")) toggleEl.setAttribute("role", "switch");
	// 폼 안에서 클릭이 submit 으로 새지 않도록 (button 기본 type=submit)
	if (toggleEl.tagName === "BUTTON" && !toggleEl.hasAttribute("type")) {
		toggleEl.setAttribute("type", "button");
	}

	// 폼 제출 참여: name(설정 또는 data-name)이 있으면 hidden input 으로 on/off 를 노출.
	// toggleEl 이 <button> 이면 그 안에 대화형 콘텐츠/폼 요소를 자식으로 둘 수 없어(invalid
	// HTML) hidden input 을 형제(sibling)로 삽입한다. 서버 템플릿이 미리 렌더링해둔 hidden
	// input(자식이든 형제든)이 있으면 재사용한다.
	const fieldName = config.name || toggleEl.dataset.name || null;
	// 직계 형제만 탐색 - parentNode.querySelector 는 하위 트리 전체를 뒤져 같은 부모를 공유하는
	// 다른 토글(예: 테이블 행 안 여러 토글)의 hidden input 을 잘못 집을 수 있다.
	let hiddenInput =
		toggleEl.querySelector('input[type="hidden"]') ||
		(fieldName && toggleEl.parentNode
			? Array.from(toggleEl.parentNode.children).find(
					(el) => el.tagName === "INPUT" && el.type === "hidden" && el.name === fieldName,
				)
			: null);
	if (!hiddenInput && fieldName) {
		hiddenInput = document.createElement("input");
		hiddenInput.type = "hidden";
		hiddenInput.name = fieldName;
		if (toggleEl.tagName === "BUTTON" && toggleEl.parentNode) {
			toggleEl.parentNode.insertBefore(hiddenInput, toggleEl.nextSibling);
		} else {
			toggleEl.appendChild(hiddenInput);
		}
	}

	function setChecked(checked) {
		state.checked = checked;
		toggleEl.classList.toggle("bt-toggle--on", checked);
		toggleEl.setAttribute("aria-checked", checked ? "true" : "false");

		if (hiddenInput) {
			hiddenInput.value = checked ? "true" : "false";
		}

		// 제어 모드에서는 부르지 않는다 - 소비자가 콜백 안에서 setChecked 로 확정하면 콜백이 다시
		// 돌아 등록이 두 번 된다. React 도 `checked` prop 이 바뀔 때는 onCheckedChange 를 안 부른다.
		if (!controlled && config.onCheckedChange) {
			config.onCheckedChange(checked);
		}
	}

	function toggle() {
		// React Toggle 과 동일하게 native `disabled` 만 본다 (구 --disabled 클래스는 v3.8.0 에서 제거).
		if (config.disabled || toggleEl.disabled || pending) return;
		if (!controlled) {
			setChecked(!state.checked);
			return;
		}
		const result = config.onCheckedChange?.(!state.checked);
		if (result && typeof result.then === "function") {
			pending = true;
			toggleEl.setAttribute("aria-busy", "true");
			const settle = () => {
				pending = false;
				toggleEl.removeAttribute("aria-busy");
			};
			// 실패해도 풀되 에러는 삼키지 않는다 - 처리 안 된 예외처럼 콘솔 · window "error" 로 보낸다
			result.then(settle, (error) => {
				settle();
				(globalThis.reportError ?? console.error)(error);
			});
		}
	}

	const cleanup = on(toggleEl, "click", toggle);

	// Initialize - aria-checked/hidden input 을 초기 상태와 동기화.
	// 서버 템플릿이 boolean 을 "true" 외 표현("1"/"on"/"y"/"yes")으로 렌더링해도
	// 켜짐으로 인식하도록 관대하게 파싱 (Thymeleaf/JSP 등 표현 차이 흡수).
	if (hiddenInput && !state.checked) {
		const raw = String(hiddenInput.value).trim().toLowerCase();
		if (raw === "true" || raw === "1" || raw === "on" || raw === "y" || raw === "yes") {
			state.checked = true;
		}
	}
	toggleEl.classList.toggle("bt-toggle--on", state.checked);
	toggleEl.setAttribute("aria-checked", state.checked ? "true" : "false");
	if (hiddenInput) hiddenInput.value = state.checked ? "true" : "false";
	// 비활성 토글은 제출하지 않는다 - native disabled 컨트롤과 같다 (Dropdown 과 같은 처리, #981)
	if (hiddenInput) hiddenInput.disabled = config.disabled;

	const api = {
		isChecked: () => state.checked,
		setChecked,
		toggle,
		setDisabled: (disabled) => {
			config.disabled = disabled;
			toggleEl.disabled = disabled;
			if (hiddenInput) hiddenInput.disabled = disabled;
		},
		destroy: () => {
			cleanup();
			if (toggleEl._btToggle === api) delete toggleEl._btToggle;
		},
	};
	toggleEl._btToggle = api;
	return api;
}
