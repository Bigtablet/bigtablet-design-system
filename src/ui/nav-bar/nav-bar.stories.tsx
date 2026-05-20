import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { NavBar, NavLink } from ".";

const meta: Meta<typeof NavBar> = {
	title: "Components/NavBar",
	component: NavBar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"**NavBar**는 페이지 상단 네비게이션. B2C 마케팅 페이지의 main header. `default` / `transparent` / `accent` 3가지 variant.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof NavBar>;

function Brand({ invert = false }: { invert?: boolean }) {
	return (
		<img
			src="/images/logo/bigtablet.png"
			alt="Bigtablet"
			height={28}
			style={{ display: "block", filter: invert ? "brightness(0) invert(1)" : undefined }}
		/>
	);
}

export const Default: Story = {
	name: "Default (흰 bg + border)",
	render: () => (
		<NavBar brand={<Brand />} actions={<Button size="sm">로그인</Button>}>
			<NavLink href="#" active>
				Home
			</NavLink>
			<NavLink href="#">제품</NavLink>
			<NavLink href="#">블로그</NavLink>
			<NavLink href="#">문의</NavLink>
		</NavBar>
	),
};

export const Accent: Story = {
	name: "Accent (navy bg)",
	render: () => (
		<NavBar
			variant="accent"
			brand={<Brand invert />}
			actions={
				<Button variant="outline" size="sm">
					로그인
				</Button>
			}
		>
			<NavLink href="#" active>
				Home
			</NavLink>
			<NavLink href="#">제품</NavLink>
			<NavLink href="#">블로그</NavLink>
		</NavBar>
	),
};

export const Transparent: Story = {
	name: "Transparent (hero 위)",
	render: () => (
		<div
			style={{
				minHeight: 200,
				background: "linear-gradient(180deg, #7AA5D2, #47555E)",
				color: "#fff",
			}}
		>
			<NavBar variant="transparent" brand={<Brand invert />} actions={<Button size="sm">시작</Button>}>
				<NavLink href="#">소개</NavLink>
				<NavLink href="#">기능</NavLink>
			</NavBar>
			<div style={{ padding: 32 }}>
				<h1>Hero 영역</h1>
			</div>
		</div>
	),
};
