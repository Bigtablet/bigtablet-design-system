import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from ".";

const meta: Meta<typeof Avatar> = {
	title: "Components/Display/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	argTypes: {
		src: { control: "text" },
		name: { control: "text" },
		size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
		shape: { control: "select", options: ["circle", "square"] },
		bgColor: { control: "text" },
	},
	args: { name: "박상민", size: "md", shape: "circle" },
	parameters: {
		docs: {
			description: {
				component: `
**Avatar** - User profile display. Image takes priority; falls back to \`name\` initials when missing or on load failure. / **Avatar** - 사용자 프로필. 이미지 우선, 실패/없으면 \`name\` initials fallback.

Sizes: \`xs\` 24 / \`sm\` 32 / \`md\` 40 / \`lg\` 48 / \`xl\` 64.
Shapes: \`circle\` (people) / \`square\` (brand). - **Shapes**: \`circle\` (사람) / \`square\` (브랜드).
Initials rule: 1 word → first letter, 2+ words → first letter of first + last word. / initials 규칙: 1단어 → 첫 글자, 2+단어 → 첫+마지막 단어 첫 글자.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
	args: {
		src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
		name: "John Doe",
	},
};

export const Initials: Story = {
	args: { name: "박상민" },
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Avatar name="S" size="xs" />
			<Avatar name="S" size="sm" />
			<Avatar name="S" size="md" />
			<Avatar name="S" size="lg" />
			<Avatar name="S" size="xl" />
		</div>
	),
};

export const Shapes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="C" shape="circle" size="lg" />
			<Avatar name="S" shape="square" size="lg" />
		</div>
	),
};

export const Fallback: Story = {
	name: "Fallback (이미지 실패)",
	args: { src: "/broken-path.jpg", name: "박상민" },
};
