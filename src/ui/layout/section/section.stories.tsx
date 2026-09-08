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
			description: "수직 패딩 크기 - md/lg/xl은 뷰포트에 따라 반응형.",
		},
		bg: {
			control: "select",
			options: ["default", "dim", "accent", "inverted", "transparent"],
			description: "배경 - default/dim/accent/inverted(검정 반전)/transparent.",
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
					"**Section** - 마케팅 섹션 단위. 수직 여백 + 배경. 내부에 `Container` 권장.",
					"",
					"Spacing: `xs`/`sm`/`md` (기본)/`lg`/`xl` - md+ 는 뷰포트별 반응형.",
					"Bg: `default` / `dim` (Zebra) / `accent` (옅은 강조) / `inverted` (검정 배경 + 흰 텍스트 자동) / `transparent`.",
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
	parameters: {
		docs: {
			description: {
				story:
					"배경 다섯 가지 비교입니다. `dim` 은 섹션을 번갈아 칠하는 zebra 용, `accent` 는 옅은 강조, `inverted` 는 반전입니다.\n\n`inverted` 는 텍스트 색까지 함께 정해집니다(`accent-on-surface`). **다크 테마에서는 반전이 뒤집혀** 흰 배경 + 검정 텍스트가 되므로, 그 안에 색을 직접 박아 두지 마세요.",
			},
		},
	},
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
					<Content label='bg="accent"' />
				</Container>
			</Section>
			<Section bg="inverted" spacing="sm">
				<Container>
					<Content label='bg="inverted" (검정 + 흰 텍스트)' />
				</Container>
			</Section>
		</div>
	),
};

export const SpacingScale: Story = {
	name: "간격 비교",
	parameters: {
		docs: {
			description: {
				story:
					"`md`·`lg`·`xl` 은 뷰포트에 따라 값이 달라집니다 - 데스크탑 기준으로 고르고 모바일에서 확인하세요.\n\n섹션 사이 여백은 각 `Section` 이 자기 위아래를 갖는 구조라, 인접한 두 섹션 사이는 두 값이 더해집니다.",
			},
		},
	},
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
