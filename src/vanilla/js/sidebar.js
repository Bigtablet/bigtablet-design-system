import { t } from "./locale.js";
import { $, on, parseBoolAttr } from "./utils.js";

/* ========================================
     Sidebar - 접기 · 펼치기 (React Sidebar collapsible 대응, #950)
     ======================================== */

/**
 * `.bt-sidebar` 에 접기 토글을 단다. 마크업 · 모양은 CSS(#941)가 맡고, 이 함수는 상태와 버튼만 다룬다.
 * 접으면 64px 레일 - 아이콘만 남고 라벨 · 구역 제목은 스크린리더에만 남는다.
 *
 * @param {HTMLElement|string} element - `.bt-sidebar` 요소 또는 셀렉터
 * @param {Object} options - React Sidebar 와 같은 이름 (data-* 는 kebab-case)
 */
export function Sidebar(element, options = {}) {
	const root = typeof element === "string" ? $(element) : element;
	if (!root) return null;
	root._btSidebar?.destroy();

	const ds = root.dataset;
	const pick = (key, attr, convert = (v) => v) =>
		options[key] !== undefined ? options[key] : attr !== undefined ? convert(attr) : undefined;
	const config = {
		// React 와 같이 기본 true - 토글 버튼을 단다
		collapsible: pick("collapsible", ds.collapsible, parseBoolAttr) ?? true,
		defaultCollapsed:
			pick("defaultCollapsed", ds.collapsed, parseBoolAttr) ??
			root.classList.contains("bt-sidebar--collapsed"),
		// parseFloat - `data-width="280px"` 처럼 단위를 붙여도 받는다 (Number 면 NaN 으로 무시됐다, #976)
		width: pick("width", ds.width, Number.parseFloat),
		collapsedWidth: pick("collapsedWidth", ds.collapsedWidth, Number.parseFloat),
		toggleLabel: pick("toggleLabel", ds.toggleLabel) ?? t("sidebar.toggle"),
		// 접힘 상태를 localStorage 에 기억한다 (Vanilla 전용 - 서버 렌더 화면은 쪽을 옮길 때마다 새로 그린다)
		storageKey: pick("storageKey", ds.storageKey),
		onCollapsedChange: options.onCollapsedChange ?? null,
	};
	if (config.width) root.style.setProperty("--bt-sidebar-width", `${config.width}px`);
	if (config.collapsedWidth) {
		root.style.setProperty("--bt-sidebar-collapsed-width", `${config.collapsedWidth}px`);
	}

	const read = () => {
		try {
			const v = config.storageKey && localStorage.getItem(config.storageKey);
			return v === "true" ? true : v === "false" ? false : null;
		} catch {
			return null; // 사생활 보호 모드 등 - 기억하지 못해도 동작은 그대로
		}
	};
	const write = (collapsed) => {
		try {
			if (config.storageKey) localStorage.setItem(config.storageKey, String(collapsed));
		} catch {}
	};

	let collapsed = read() ?? config.defaultCollapsed;
	let toggle = null;
	const cleanups = [];
	if (config.collapsible) {
		toggle = document.createElement("button");
		toggle.type = "button";
		toggle.className = "bt-sidebar__toggle";
		toggle.setAttribute("aria-label", config.toggleLabel);
		root.appendChild(toggle);
		cleanups.push(on(toggle, "click", () => setCollapsed(!collapsed)));
	}

	function apply() {
		root.classList.toggle("bt-sidebar--collapsed", collapsed);
		toggle?.setAttribute("aria-expanded", String(!collapsed));
	}

	function setCollapsed(next) {
		if (next === collapsed) return;
		collapsed = next;
		apply();
		write(collapsed);
		config.onCollapsedChange?.(collapsed);
	}

	// 처음 그릴 때는 너비 전환을 끈다 - 저장된 접힘 상태를 쪽마다 240 → 64px 로 줄이며 보여 주지 않게 (#976)
	root.style.transition = "none";
	apply();
	void root.offsetWidth; // 전환 없이 적용된 너비를 확정한 뒤 되돌린다
	root.style.transition = "";

	const api = {
		isCollapsed: () => collapsed,
		collapse: () => setCollapsed(true),
		expand: () => setCollapsed(false),
		toggle: () => setCollapsed(!collapsed),
		destroy: () => {
			cleanups.forEach((cleanup) => {
				cleanup();
			});
			toggle?.remove();
			// 이 함수가 넣은 인라인 너비만 걷는다. 접힘 클래스는 남긴다 - Toggle 처럼 상태는 DOM 에 있어
			// 다시 만들면(Sidebar(el)) 그 상태를 이어받는다. 펼치려면 destroy 전에 expand()
			if (config.width) root.style.removeProperty("--bt-sidebar-width");
			if (config.collapsedWidth) root.style.removeProperty("--bt-sidebar-collapsed-width");
			if (root._btSidebar === api) delete root._btSidebar;
		},
	};
	root._btSidebar = api;
	return api;
}
