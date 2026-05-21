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
**Button** — 사용자 액션 트리거.

Variants: \`filled\` (주 액션) / \`tonal\` (부드러운 강조) / \`outline\` (보조) / \`text\` (인라인).
Sizes: \`sm\` 32 / \`md\` 40 / \`lg\` 48 / \`xl\` 56 (모바일 자동 한 단계 ↑).
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
