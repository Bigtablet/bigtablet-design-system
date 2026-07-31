import type { Meta, StoryObj } from "@storybook/react";
import { Button } from ".";

const PlusIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path d="M12 5v14M5 12h14" />
	</svg>
);

const meta: Meta<typeof Button> = {
	title: "Components/General/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: { control: "select", options: ["filled", "tonal", "outline", "text"] },
		size: { control: "select", options: ["sm", "md", "lg", "xl"] },
		disabled: { control: "boolean" },
		fullWidth: { control: "boolean" },
		onClick: { action: "clicked" },
	},
	args: { children: "Button", variant: "filled", size: "md" },
	parameters: {
		docs: {
			description: {
				component: `
**Button** - Triggers a user action. / **Button** - 사용자 액션 트리거.

Variants: \`filled\` (primary action / 주 액션) / \`tonal\` (soft emphasis / 부드러운 강조) / \`outline\` (secondary / 보조) / \`text\` (inline / 인라인).
Sizes: \`sm\` 32 / \`md\` 40 / \`lg\` 48 / \`xl\` 56 (auto-bumps one step up on mobile / 모바일 자동 한 단계 ↑).
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Filled: Story = { args: { variant: "filled" } };
export const Tonal: Story = { args: { variant: "tonal" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Text: Story = { args: { variant: "text" } };

/** 크기를 명시한 아이콘 — 슬롯이 크기를 강제하지 않으므로 넘긴 값이 그대로 렌더된다. */
const SizedPlusIcon = ({ size }: { size: number }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		aria-hidden="true"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

export const WithIcons: Story = {
	render: (args) => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button {...args} leadingIcon={<PlusIcon />}>
				Leading
			</Button>
			<Button {...args} trailingIcon={<PlusIcon />}>
				Trailing
			</Button>
			<Button {...args} leadingIcon={<PlusIcon />} trailingIcon={<PlusIcon />}>
				Both
			</Button>
		</div>
	),
	args: { variant: "filled" },
};

export const Disabled: Story = { args: { disabled: true } };

export const IconSizes: Story = {
	name: "Icon sizes / 아이콘 크기",
	render: (args) => (
		<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
			<Button {...args} leadingIcon={<SizedPlusIcon size={14} />}>
				14
			</Button>
			<Button {...args} leadingIcon={<SizedPlusIcon size={16} />}>
				16
			</Button>
			<Button {...args} leadingIcon={<SizedPlusIcon size={20} />}>
				20
			</Button>
			<Button {...args} leadingIcon={<PlusIcon />}>
				크기 미지정 (24)
			</Button>
		</div>
	),
	args: { variant: "filled" },
	parameters: {
		docs: {
			description: {
				story: `
아이콘 크기는 아이콘이 정한다 — 슬롯은 정렬만 맡는다. \`width\`/\`height\` 를 준 아이콘은 그 크기로,
주지 않은 아이콘(뷰박스만 있는 커스텀 svg)은 기본 24px 로 렌더된다.

라벨 옆 아이콘은 라벨 글자 크기에 맞추는 편이 무게가 맞는다 — \`sm\`/\`md\` 버튼이면 14~16 이 보통이다.
				`,
			},
		},
	},
};
