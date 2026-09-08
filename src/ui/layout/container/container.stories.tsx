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
			description: "max-width - sm:640 / md:768 / lg:1024 / xl:1200 / full:100%",
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
					"**Container** - max-width 제한 + 반응형 좌우 패딩. 페이지 wrapper.",
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
	parameters: {
		docs: {
			description: {
				story:
					"`xl`(1200px)이 기본입니다. **좌우 패딩은 뷰포트에 따라 자동입니다** - 599px 이하 16px, 600 이상 24px, 840 이상 32px, 1200 이상 40px.\n\n그래서 `Container` 안에 다시 좌우 패딩을 주지 마세요 - 두 겹이 되어 좁은 화면에서 내용 폭이 크게 줄어듭니다.",
			},
		},
	},
	render: () => (
		<Container>
			<Box label="Container size=xl (max 1200px)" />
		</Container>
	),
};

export const Sizes: Story = {
	name: "크기 비교",
	parameters: {
		docs: {
			description: {
				story:
					"`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1200 / `full`(제한 없음). **읽는 글은 좁게, 표·대시보드는 넓게** 고릅니다 - 본문 한 줄이 너무 길면 눈이 줄을 놓칩니다.\n\n한 페이지 안에서는 섹션마다 같은 크기를 쓰는 편이 낫습니다. 섞으면 좌우 정렬선이 흔들립니다.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"`Section` 이 위아래 여백과 배경을, `Container` 가 최대 폭과 좌우 패딩을 갖는 기본 조합입니다.\n\n순서를 뒤집지 마세요 - `Container` 안에 `Section` 을 넣으면 배경색이 최대 폭 안에서만 칠해져 좌우가 잘린 띠처럼 보입니다.",
			},
		},
	},
	render: () => (
		<div style={{ background: "var(--bt-color-bg-solid-dim)", padding: "48px 0" }}>
			<Container size="lg">
				<Box label="Container inside Section" bg="#fff" />
			</Container>
		</div>
	),
};
