import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "../container";
import { Section } from ".";

const meta: Meta<typeof Section> = {
	title: "Components/Layout/Section",
	component: Section,
	tags: ["autodocs"],
	argTypes: {
		spacing: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"],
			description: "Vertical padding scale - md/lg/xl are viewport-responsive. / 수직 패딩 크기 - md/lg/xl은 뷰포트에 따라 반응형.",
		},
		bg: {
			control: "select",
			options: ["default", "dim", "accent", "navy", "transparent"],
			description: "Background - default/dim/accent/navy(dark)/transparent. / 배경 - default/dim/accent/navy(다크)/transparent.",
		},
		as: {
			control: "text",
			description: "HTML element to render (default section). / 렌더링할 HTML 요소 (기본 section).",
		},
		children: {
			control: false,
			description: "Content inside Section (usually Container). / Section 내부 콘텐츠 (보통 Container).",
		},
	},
	args: {
		spacing: "md",
		bg: "default",
	},
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: [
					"**Section** - Marketing section unit. Vertical spacing + background, with `Container` recommended inside. / 마케팅 섹션 단위. 수직 여백 + 배경. 내부에 `Container` 권장.",
					"",
					"Spacing: `xs`/`sm`/`md` (default)/`lg`/`xl` - md+ is viewport-responsive. / Spacing: `xs`/`sm`/`md` (기본)/`lg`/`xl` - md+ 는 뷰포트별 반응형.",
					"Bg: `default` / `dim` (Zebra) / `accent` (light navy) / `navy` (dark, auto white text) / `transparent`. / Bg: `default` / `dim` (Zebra) / `accent` (옅은 navy) / `navy` (다크 자동 흰 텍스트) / `transparent`.",
				].join("\n"),
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
