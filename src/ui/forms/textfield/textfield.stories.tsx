import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from ".";

const SearchIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
);

const CloseIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const meta: Meta<typeof TextField> = {
	title: "Components/Forms/TextField",
	component: TextField,
	tags: ["autodocs"],
	argTypes: {
		label: { control: "text" },
		showLabel: { control: "boolean" },
		supportingText: { control: "text" },
		error: { control: "boolean" },
		disabled: { control: "boolean" },
		fullWidth: { control: "boolean" },
		onChangeAction: { control: false },
	},
	args: { label: "Label", placeholder: "Input" },
	parameters: {
		docs: {
			description: {
				component: `
**TextField** — Single-line text input. Floating label + leading/trailing icon + supporting text. / **TextField** — 한 줄 텍스트 입력. 플로팅 라벨 + leading/trailing 아이콘 + supporting text.

Sizes: \`sm\` / \`md\` (default) / \`lg\`. / Sizes: \`sm\` / \`md\` (기본) / \`lg\`.
\`error\` → \`aria-invalid\` + \`aria-describedby\` set automatically. / \`error\` → \`aria-invalid\` + \`aria-describedby\` 자동.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {};

export const WithIcons: Story = {
	args: {
		label: "Search",
		placeholder: "Search…",
		leadingIcon: <SearchIcon />,
		trailingIcon: <CloseIcon />,
	},
};

export const ErrorState: Story = {
	name: "Error",
	args: {
		label: "Email",
		placeholder: "name@example.com",
		supportingText: "이메일 형식이 올바르지 않습니다.",
		error: true,
	},
};

export const DisabledState: Story = {
	name: "Disabled",
	args: { label: "이름", placeholder: "입력할 수 없습니다", disabled: true },
};

export const Clearable: Story = {
	args: {
		label: "Search",
		placeholder: "검색어를 입력하세요",
		defaultValue: "삭제 가능한 텍스트",
		clearable: true,
	},
};
