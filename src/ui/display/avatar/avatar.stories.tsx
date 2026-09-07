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
**Avatar** - 사용자 프로필 표시. 이미지가 우선이고, 없거나 로드에 실패하면 \`name\` 의 initials 로 대체한다.

크기: \`xs\` 24 / \`sm\` 32 / \`md\` 40 / \`lg\` 48 / \`xl\` 64.
모양: \`circle\` (사람) / \`square\` (브랜드).
initials 규칙: 1단어면 첫 글자, 2단어 이상이면 첫 단어와 마지막 단어의 첫 글자.
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
	parameters: {
		docs: {
			description: {
				story:
					'`circle` 은 사람, `square` 는 브랜드·조직입니다. 한 화면에서 둘을 섞으면 "사람인지 회사인지"가 모양으로 읽히므로, 목록 안에서는 한쪽으로 통일하세요.',
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="C" shape="circle" size="lg" />
			<Avatar name="S" shape="square" size="lg" />
		</div>
	),
};

export const Fallback: Story = {
	name: "Fallback (이미지 실패)",
	parameters: {
		docs: {
			description: {
				story:
					"이미지 URL 이 깨졌을 때의 모습입니다. `name` 을 함께 넘겨 두면 이니셜로 대체되어 **빈 회색 원이 남지 않습니다.**\n\n이미지를 쓰든 안 쓰든 `name` 은 항상 넘기세요 - 대체 표시와 접근성 이름을 같이 담당합니다.",
			},
		},
	},
	args: { src: "/broken-path.jpg", name: "박상민" },
};
