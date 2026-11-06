import { afterEach, describe, expect, it, vi } from "vitest";
import { init, Sidebar } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

describe("Sidebar 접기 (#950)", () => {
	afterEach(() => localStorage.clear());

	const mount = (attrs = "") => {
		const el = document.createElement("div");
		el.innerHTML = `<aside class="bt-sidebar" ${attrs}><nav class="bt-sidebar__nav"><a class="bt-sidebar__item" href="/">대시보드</a></nav></aside>`;
		document.body.appendChild(el);
		return el.firstElementChild as HTMLElement;
	};
	const toggle = (root: HTMLElement) =>
		root.querySelector(".bt-sidebar__toggle") as HTMLButtonElement;

	it("data-bt-sidebar 로 자동 초기화되고 토글이 접고 편다", () => {
		const onCollapsedChange = vi.fn();
		const root = mount("data-bt-sidebar");
		init();
		expect(toggle(root).getAttribute("aria-label")).toBe("사이드바 토글");
		expect(toggle(root).getAttribute("aria-expanded")).toBe("true");
		Sidebar(root, { onCollapsedChange }); // 다시 만들면 앞 인스턴스를 풀고 교체한다
		expect(root.querySelectorAll(".bt-sidebar__toggle")).toHaveLength(1);
		toggle(root).click();
		expect(root.classList.contains("bt-sidebar--collapsed")).toBe(true);
		expect(toggle(root).getAttribute("aria-expanded")).toBe("false");
		expect(onCollapsedChange).toHaveBeenCalledWith(true);
	});

	it("처음 상태 · 너비 · collapsible=false 를 data-* 로 받는다", () => {
		const root = mount('data-collapsed data-width="280" data-collapsed-width="72"');
		const api = Sidebar(root);
		expect(api?.isCollapsed()).toBe(true);
		expect(root.style.getPropertyValue("--bt-sidebar-width")).toBe("280px");
		expect(root.style.getPropertyValue("--bt-sidebar-collapsed-width")).toBe("72px");
		const plain = mount('data-collapsible="false"');
		Sidebar(plain);
		expect(toggle(plain)).toBeNull();
	});

	it("storageKey 가 있으면 접힘을 기억한다", () => {
		const root = mount('data-storage-key="nav"');
		Sidebar(root)?.collapse();
		expect(localStorage.getItem("nav")).toBe("true");
		const again = mount('data-storage-key="nav"');
		expect(Sidebar(again)?.isCollapsed()).toBe(true);
	});

	it("destroy 가 토글과 인라인 너비를 걷고, 접힘 상태는 DOM 에 남겨 다시 만들 때 잇는다", () => {
		const root = mount('data-width="280"');
		const api = Sidebar(root);
		api?.collapse();
		api?.destroy();
		expect(toggle(root)).toBeNull();
		expect(root.style.getPropertyValue("--bt-sidebar-width")).toBe("");
		expect(Sidebar(root)?.isCollapsed()).toBe(true);
	});
});
