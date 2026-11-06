import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { BottomNav, BottomNavItem } from "../../navigation/bottom-nav";
import { NavBar } from "../../navigation/nav-bar";
import "../../../vanilla/scss/_utilities.scss";
import { AppShell } from "./index";
import "./style.scss";

const topInset = () => document.documentElement.style.getPropertyValue("--bt-top-inset");
const insetOf = (el: HTMLElement) => `${Math.ceil(el.getBoundingClientRect().height)}px`;

// 헤더 밑에 걸치도록 스크롤한 뒤 Tab 으로 포커스한다 - 가려지지 않았다면 헤더 아래로 스크롤돼 있어야 한다.
const tabIntoTargetUnderHeader = async (header: HTMLElement) => {
	const target = screen.getByRole("button", { name: "대상" });
	window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 10);
	expect(target.getBoundingClientRect().top).toBeLessThan(header.getBoundingClientRect().bottom);
	await userEvent.click(screen.getByRole("button", { name: "앞" }));
	window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 10);
	await userEvent.keyboard("{Tab}");
	expect(target).toHaveFocus();
	return target.getBoundingClientRect().top;
};

const Body = () => (
	<div style={{ height: 3000 }}>
		<button type="button" style={{ marginTop: 800 }}>
			앞
		</button>
		<button type="button">대상</button>
	</div>
);

describe("AppShell sticky header does not obscure focus (WCAG 2.4.11, Chromium)", () => {
	it("scrolls a focused element below the header", async () => {
		const { unmount } = render(
			<AppShell header={<NavBar brand="BT" layout="fluid" />}>
				<Body />
			</AppShell>,
		);
		const header = document.querySelector(".app_shell_header") as HTMLElement;
		await expect.poll(topInset).toBe(insetOf(header));
		expect(getComputedStyle(document.documentElement).scrollPaddingTop).toBe(insetOf(header));

		const top = await tabIntoTargetUnderHeader(header);
		expect(top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom);

		// 헤더가 사라지면 값도 지운다 - 다른 화면에 빈 여백이 남지 않게.
		unmount();
		expect(topInset()).toBe("");
	});

	it("lets a standalone sticky NavBar report its own height", async () => {
		const { unmount } = render(
			<>
				<NavBar brand="BT" sticky />
				<Body />
			</>,
		);
		const header = document.querySelector(".nav_bar") as HTMLElement;
		await expect.poll(topInset).toBe(insetOf(header));
		unmount();
		expect(topInset()).toBe("");
	});

	it("leaves the inset to AppShell when a sticky NavBar is its header", async () => {
		const { rerender } = render(
			<AppShell header={<NavBar brand="BT" sticky />}>
				<Body />
			</AppShell>,
		);
		await expect.poll(topInset).not.toBe("");
		// NavBar 가 sticky 를 끄며 자기 값을 지워도 AppShell 몫은 남아야 한다 - NavBar 는 처음부터 쓰지 않는다.
		rerender(
			<AppShell header={<NavBar brand="BT" />}>
				<Body />
			</AppShell>,
		);
		expect(topInset()).not.toBe("");
	});

	it("pads the bottom of the viewport scroller while a BottomNav is shown", () => {
		const { unmount } = render(
			<BottomNav aria-label="하단">
				<BottomNavItem icon={<span />} label="홈" active />
				<BottomNavItem icon={<span />} label="메뉴" />
			</BottomNav>,
		);
		const nav = document.querySelector(".bottom_nav") as HTMLElement;
		expect(getComputedStyle(document.documentElement).scrollPaddingBottom).toBe(
			`${nav.offsetHeight}px`,
		);
		unmount();
		expect(getComputedStyle(document.documentElement).scrollPaddingBottom).toBe("auto");
	});
});

