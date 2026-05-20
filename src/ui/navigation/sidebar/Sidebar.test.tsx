import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar, SidebarItem, SidebarSection } from "./index";

describe("Sidebar", () => {
	it("renders header, items, and footer", () => {
		render(
			<Sidebar header={<div>Logo</div>} footer={<div>Profile</div>}>
				<SidebarItem>홈</SidebarItem>
				<SidebarItem>사용자</SidebarItem>
			</Sidebar>,
		);
		expect(screen.getByText("Logo")).toBeInTheDocument();
		expect(screen.getByText("Profile")).toBeInTheDocument();
		expect(screen.getByText("홈")).toBeInTheDocument();
		expect(screen.getByText("사용자")).toBeInTheDocument();
	});

	it("applies active aria-current=page", () => {
		render(
			<Sidebar>
				<SidebarItem active>현재</SidebarItem>
			</Sidebar>,
		);
		expect(screen.getByRole("button", { name: "현재" })).toHaveAttribute("aria-current", "page");
	});

	it("calls onClick when item clicked", () => {
		const onClick = vi.fn();
		render(
			<Sidebar>
				<SidebarItem onClick={onClick}>홈</SidebarItem>
			</Sidebar>,
		);
		fireEvent.click(screen.getByRole("button", { name: "홈" }));
		expect(onClick).toHaveBeenCalled();
	});

	it("renders as anchor when as='a' and href provided", () => {
		render(
			<Sidebar>
				<SidebarItem as="a" href="/dashboard">
					대시보드
				</SidebarItem>
			</Sidebar>,
		);
		const link = screen.getByText("대시보드").closest("a");
		expect(link).toHaveAttribute("href", "/dashboard");
	});

	it("renders section label", () => {
		render(
			<Sidebar>
				<SidebarSection label="Main">
					<SidebarItem>홈</SidebarItem>
				</SidebarSection>
			</Sidebar>,
		);
		expect(screen.getByText("Main")).toBeInTheDocument();
	});

	it("applies collapsed class", () => {
		const { container } = render(
			<Sidebar collapsed>
				<SidebarItem>홈</SidebarItem>
			</Sidebar>,
		);
		expect(container.firstChild).toHaveClass("sidebar_collapsed");
	});
});
