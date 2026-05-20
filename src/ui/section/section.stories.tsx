import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "../container";
import { Section } from ".";

const meta: Meta<typeof Section> = {
	title: "Layout/Section",
	component: Section,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"**Section** — 마케팅 페이지용 섹션 단위. 수직 여백(`spacing`)과 배경색(`bg`) 조합으로 페이지 리듬 생성.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Section>;

const Content = ({ label }: { label: string }) => (
	<div style={{ textAlign: "center", padding: "0 16px" }}>
		<h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>{label}</h2>
		<p style={{ margin: 0, color: "inherit", opacity: 0.7 }}>
			섹션 컨텐츠 영역 · Container와 함께 사용하세요.
		</p>
	</div>
);

export const Default: Story = {
	name: "배경색 비교",
	render: () => (
		<div>
			<Section bg="default" spacing="sm">
				<Container>
					<Content label='bg="default"' />
				</Container>
			</Section>
			<Section bg="dim" spacing="sm">
				<Container>
					<Content label='bg="dim"' />
				</Container>
			</Section>
			<Section bg="accent" spacing="sm">
				<Container>
					<Content label='bg="accent" (navy subtle)' />
				</Container>
			</Section>
			<Section bg="navy" spacing="sm">
				<Container>
					<Content label='bg="navy" (dark)' />
				</Container>
			</Section>
		</div>
	),
};

export const SpacingScale: Story = {
	name: "간격 비교",
	render: () => (
		<div>
			{(["xs", "sm", "md", "lg", "xl"] as const).map((spacing, i) => (
				<Section key={spacing} spacing={spacing} bg={i % 2 === 0 ? "default" : "dim"}>
					<Container>
						<div style={{ textAlign: "center" }}>
							<code>spacing="{spacing}"</code>
						</div>
					</Container>
				</Section>
			))}
		</div>
	),
};
