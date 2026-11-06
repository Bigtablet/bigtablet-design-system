import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "../../../vanilla/scss/_app-shell.scss";
import "../../../vanilla/scss/_sidebar.scss";

// Vanilla AppShell · Sidebar (#941) - 서버가 그린 마크업에 클래스만 붙인다
const shellHtml = (sidebarClass = "bt-sidebar") => `
<div class="bt-app-shell">
  <aside class="${sidebarClass}">
    <div class="bt-sidebar__brand">BT</div>
    <nav class="bt-sidebar__nav" aria-label="메뉴">
      <div class="bt-sidebar__section">
        <div class="bt-sidebar__section-label">관리</div>
        <a class="bt-sidebar__item" href="/" aria-current="page"><span class="bt-sidebar__item-icon"></span><span class="bt-sidebar__item-label">대시보드</span></a>
        <a class="bt-sidebar__item" href="/logs"><span class="bt-sidebar__item-icon"></span><span class="bt-sidebar__item-label">접속 기록</span></a>
      </div>
    </nav>
  </aside>
  <main class="bt-app-shell__main" id="main" tabindex="-1"><div style="width: 1800px">넓은 표</div></main>
</div>`;

const mount = (sidebarClass?: string) => {
	const { container } = render(<span />);
	container.insertAdjacentHTML("beforeend", shellHtml(sidebarClass));
	return {
		sidebar: container.querySelector("aside") as HTMLElement,
		main: container.querySelector("main") as HTMLElement,
		current: container.querySelector('[aria-current="page"]') as HTMLElement,
		other: container.querySelector('a[href="/logs"]') as HTMLElement,
	};
};

describe("Vanilla AppShell · Sidebar (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(1024, 768);
	});

	it("puts a 240px rail beside a main column that wide content cannot stretch", () => {
		const { sidebar, main } = mount();
		expect(sidebar.getBoundingClientRect().width).toBe(240);
		expect(main.getBoundingClientRect().left).toBe(240);
		// 1800px 자식이 있어도 열은 뷰포트 폭에 머문다 (minmax(0, 1fr))
		expect(main.getBoundingClientRect().right).toBeLessThanOrEqual(1024);
	});

	it("fills the current item from aria-current alone", () => {
		const { current, other } = mount();
		expect(getComputedStyle(current).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
		expect(getComputedStyle(other).backgroundColor).toBe("rgba(0, 0, 0, 0)");
	});

	it("turns into a bottom bar below 600px and lets main take the full width", async () => {
		await page.viewport(375, 667);
		const { sidebar, main, current } = mount();
		const bar = sidebar.getBoundingClientRect();
		expect(getComputedStyle(sidebar).position).toBe("fixed");
		// 넓은 표가 문서에 가로 스크롤바를 만들 수 있어 뷰포트 대신 clientHeight·clientWidth 와 비교한다
		expect(bar.bottom).toBe(document.documentElement.clientHeight);
		expect(bar.width).toBe(document.documentElement.clientWidth);
		expect(main.getBoundingClientRect().left).toBe(0);
		// 하단 바에서는 아이콘 자리만 채운다
		expect(getComputedStyle(current).backgroundColor).toBe("rgba(0, 0, 0, 0)");
	});

	it("keeps the rail on a narrow screen with --static", async () => {
		await page.viewport(375, 667);
		const { sidebar, main } = mount("bt-sidebar bt-sidebar--static");
		expect(getComputedStyle(sidebar).position).toBe("sticky");
		expect(main.getBoundingClientRect().left).toBe(240);
	});
});
