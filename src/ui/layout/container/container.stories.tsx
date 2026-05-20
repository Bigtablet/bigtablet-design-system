import type { Meta, StoryObj } from "@storybook/react";
import { Container } from ".";

const meta: Meta<typeof Container> = {
	title: "Layout/Container",
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
					"**Container** — `max-width` 제한 + **반응형 수평 패딩**. 모든 페이지 섹션의 기본 wrapper.",
					"",
					"#### 역할",
					"4개 Layout 프리미티브 중 **수평 정렬**을 담당. 가로 폭 제한과 좌우 패딩만 책임지고, 수직 spacing/배경은 `Section`이, 자식 정렬은 `Stack`/`Grid`가 맡습니다.",
					"",
					"#### size 선택",
					"- `sm` (640) — 좁은 폼·온보딩",
					"- `md` (768) — 블로그 본문·아티클",
					"- `lg` (1024) — 일반 서비스 페이지",
					"- `xl` (1200, 기본) — 마케팅 페이지·대시보드",
					"- `full` — 풀-블리드 (좌우 패딩은 유지)",
					"",
					"#### 반응형 패딩",
					"`< 600px` 16px · `≥ 600px` 24px · `≥ 840px` 32px · `≥ 1200px` 40px — size에 무관하게 자동 적용됩니다.",
				].join("\n"),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 size/center를 바꿔보세요.",
			},
		},
	},
	render: (args) => (
		<Container {...args}>
			<div
				style={{
					background: "#E5F0FF",
					padding: "24px",
					borderRadius: "8px",
					fontSize: "14px",
					fontWeight: 600,
					color: "#303841",
					textAlign: "center",
				}}
			>
				Container size="{args.size}" {args.center ? "(centered)" : "(left)"}
			</div>
		</Container>
	),
};

const Box = ({ label, bg = "#E5F0FF" }: { label: string; bg?: string }) => (
	<div
		style={{
			background: bg,
			padding: "24px",
			borderRadius: "8px",
			fontSize: "14px",
			fontWeight: 600,
			color: "#303841",
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
		<div style={{ background: "#F2F5F8", padding: "48px 0" }}>
			<Container size="lg">
				<Box label="Container inside Section" bg="#fff" />
			</Container>
		</div>
	),
};
