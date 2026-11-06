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
		width: pick("width", ds.width, Number),
		collapsedWidth: pick("collapsedWidth", ds.collapsedWidth, Number),
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

	apply();

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
			if (root._btSidebar === api) delete root._btSidebar;
		},
	};
	root._btSidebar = api;
	return api;
}
