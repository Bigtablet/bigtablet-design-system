import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "../container";
import { Section } from ".";

const meta: Meta<typeof Section> = {
	title: "Layout/Section",
	component: Section,
	tags: ["autodocs"],
	argTypes: {
		spacing: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"],
			description: "수직 패딩 크기 — md/lg/xl은 뷰포트에 따라 반응형.",
		},
		bg: {
			control: "select",
			options: ["default", "dim", "accent", "navy", "transparent"],
			description: "배경 — default/dim/accent/navy(다크)/transparent.",
		},
		as: {
			control: "text",
			description: "렌더링할 HTML 요소 (기본 section).",
		},
		children: {
			control: false,
			description: "Section 내부 콘텐츠 (보통 Container).",
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
					"**Section** — 마케팅 페이지용 섹션 단위. **수직 여백**(`spacing`)과 **배경색**(`bg`) 조합으로 페이지 리듬 생성. 기본 `<section>` 시멘틱 태그.",
					"",
					"#### 역할",
					"Layout 프리미티브 중 **수직 리듬·배경**을 담당. 항상 내부에 `Container`를 두어 가로 폭 제한을 분리합니다.",
					"",
					"#### spacing (반응형)",
					"`md`/`lg`/`xl`은 뷰포트가 커질수록 단계적으로 증가합니다.",
					"",
					"| spacing | < 600 | ≥ 600 | ≥ 840 | ≥ 1200 |",
					"|---------|-------|-------|-------|--------|",
					"| `xs` | 32 | 32 | 32 | 32 |",
					"| `sm` | 48 | 48 | 48 | 48 |",
					"| `md` | 40 | 48 | 64 | 64 |",
					"| `lg` | 48 | 64 | 96 | 96 |",
					"| `xl` | 64 | 96 | 128 | 128 |",
					"",
					"#### bg",
					"- `default` — 흰 배경",
					"- `dim` — 옅은 회색 (Zebra 패턴용)",
					"- `accent` — 부드러운 네이비 강조",
					"- `navy` — 진한 네이비 + 자동 흰색 텍스트",
					"- `transparent` — 상위 배경 노출",
				].join("\n"),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 spacing/bg를 바꿔보세요.",
			},
		},
	},
	render: (args) => (
		<Section {...args}>
			<Container>
				<div style={{ textAlign: "center", padding: "0 16px" }}>
					<h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>
						spacing="{args.spacing}" · bg="{args.bg}"
					</h2>
					<p style={{ margin: 0, color: "inherit", opacity: 0.7 }}>
						Section 내부 — Container와 함께 사용하세요.
					</p>
				</div>
			</Container>
		</Section>
	),
};

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
