import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../general/button";
import { Card } from ".";

const meta: Meta<typeof Card> = {
	title: "Components/Display/Card",
	component: Card,
	tags: ["autodocs"],
	argTypes: {
		heading: { control: "text" },
		headingAs: { control: "select", options: ["h2", "h3", "h4", "h5", "h6"] },
		shadow: { control: "select", options: ["none", "sm", "md", "lg"] },
		padding: { control: "select", options: ["none", "sm", "md", "lg"] },
		bordered: { control: "boolean" },
		variant: { control: "select", options: ["default", "accent", "glass", "outlined"] },
		interactive: { control: "boolean" },
		footerAlign: { control: "select", options: ["start", "between", "end"] },
		footer: { control: false },
		children: { control: false },
		className: { control: false },
	},
	args: {
		heading: "Card Title",
		shadow: "sm",
		padding: "md",
		bordered: false,
		children: <p style={{ margin: 0 }}>내용이 들어가는 영역입니다.</p>,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Card** - Container that groups related content into a single block. / **Card** - 콘텐츠를 한 덩어리로 묶는 컨테이너.

**Variants**: \`default\` / \`accent\` (navy bg + white text) / \`glass\` (frosted + backdrop blur, use over colored/image backgrounds) / \`outlined\` (transparent bg + border only). / \`accent\`(navy + 흰 텍스트) · \`glass\`(반투명 blur, 컬러/이미지 배경 위 권장) · \`outlined\`(투명 + 테두리).

**Composition**: \`heading\` (header) + children (body) + \`footer\` (with \`footerAlign\` start/between/end). \`interactive\` adds a hover-lift for clickable cards. / \`heading\`+body+\`footer\` 3단 + \`interactive\` hover-lift.

Other props: \`shadow\` (none/sm/md/lg), \`padding\` (none/sm/md/lg), \`bordered\`.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {};

export const AccentVariant: Story = {
	name: "Accent (navy)",
	args: {
		variant: "accent",
		heading: "주요 강조 카드",
		children: <p style={{ margin: 0 }}>navy 배경 + 흰 텍스트. CTA/주요 정보용.</p>,
	},
};

export const Bordered: Story = {
	args: { bordered: true, shadow: "none", heading: "Bordered" },
};

export const LargeShadow: Story = {
	name: "Shadow lg + padding lg",
	args: { shadow: "lg", padding: "lg", heading: "강조 카드" },
};

export const Variants: Story = {
	name: "Variants 비교",
	parameters: { controls: { disable: true } },
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, minmax(200px, 1fr))",
				gap: 24,
				// glass 가시화를 위한 컬러 그라데이션 배경
				padding: 32,
				borderRadius: 16,
				background: "linear-gradient(135deg, #6d83f2 0%, #a86df2 100%)",
			}}
		>
			<Card variant="default" heading="default">
				<p style={{ margin: 0 }}>기본 흰 배경 카드.</p>
			</Card>
			<Card variant="accent" heading="accent">
				<p style={{ margin: 0 }}>navy 배경 + 흰 텍스트.</p>
			</Card>
			<Card variant="glass" heading="glass">
				<p style={{ margin: 0 }}>반투명 frosted + blur. 컬러 배경 위에서 빛남.</p>
			</Card>
			<Card variant="outlined" heading="outlined">
				<p style={{ margin: 0 }}>투명 배경 + 테두리만.</p>
			</Card>
		</div>
	),
};

export const Interactive: Story = {
	name: "Interactive (hover-lift)",
	args: {
		interactive: true,
		heading: "클릭 가능한 카드",
		children: <p style={{ margin: 0 }}>마우스를 올리면 살짝 떠오릅니다.</p>,
	},
};

export const WithFooter: Story = {
	name: "Footer 슬롯",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
			<Card
				heading="footerAlign=end (기본)"
				footer={
					<>
						<Button variant="text" size="sm">
							취소
						</Button>
						<Button size="sm">저장</Button>
					</>
				}
			>
				<p style={{ margin: 0 }}>header / body / footer 3단 구성.</p>
			</Card>
			<Card
				heading="footerAlign=between"
				footerAlign="between"
				footer={
					<>
						<span style={{ color: "var(--bt-color-text-caption)", fontSize: 13 }}>
							2026-06-16
						</span>
						<Button size="sm" variant="outline">
							자세히
						</Button>
					</>
				}
			>
				<p style={{ margin: 0 }}>메타 정보 + 액션을 양끝 정렬.</p>
			</Card>
		</div>
	),
};
