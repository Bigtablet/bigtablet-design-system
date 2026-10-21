import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { BottomNav, BottomNavItem } from "../../navigation/bottom-nav";
import { NavBar } from "../../navigation/nav-bar";
import { AppShell } from "./index";
import "./style.scss";

const topInset = () => document.documentElement.style.getPropertyValue("--bt-top-inset");

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
		await expect.poll(topInset).toBe(`${header.offsetHeight}px`);
		expect(getComputedStyle(document.documentElement).scrollPaddingTop).toBe(
			`${header.offsetHeight}px`,
		);

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
		await expect.poll(topInset).toBe(`${header.offsetHeight}px`);
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
