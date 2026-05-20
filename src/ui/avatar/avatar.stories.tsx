import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from ".";

const meta: Meta<typeof Avatar> = {
	title: "Components/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Avatar**는 프로필 표시. 이미지 우선, 실패/없으면 이름 initials로 fallback. 기본 색상은 Bigtablet navy.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
	name: "이미지",
	args: {
		src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
		name: "John Doe",
	},
};

export const Initials: Story = {
	name: "Initials (이미지 없음)",
	args: { name: "박상민" },
};

export const MultiWord: Story = {
	name: "여러 단어",
	args: { name: "Sangmin Park" },
};

export const Sizes: Story = {
	name: "사이즈 비교",
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
	name: "circle vs square",
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="C" shape="circle" size="lg" />
			<Avatar name="S" shape="square" size="lg" />
		</div>
	),
};

export const CustomColors: Story = {
	name: "커스텀 컬러",
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="N" bgColor="#47555E" />
			<Avatar name="S" bgColor="#7AA5D2" />
			<Avatar name="B" bgColor="#5A8DCB" />
			<Avatar name="D" bgColor="#303841" />
		</div>
	),
};

export const Fallback: Story = {
	name: "이미지 로드 실패 시",
	args: { src: "/broken-path.jpg", name: "박상민" },
};
