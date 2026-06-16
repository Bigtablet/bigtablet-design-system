import type { Meta, StoryObj } from "@storybook/react";
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
		variant: { control: "select", options: ["default", "accent"] },
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
**Card** — Container that groups related content into a single block. / 콘텐츠를 한 덩어리로 묶는 컨테이너.

Variants: \`default\` / \`accent\` (navy bg + white text). — \`accent\` (navy bg + 흰 텍스트).
Key props: \`heading\`, \`shadow\` (none/sm/md/lg), \`padding\` (none/sm/md/lg), \`bordered\`. / 주요 prop.
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
