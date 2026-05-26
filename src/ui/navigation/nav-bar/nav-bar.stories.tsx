import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../general/button";
import { NavBar, NavLink } from ".";

const meta: Meta<typeof NavBar> = {
	title: "Components/Navigation/NavBar",
	component: NavBar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**NavBar** — 페이지 상단 네비게이션. \`brand\` / \`children (NavLink)\` / \`actions\` 슬롯.

Variants: \`default\` (흰 bg + border), \`accent\` (navy bg), \`transparent\` (hero 위).
\`active={true}\` → \`aria-current="page"\` 자동.
				`,
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
	render: () => (
		<div
			style={{
				minHeight: 200,
				background: "linear-gradient(180deg, #7AA5D2, #47555E)",
				color: "#fff",
			}}
		>
			<NavBar variant="transparent" brand={<Brand invert />} actions={<Button size="sm">시작</Button>}>
				<NavLink href="#" active>
					소개
				</NavLink>
				<NavLink href="#">기능</NavLink>
				<NavLink href="#">요금제</NavLink>
			</NavBar>
		</div>
	),
};

export const Interactive: Story = {
	parameters: {
		docs: {
			description: {
				story: "클릭 시 active underline 부드럽게 이동.",
			},
		},
	},
	render: () => {
		const [active, setActive] = useState("home");
		const links = [
			{ id: "home", label: "Home" },
			{ id: "product", label: "제품" },
			{ id: "blog", label: "블로그" },
			{ id: "pricing", label: "요금제" },
		];
		return (
			<NavBar brand={<Brand />} actions={<Button size="sm">로그인</Button>}>
				{links.map((link) => (
					<NavLink
						key={link.id}
						href={`#${link.id}`}
						active={active === link.id}
						onClick={(e) => {
							e.preventDefault();
							setActive(link.id);
						}}
					>
						{link.label}
					</NavLink>
				))}
			</NavBar>
		);
	},
};
