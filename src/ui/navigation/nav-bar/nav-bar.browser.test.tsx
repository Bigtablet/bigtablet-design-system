import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavBar, NavLink } from "./index";
import "./style.scss";

// 링크가 다 들어가지 않는 폭 - 링크를 한 글자 폭까지 누르지도("제 / 품"), 헤더가 넘쳐 페이지를
// 가로로 밀지도 않고 링크 영역만 스크롤된다 (#1014)
describe("NavBar narrow width (Chromium)", () => {
	it("scrolls the links instead of squeezing them or overflowing at 360px", () => {
		const { container, unmount } = render(
			<div style={{ width: 360 }}>
				<NavBar brand={<span>Bigtablet</span>} actions={<button type="button">로그인</button>}>
					<NavLink href="#" active>
						Home
					</NavLink>
					<NavLink href="#">제품</NavLink>
					<NavLink href="#">블로그</NavLink>
					<NavLink href="#">문의</NavLink>
				</NavBar>
			</div>,
		);
		const box = container.firstElementChild!;
		const links = container.querySelector(".nav_bar_links")!;
		const heights = [...container.querySelectorAll(".nav_bar_link")].map(
			(link) => link.getBoundingClientRect().height,
		);

		expect(box.scrollWidth).toBeLessThanOrEqual(360);
		expect(links.scrollWidth).toBeGreaterThan(links.clientWidth);
		// 한 줄 - 쪼개지면 글자 수만큼 높아진다
		expect(new Set(heights).size).toBe(1);
		unmount();
	});

	// 활성 링크가 잘린 자리(오른쪽 끝)에 있으면 처음부터 보이게 스크롤해 둔다
	it("scrolls the active link into view when it starts out clipped", () => {
		const { container, unmount } = render(
			<div style={{ width: 360 }}>
				<NavBar brand={<span>Bigtablet</span>} actions={<button type="button">로그인</button>}>
					<NavLink href="#">Home</NavLink>
					<NavLink href="#">제품</NavLink>
					<NavLink href="#">블로그</NavLink>
					<NavLink href="#" active>
						문의
					</NavLink>
				</NavBar>
			</div>,
		);
		const links = container.querySelector(".nav_bar_links")!;
		const box = links.getBoundingClientRect();
		const active = container.querySelector(".nav_bar_link_active")!.getBoundingClientRect();

		expect(links.scrollLeft).toBeGreaterThan(0);
		expect(active.right).toBeLessThanOrEqual(box.right + 1);
		unmount();
	});
});