// 첫 Tab 에 "본문으로 건너뛰기" 가 왼쪽 위에 뜨고, Enter 로 본문에 들어가 다음 Tab 이 본문 첫 컨트롤이 된다 (#940)
describe("AppShell skip link (Chromium)", () => {
	const shell = () => (
		<AppShell header={<NavBar brand="BT" layout="fluid" />}>
			<button type="button">본문 첫 버튼</button>
		</AppShell>
	);

	it("appears top-left on the first Tab without taking a grid cell", async () => {
		render(shell());
		const header = document.querySelector(".app_shell_header") as HTMLElement;
		const headerTop = header.getBoundingClientRect().top;
		const link = screen.getByRole("link", { name: "본문으로 건너뛰기" });
		expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);

		await userEvent.keyboard("{Tab}");
		expect(link).toHaveFocus();
		const rect = link.getBoundingClientRect();
		expect(rect.top).toBe(8);
		expect(rect.left).toBe(8);
		expect(rect.width).toBeGreaterThan(40);
		expect(getComputedStyle(link).boxShadow).toMatch(/0px 0px 0px 4px/);
		// 레이아웃은 그대로 - 헤더가 밀리지 않는다
		expect(header.getBoundingClientRect().top).toBe(headerTop);
	});

	it("moves focus into main on Enter so the next Tab lands on the first control", async () => {
		render(shell());
		await userEvent.keyboard("{Tab}");
		await userEvent.keyboard("{Enter}");
		const main = screen.getByRole("main");
		await expect.poll(() => document.activeElement).toBe(main);
		expect(getComputedStyle(main).outlineStyle).toBe("none");
		expect(getComputedStyle(main).boxShadow).toBe("none");
		await userEvent.keyboard("{Tab}");
		expect(screen.getByRole("button", { name: "본문 첫 버튼" })).toHaveFocus();
	});

	it("draws no skip link without a sidebar or header", () => {
		render(<AppShell>본문</AppShell>);
		expect(screen.queryByRole("link")).toBeNull();
	});
});

// Vanilla - DS 밖 요소의 기본 포커스 링과 .bt-skip-link (#940)
describe("Vanilla focus defaults (Chromium)", () => {
	const mount = (html: string) => {
		const { container } = render(<span />);
		container.insertAdjacentHTML("beforeend", html);
		return container;
	};

	// roving tabindex 항목은 -1 이어도 방향키 포커스가 보여야 한다 (WCAG 2.4.7)
	it("rings a roving tabindex=-1 item focused from the keyboard", async () => {
		const root = mount(
			'<button type="button">앞</button><div role="menu"><div role="menuitem" tabindex="0">하나</div><div role="menuitem" tabindex="-1">둘</div></div>',
		);
		const first = root.querySelector('[tabindex="0"]') as HTMLElement;
		const second = root.querySelector('[role="menuitem"][tabindex="-1"]') as HTMLElement;
		first.addEventListener("keydown", (e) => {
			if (e.key === "ArrowDown") second.focus();
		});
		(root.querySelector("button") as HTMLElement).focus();
		await userEvent.keyboard("{Tab}");
		expect(first).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}");
		expect(second).toHaveFocus();
		expect(getComputedStyle(second).boxShadow).toMatch(/0px 0px 0px 4px/);
	});

	it("rings an app-drawn link on keyboard focus but not the skip target main", async () => {
		const root = mount(
			'<a class="bt-skip-link" href="#main">본문으로 건너뛰기</a><a href="/logs">접속 기록</a><main id="main" tabindex="-1">본문</main>',
		);
		const skip = root.querySelector(".bt-skip-link") as HTMLElement;
		const link = root.querySelector('a[href="/logs"]') as HTMLElement;
		const main = root.querySelector("main") as HTMLElement;

		await userEvent.keyboard("{Tab}");
		expect(skip).toHaveFocus();
		expect(skip.getBoundingClientRect()).toMatchObject({ top: 8, left: 8 });

		await userEvent.keyboard("{Tab}");
		expect(link).toHaveFocus();
		expect(getComputedStyle(link).boxShadow).toMatch(/0px 0px 0px 4px/);

		await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
		await userEvent.keyboard("{Enter}");
		await expect.poll(() => document.activeElement).toBe(main);
		expect(getComputedStyle(main).outlineStyle).toBe("none");
		expect(getComputedStyle(main).boxShadow).toBe("none");
	});

	it("lets a component rule win over the default ring", async () => {
		const root = mount('<a class="custom" href="#x" style="box-shadow: none">링크</a>');
		const link = root.querySelector("a") as HTMLElement;
		await userEvent.keyboard("{Tab}");
		expect(link).toHaveFocus();
		expect(getComputedStyle(link).boxShadow).toBe("none");
	});
});
