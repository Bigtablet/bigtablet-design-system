import type { Meta, StoryObj } from "@storybook/react";
import { Container } from ".";

const meta: Meta<typeof Container> = {
	title: "Components/Layout/Container",
	component: Container,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg", "xl", "full"],
			description: "max-width — sm:640 / md:768 / lg:1024 / xl:1200 / full:100%",
		},
		center: {
			control: "boolean",
			description: "가운데 정렬 (margin: 0 auto).",
		},
		as: {
			control: "text",
			description: "렌더링할 HTML 요소 (기본 div).",
		},
		children: {
			control: false,
			description: "Container 내부 콘텐츠.",
		},
	},
	args: {
		size: "xl",
		center: true,
	},
	parameters: {
		docs: {
			description: {
				component: [
					"**Container** — max-width 제한 + 반응형 좌우 패딩. 페이지 wrapper.",
					"",
					"Sizes: `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1200 (기본) / `full`.",
					"패딩 자동: <600 16, ≥600 24, ≥840 32, ≥1200 40.",
				].join("\n"),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Container>;

const Box = ({ label, bg = "#E5F0FF" }: { label: string; bg?: string }) => (
	<div
		style={{
			background: bg,
			padding: "24px",
			borderRadius: "8px",
			fontSize: "14px",
			fontWeight: 600,
			color: "var(--bt-color-text-heading)",
			textAlign: "center",
		}}
	>
		{label}
	</div>
);

export const Default: Story = {
	name: "XL (기본 · 1200px)",
	render: () => (
		<Container>
			<Box label="Container size=xl (max 1200px)" />
		</Container>
	),
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			{(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
				<Container key={size} size={size}>
					<Box label={`size="${size}"`} />
				</Container>
			))}
		</div>
	),
};

export const WithSection: Story = {
	name: "Section 내부 사용",
	render: () => (
		<div style={{ background: "var(--bt-color-bg-solid-dim)", padding: "48px 0" }}>
			<Container size="lg">
				<Box label="Container inside Section" bg="#fff" />
			</Container>
		</div>
	),
};
